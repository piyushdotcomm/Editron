"use client";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

import { transformToWebContainerFormat } from "../hooks/transformer";
import {
  CheckCircle,
  Loader2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Monitor,
  Tablet,
  Smartphone,
  Globe,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { TerminalRef } from "./terminal";
// import { Input } from "@/components/ui/input";

const TerminalComponent = dynamic(() => import("./terminal"), { ssr: false });

import { WebContainer } from "@webcontainer/api";
import { TemplateFolder } from "@/modules/playground/lib/path-to-json";

interface WebContainerPreviewProps {
  templateData: TemplateFolder;
  serverUrl: string;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  forceResetup?: boolean; // Optional prop to force re-setup
}
const WebContainerPreview = ({
  templateData,
  error,
  instance,
  isLoading,
  serverUrl : _serverUrl,
  writeFileSync : _writeFileSync,
  forceResetup = false,
}: WebContainerPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );
  const [_loadingState, setLoadingState] = useState({
    transforming: false,
    mounting: false,
    installing: false,
    starting: false,
    ready: false,
  });
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [_isSetupInProgress, setIsSetupInProgress] = useState(false);
  const [installProgress, setInstallProgress] = useState({
    totalDeps: 0,
    installedPackages: 0,
    progressPercent: 0,
    statusText: "",
  });

  const terminalRef = useRef<TerminalRef | null>(null);
  const setupInProgressRef = useRef(false);

  // Helper to count dependencies from package.json content
  const countDependencies = (pkgContent: string): number => {
    try {
      const pkg = JSON.parse(pkgContent);
      const deps = Object.keys(pkg.dependencies || {}).length;
      const devDeps = Object.keys(pkg.devDependencies || {}).length;
      return deps + devDeps;
    } catch {
      return 0;
    }
  };

  const createInstallOutputStream = (_totalDeps: number) => {
    let estimatedProgress = 0;
    let lastUpdateTime = Date.now();

    return new WritableStream({
      write(data: string) {
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(data);
        } else {
          console.log("[WebContainer Install] ", data.trim());
        }

        const now = Date.now();
        // Throttle state updates to at most once every 100ms
        const shouldUpdate = now - lastUpdateTime > 100;

        // Parse npm output for progress signals
        const addedMatch = data.match(/added (\d+) packages?/i);
        if (addedMatch) {
          const added = parseInt(addedMatch[1], 10);
          setInstallProgress((prev) => ({
            ...prev,
            installedPackages: added,
            progressPercent: 100,
            statusText: `Installed ${added} packages`,
          }));
          lastUpdateTime = now;
          return;
        }

        if (!shouldUpdate) return;

        // Detect resolution / reify / etc. phases
        if (data.includes("reify:") || data.includes("idealTree")) {
          estimatedProgress = Math.min(estimatedProgress + 2, 85);
          setInstallProgress((prev) => ({
            ...prev,
            progressPercent: estimatedProgress,
            statusText: "Resolving dependency tree...",
          }));
          lastUpdateTime = now;
        } else if (data.includes("http fetch") || data.includes("GET ")) {
          estimatedProgress = Math.min(estimatedProgress + 1, 70);
          setInstallProgress((prev) => ({
            ...prev,
            progressPercent: estimatedProgress,
            statusText: "Fetching packages...",
          }));
          lastUpdateTime = now;
        } else if (data.includes("WARN") || data.includes("warn")) {
          // Don't update progress on warnings
        } else if (data.trim().length > 0 && estimatedProgress < 90) {
          estimatedProgress = Math.min(estimatedProgress + 0.5, 90);
          setInstallProgress((prev) => ({
            ...prev,
            progressPercent: Math.round(estimatedProgress),
          }));
          lastUpdateTime = now;
        }
      },
    });
  };

  // Helper to detect package manager
  const detectPackageManager = async (
    instance: WebContainer,
  ): Promise<"npm" | "yarn" | "pnpm"> => {
    try {
      if (
        await instance.fs.readFile("pnpm-lock.yaml", "utf8").catch(() => null)
      )
        return "pnpm";
      if (await instance.fs.readFile("yarn.lock", "utf8").catch(() => null))
        return "yarn";
      return "npm"; // Default
    } catch {
      return "npm";
    }
  };

  // Helper to determine the best start script and command
  const resolveStartCommand = async (
    instance: WebContainer,
    pkgManager: string,
    packageJsonString: string,
  ) => {
    try {
      const pkg = JSON.parse(packageJsonString);
      const scripts = pkg.scripts || {};

      // Check for monorepo configuration
      let isMonorepo = false;
      let workspaces: string[] = [];

      if (pkg.workspaces) {
        isMonorepo = true;
        workspaces = Array.isArray(pkg.workspaces)
          ? pkg.workspaces
          : pkg.workspaces.packages || [];
      } else {
        const pnpmWorkspace = await instance.fs
          .readFile("pnpm-workspace.yaml", "utf8")
          .catch(() => null);
        if (pnpmWorkspace) {
          isMonorepo = true;
          // Simple regex to extract packages from yaml
          const matches = [
            ...pnpmWorkspace.matchAll(/-\s+['"]?([^'"\n]+)['"]?/g),
          ];
          workspaces = matches.map((m) => m[1]);
        }
      }

      if (isMonorepo && workspaces.length > 0) {
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(
            `\x1b[36mℹ Detected monorepo structure with package manager: ${pkgManager}\x1b[0m\r\n`,
          );
        }

        // Find the most likely frontend workspace (client, web, app, frontend)
        // const frontendKeywords = ["client", "web", "app", "ui", "frontend", "docs"];
        let bestWorkspaceDir = "";
        let bestScript = "";
        let bestWorkspaceName = "";

        // Since workspaces often have globs (e.g., "apps/*", "packages/*"), we check common directories
        const dirsToCheck = [
          "client",
          "web",
          "app",
          "frontend",
          "apps/web",
          "apps/client",
          "packages/web",
        ];

        for (const dir of dirsToCheck) {
          try {
            const childPkgContent = await instance.fs.readFile(
              `${dir}/package.json`,
              "utf8",
            );
            const childPkg = JSON.parse(childPkgContent);
            const childScripts = childPkg.scripts || {};

            if (childScripts.dev || childScripts.start || childScripts.serve) {
              bestWorkspaceDir = dir;
              bestWorkspaceName = childPkg.name || dir;
              bestScript = childScripts.dev
                ? "dev"
                : childScripts.start
                  ? "start"
                  : "serve";
              break;
            }
          } catch {}
        }

        if (bestWorkspaceDir && bestScript) {
          if (terminalRef.current?.writeToTerminal) {
            terminalRef.current.writeToTerminal(
              `\x1b[36mℹ Found frontend workspace: ${bestWorkspaceDir} (script: ${bestScript})\x1b[0m\r\n`,
            );
          }

          if (pkgManager === "pnpm" && bestWorkspaceName) {
            return {
              cmd: "pnpm",
              args: ["--filter", bestWorkspaceName, "run", bestScript],
            };
          } else if (pkgManager === "yarn") {
            return {
              cmd: "yarn",
              args: ["workspace", bestWorkspaceName, "run", bestScript],
            };
          } else {
            return {
              cmd: "npm",
              args: ["run", bestScript, "--workspace=" + bestWorkspaceName],
            };
          }
        }
      }

      // Standard single-package resolution: Prefer dev over start for frontend tools
      if (scripts.dev) return { cmd: pkgManager, args: ["run", "dev"] };
      if (scripts.start) return { cmd: pkgManager, args: ["run", "start"] };
      if (scripts.serve) return { cmd: pkgManager, args: ["run", "serve"] };

      return { cmd: pkgManager, args: ["run", "start"] }; // Fallback
    } catch {
      return { cmd: pkgManager, args: ["run", "start"] };
    }
  };

  // Reset setup state when forceResetup changes
  useEffect(() => {
    if (forceResetup) {
      setIsSetupComplete(false);
      setIsSetupInProgress(false);
      setupInProgressRef.current = false;
      setPreviewUrl("");
      setCurrentStep(0);
      setLoadingState({
        transforming: false,
        mounting: false,
        installing: false,
        starting: false,
        ready: false,
      });
    }
  }, [forceResetup]);

  useEffect(() => {
    async function setupContainer() {
      if (!instance || isSetupComplete || setupInProgressRef.current) return;

      try {
        setupInProgressRef.current = true;
        setIsSetupInProgress(true);
        setSetupError(null);

        try {
          const packageJsonExists = await instance.fs.readFile(
            "package.json",
            "utf8",
          );

          if (packageJsonExists) {
            // Files are already mounted, restart the server
            if (terminalRef.current?.writeToTerminal) {
              terminalRef.current.writeToTerminal(
                "🔄 Reconnecting to existing WebContainer session...\r\n",
              );
            }

            instance.on("server-ready", (port: number, url: string) => {
              if (terminalRef.current?.writeToTerminal) {
                terminalRef.current.writeToTerminal(
                  `🌐 Server ready at ${url} (port ${port})\r\n`,
                );
              }

              const isCommonFrontendPort = [
                3000, 5173, 8080, 4200, 8000,
              ].includes(port);
              setPreviewUrl((prevUrl) => {
                if (prevUrl && !isCommonFrontendPort) return prevUrl;
                return url;
              });

              setLoadingState((prev) => ({
                ...prev,
                starting: false,
                ready: true,
              }));
              setIsSetupComplete(true);
              setIsSetupInProgress(false);
              setupInProgressRef.current = false;
            });

            setCurrentStep(3);
            setLoadingState((prev) => ({ ...prev, installing: true }));

            // Detect Package Manager
            const pkgManager = await detectPackageManager(instance);

            // Reinstall dependencies first (ensures local CLIs like ng, vite are available)
            // Count deps for progress bar
            let reconnectTotalDeps = 0;
            let pkgContent = "";
            try {
              pkgContent = await instance.fs.readFile("package.json", "utf8");
              reconnectTotalDeps = countDependencies(pkgContent);
            } catch {}
            setInstallProgress({
              totalDeps: reconnectTotalDeps,
              installedPackages: 0,
              progressPercent: 0,
              statusText: "Starting install...",
            });

            if (terminalRef.current?.writeToTerminal) {
              terminalRef.current.writeToTerminal(
                `📦 Reinstalling dependencies using \x1b[33m${pkgManager}\x1b[0m (${reconnectTotalDeps} packages)...\r\n`,
              );
            }

            const installArgs =
              pkgManager === "npm"
                ? ["install", "--no-audit", "--no-fund", "--legacy-peer-deps"]
                : ["install"];
            const reinstallProcess = await instance.spawn(
              pkgManager,
              installArgs,
            );
            reinstallProcess.output.pipeTo(
              createInstallOutputStream(reconnectTotalDeps),
            );
            const reinstallExitCode = await reinstallProcess.exit;
            if (reinstallExitCode !== 0) {
              if (terminalRef.current?.writeToTerminal) {
                terminalRef.current.writeToTerminal(
                  `⚠️ ${pkgManager} install exited with code ${reinstallExitCode}, attempting to start anyway...\r\n`,
                );
              }
            } else {
              if (terminalRef.current?.writeToTerminal) {
                terminalRef.current.writeToTerminal(
                  "✅ Dependencies ready\r\n",
                );
              }
            }

            setLoadingState((prev) => ({
              ...prev,
              installing: false,
              starting: true,
            }));
            setCurrentStep(4);

            // Now restart the server
            const startCommand = await resolveStartCommand(
              instance,
              pkgManager,
              pkgContent,
            );

            if (terminalRef.current?.writeToTerminal) {
              terminalRef.current.writeToTerminal(
                `🚀 Restarting development server via \x1b[32m${startCommand.cmd} ${startCommand.args.join(" ")}\x1b[0m...\r\n`,
              );
            }
            const startProcess = await instance.spawn(
              startCommand.cmd,
              startCommand.args,
            );
            startProcess.output.pipeTo(
              new WritableStream({
                write(data) {
                  if (terminalRef.current?.writeToTerminal) {
                    terminalRef.current.writeToTerminal(data);
                  }
                },
              }),
            );
            return;
          }
        } catch {}

        // Step-1 transform data
        setLoadingState((prev) => ({ ...prev, transforming: true }));
        setCurrentStep(1);
        // Write to terminal
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(
            "🔄 Transforming template data...\r\n",
          );
        }

        // @ts-ignore
        const files = transformToWebContainerFormat(templateData);
        setLoadingState((prev) => ({
          ...prev,
          transforming: false,
          mounting: true,
        }));
        setCurrentStep(2);

        //  Step-2 Mount Files

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(
            "📁 Mounting files to WebContainer...\r\n",
          );
        }
        await instance.mount(files);

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(
            "✅ Files mounted successfully\r\n",
          );
        }

        // Check if package.json exists, if not create a default one for static serving
        try {
          const packageJsonContent = await instance.fs
            .readFile("package.json", "utf8")
            .catch(() => null);

          if (!packageJsonContent) {
            if (terminalRef.current?.writeToTerminal) {
              terminalRef.current.writeToTerminal(
                "⚠️ No package.json found. Creating default configuration for static site...\r\n",
              );
            }
            await instance.fs.writeFile(
              "package.json",
              JSON.stringify(
                {
                  name: "static-project",
                  version: "1.0.0",
                  scripts: {
                    start: "npx servor --reload",
                  },
                  dependencies: {
                    servor: "^4.0.2",
                  },
                },
                null,
                2,
              ),
            );
          } else {
            // Check for missing start script and try to auto-fix
            try {
              const pkg = JSON.parse(packageJsonContent);
              if (!pkg.scripts || !pkg.scripts.start) {
                const commonEntries = [
                  "index.js",
                  "server.js",
                  "app.js",
                  "main.js",
                  "src/index.js",
                  "src/server.js",
                  "src/app.js",
                  "src/main.js",
                ];
                let entryFile = null;

                for (const entry of commonEntries) {
                  try {
                    const exists = await instance.fs
                      .readFile(entry)
                      .catch(() => null);
                    if (exists) {
                      entryFile = entry;
                      break;
                    }
                  } catch {}
                }

                if (entryFile) {
                  if (terminalRef.current?.writeToTerminal) {
                    terminalRef.current.writeToTerminal(
                      `⚠️ No start script found. Auto-detected entry point: ${entryFile}. Injecting start script...\r\n`,
                    );
                  }

                  pkg.scripts = pkg.scripts || {};
                  pkg.scripts.start = `node ${entryFile}`;

                  await instance.fs.writeFile(
                    "package.json",
                    JSON.stringify(pkg, null, 2),
                  );
                } else {
                  // Check for client/server monorepo structure
                  const hasClient = await instance.fs
                    .readFile("client/package.json", "utf8")
                    .catch(() => null);
                  const hasServer = await instance.fs
                    .readFile("server/package.json", "utf8")
                    .catch(() => null);

                  if (hasClient || hasServer) {
                    const workspaces = [];
                    if (hasClient) workspaces.push("client");
                    if (hasServer) workspaces.push("server");

                    pkg.workspaces = workspaces;
                    pkg.scripts = pkg.scripts || {};

                    // Construct start script
                    // Helper to find valid script
                    const getScript = (pkgJson: string | null) => {
                      if (!pkgJson) return null;
                      try {
                        const parsed = JSON.parse(pkgJson);
                        return parsed.scripts?.dev
                          ? "dev"
                          : parsed.scripts?.start
                            ? "start"
                            : null;
                      } catch {
                        return null;
                      }
                    };

                    const clientScript = getScript(hasClient);
                    const serverScript = getScript(hasServer);

                    // Construct start script
                    if (
                      hasClient &&
                      hasServer &&
                      clientScript &&
                      serverScript
                    ) {
                      // Attempt to start client last to capture its port, or use a tool like concurrently if available.
                      // For now, valid method is:
                      pkg.scripts.start = `npm run ${serverScript} --prefix server & npm run ${clientScript} --prefix client`;
                    } else if (hasClient && clientScript) {
                      pkg.scripts.start = `npm run ${clientScript} --prefix client`;
                    } else if (hasServer && serverScript) {
                      pkg.scripts.start = `npm run ${serverScript} --prefix server`;
                    } else {
                      // Fallback
                      pkg.scripts.start = "echo 'No runnable scripts found'";
                    }

                    if (terminalRef.current?.writeToTerminal) {
                      terminalRef.current.writeToTerminal(
                        `⚠️ Detected monorepo structure (${workspaces.join(", ")}). Configuring workspaces and start script...\r\n`,
                      );
                    }

                    // Ensure name and version exist for valid workspace root
                    if (!pkg.name) pkg.name = "monorepo-root";
                    if (!pkg.version) pkg.version = "1.0.0";

                    await instance.fs.writeFile(
                      "package.json",
                      JSON.stringify(pkg, null, 2),
                    );
                  }
                }
              }
            } catch (e) {
              console.error("Error parsing/patching package.json:", e);
            }
          }
        } catch (error) {
          console.error("Error checking/creating package.json:", error);
        }

        setLoadingState((prev) => ({
          ...prev,
          mounting: false,
          installing: true,
        }));
        setCurrentStep(3);

        // Step-3 Install dependencies
        const pkgManager = await detectPackageManager(instance);

        // Count total dependencies for progress bar
        let totalDeps = 0;
        let pckgContent = "";
        try {
          pckgContent = await instance.fs.readFile("package.json", "utf8");
          totalDeps = countDependencies(pckgContent);
        } catch {}
        setInstallProgress({
          totalDeps,
          installedPackages: 0,
          progressPercent: 0,
          statusText: "Starting install...",
        });

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(
            `📦 Installing dependencies using \x1b[33m${pkgManager}\x1b[0m (${totalDeps} packages)...\r\n`,
          );
        }

        // Prefer npm ci (reads lockfile, skips registry metadata = no JSON truncation in WebContainer)
        // Fall back to npm install if no lockfile is present
        let freshInstallArgs: string[];
        if (pkgManager === "npm") {
          const hasLockfile = await instance.fs
            .readFile("package-lock.json", "utf8")
            .catch(() => null);
          if (hasLockfile) {
            freshInstallArgs = ["ci", "--no-audit", "--no-fund"];
            if (terminalRef.current?.writeToTerminal) {
              terminalRef.current.writeToTerminal(
                "🔒 Lockfile found — using \x1b[32mnpm ci\x1b[0m for faster, reliable install...\r\n",
              );
            }
          } else {
            freshInstallArgs = [
              "install",
              "--no-audit",
              "--no-fund",
              "--legacy-peer-deps",
            ];
          }
        } else {
          freshInstallArgs = ["install"];
        }
        const installProcess = await instance.spawn(
          pkgManager,
          freshInstallArgs,
        );

        installProcess.output.pipeTo(createInstallOutputStream(totalDeps));

        const installExitCode = await installProcess.exit;

        if (installExitCode !== 0) {
          if (terminalRef.current?.writeToTerminal) {
            terminalRef.current.writeToTerminal(
              `⚠️ Dependencies install exited with code ${installExitCode}, attempting to start anyway...\r\n`,
            );
          }
          console.warn(`npm install exited with code ${installExitCode}`);
        } else {
          if (terminalRef.current?.writeToTerminal) {
            terminalRef.current.writeToTerminal(
              "✅ Dependencies installed successfully\r\n",
            );
          }
        }

        setLoadingState((prev) => ({
          ...prev,
          installing: false,
          starting: true,
        }));
        setCurrentStep(4);

        // STEP-4 Start The Server

        const startCommand = await resolveStartCommand(
          instance,
          pkgManager,
          pckgContent,
        );

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(
            `🚀 Starting development server via \x1b[32m${startCommand.cmd} ${startCommand.args.join(" ")}\x1b[0m...\r\n`,
          );
        }

        const startProcess = await instance.spawn(
          startCommand.cmd,
          startCommand.args,
        );

        instance.on("server-ready", (port: number, url: string) => {
          // todo: Terminal logic
          if (terminalRef.current?.writeToTerminal) {
            terminalRef.current.writeToTerminal(
              `🌐 Server ready at ${url} (port ${port})\r\n`,
            );
          }

          // Heuristic: Prefer port 5173 (Vite) or 3000 (Create React App / Next.js) over others (often backend)
          // valid ports for frontend usually: 3000, 3001, 3002, 5173, 5174, 8080, 4200 (Angular), 8000 (Gatsby)
          const isCommonFrontendPort = [3000, 5173, 8080, 4200, 8000].includes(
            port,
          );

          setPreviewUrl((prevUrl) => {
            // If we already have a URL and the new one isn't a "common frontend port", ignore it to avoid backend overriding frontend
            if (prevUrl && !isCommonFrontendPort) return prevUrl;
            return url;
          });

          setLoadingState((prev) => ({
            ...prev,
            starting: false,
            ready: true,
          }));
          setIsSetupComplete(true);
          setIsSetupInProgress(false);
          setupInProgressRef.current = false;
        });

        // Handle start process output - stream to terminal
        startProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              if (terminalRef.current?.writeToTerminal) {
                terminalRef.current.writeToTerminal(data);
              }
            },
          }),
        );
      } catch (err) {
        console.error("Error setting up container:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(`❌ Error: ${errorMessage}\r\n`);
        }
        setSetupError(errorMessage);
        setIsSetupInProgress(false);
        setupInProgressRef.current = false;
        setLoadingState({
          transforming: false,
          mounting: false,
          installing: false,
          starting: false,
          ready: false,
        });
      }
    }

    setupContainer();
    // Only re-run when instance or templateData changes, NOT on isSetupInProgress changes
  }, [instance, templateData, isSetupComplete]);

  useEffect(() => {
    return () => {};
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-6 rounded-lg bg-gray-50 dark:bg-gray-900">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <h3 className="text-lg font-medium">Initializing WebContainer</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Setting up the environment for your project...
          </p>
        </div>
      </div>
    );
  }

  if (error || setupError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg max-w-md">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-5 w-5" />
            <h3 className="font-semibold">Error</h3>
          </div>
          <p className="text-sm">{error || setupError}</p>
        </div>
      </div>
    );
  }
  const getStepIcon = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (stepIndex === currentStep) {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    } else {
      return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepText = (stepIndex: number, label: string) => {
    const isActive = stepIndex === currentStep;
    const isComplete = stepIndex < currentStep;

    return (
      <span
        className={`text-sm font-medium ${
          isComplete
            ? "text-green-600"
            : isActive
              ? "text-blue-600"
              : "text-gray-500"
        }`}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="h-full w-full flex flex-col">
      {!previewUrl ? (
        <div className="h-full flex flex-col">
          <div className="w-full max-w-md p-6 m-5 rounded-lg bg-white dark:bg-zinc-800 shadow-sm mx-auto">
            <Progress
              value={(currentStep / totalSteps) * 100}
              className="h-2 mb-6"
            />

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                {getStepIcon(1)}
                {getStepText(1, "Transforming template data")}
              </div>
              <div className="flex items-center gap-3">
                {getStepIcon(2)}
                {getStepText(2, "Mounting files")}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {getStepIcon(3)}
                  {getStepText(3, "Installing dependencies")}
                </div>
                {currentStep === 3 && (
                  <div className="ml-8 space-y-1.5">
                    <Progress
                      value={installProgress.progressPercent}
                      className="h-1.5"
                    />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {installProgress.statusText || "Preparing..."}
                      </span>
                      <span className="font-mono">
                        {installProgress.progressPercent}%
                      </span>
                    </div>
                    {installProgress.totalDeps > 0 && (
                      <span className="text-[11px] text-muted-foreground/60">
                        {installProgress.totalDeps} direct dependencies
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {getStepIcon(4)}
                {getStepText(4, "Starting development server")}
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className="flex-1 p-4">
            {
              <TerminalComponent
                ref={terminalRef}
                webContainerInstance={instance}
                theme="dark"
                className="h-full"
              />
            }
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col min-h-0 bg-background">
          {/* Top Bar (Browser Controls) */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#f8f9fa] dark:bg-[#18181a] border-b border-border/40 drag-handle">
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:bg-[#ff5f56]/80 cursor-pointer shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:bg-[#ffbd2e]/80 cursor-pointer shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] hover:bg-[#27c93f]/80 cursor-pointer shadow-sm" />
              </div>

              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-md hover:bg-muted/60 text-muted-foreground transition-colors"
                  onClick={() => setRefreshKey((k) => k + 1)}
                  title="Refresh preview"
                >
                  <RefreshCw
                    size={13}
                    className={
                      isLoading ? "animate-spin text-primary" : ""
                    }
                  />
                </Button>
              </div>
            </div>

            {/* URL Bar (Safari/Chrome style) */}
            <div className="flex-1 max-w-md mx-4">
              <div className="flex items-center justify-center gap-1.5 bg-background shadow-sm border rounded-lg px-3 h-7 mx-auto transition-all focus-within:ring-1 focus-within:ring-primary/20 hover:border-border cursor-text group">
                <Globe className="h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground shrink-0 transition-colors" />
                <span className="text-[11px] font-medium text-foreground/80 truncate font-mono select-all">
                  {previewUrl || "starting preview..."}
                </span>
              </div>
            </div>

            {/* Viewport Toggles & External Link (Right aligned) */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center p-0.5 bg-muted/30 border rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={() => setViewport("desktop")}
                  className={`h-6 w-7 flex items-center justify-center rounded-md transition-all ${viewport === "desktop" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label="Desktop viewport"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <div className="w-px h-3 bg-border/50 mx-0.5" />
                <button
                  onClick={() => setViewport("tablet")}
                  className={`h-6 w-7 flex items-center justify-center rounded-md transition-all ${viewport === "tablet" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label="Tablet viewport"
                >
                  <Tablet className="h-3.5 w-3.5" />
                </button>
                <div className="w-px h-3 bg-border/50 mx-0.5" />
                <button
                  onClick={() => setViewport("mobile")}
                  className={`h-6 w-7 flex items-center justify-center rounded-md transition-all ${viewport === "mobile" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label="Mobile viewport"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-md hover:bg-muted/60 text-muted-foreground transition-colors"
                onClick={() => {
                  const url = `/preview?url=${encodeURIComponent(previewUrl)}`;
                  window.open(url, "_blank");
                }}
                title="Open preview in new tab"
              >
                <ExternalLink size={13} />
              </Button>
            </div>
          </div>

          {/* Preview Iframe Container */}
          <div className="flex-1 min-h-0 flex items-center justify-center bg-[#f0f0f0] dark:bg-[#0c0c0e] overflow-hidden relative">
            <div
              className="h-full relative transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] bg-background flex flex-col shadow-xl"
              style={{
                width:
                  viewport === "mobile"
                    ? "375px"
                    : viewport === "tablet"
                      ? "768px"
                      : "100%",
                maxWidth: "100%",
              }}
            >
              {viewport !== "desktop" && (
                <div className="h-6 bg-muted/50 border-b flex items-center justify-center shrink-0">
                  <div className="w-16 h-1 rounded-full bg-border" />
                </div>
              )}
              <iframe
                key={refreshKey}
                src={previewUrl}
                className="w-full h-full border-none bg-white block flex-1"
                title="WebContainer Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>
          </div>

          {/* Terminal Section */}
          <div className="h-[30vh] min-h-[150px] max-h-[80vh] border-t border-border/40 shrink-0 relative bg-background">
            <TerminalComponent
              ref={terminalRef}
              webContainerInstance={instance}
              theme="dark"
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WebContainerPreview;
