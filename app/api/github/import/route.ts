import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/api-utils";
import {
  buildTemplateFolderFromEntries,
  getMonorepoCandidates,
  hasPackageJson,
  parseGitHubRepoUrl,
  type GitHubContentEntry,
  type GitHubFileEntry,
  type GitHubRepoMetadata,
} from "./utils";

const GITHUB_API_BASE = "https://api.github.com";

function getGitHubHeaders() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const raw = await response.text();
  let parsed: unknown = null;

  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const parsedObject = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    const messageFromJson =
      parsedObject && typeof parsedObject.message === "string"
        ? parsedObject.message
        : parsedObject && typeof parsedObject.error === "string"
          ? parsedObject.error
          : undefined;

    const message =
      messageFromJson ||
      raw?.slice(0, 180) ||
      fallbackMessage;
    throw new Error(message);
  }

  return parsed as T;
}

async function fetchGitHubJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: getGitHubHeaders(),
    cache: "no-store",
  });

  return readJsonResponse<T>(response, "GitHub request failed");
}

async function fetchDirectoryEntries(
  owner: string,
  repo: string,
  dirPath = "",
  ref?: string
): Promise<GitHubContentEntry[]> {
  const pathSuffix = dirPath ? `/${encodeURIComponent(dirPath).replace(/%2F/g, "/")}` : "";
  const refQuery = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents${pathSuffix}${refQuery}`;
  const response = await fetch(url, {
    headers: getGitHubHeaders(),
    cache: "no-store",
  });

  const data = await readJsonResponse<GitHubContentEntry | GitHubContentEntry[]>(
    response,
    "Failed to fetch repository contents"
  );

  return Array.isArray(data) ? data : [data];
}

type GitHubFileContentResponse = {
  path: string;
  content?: string;
  encoding?: string;
  download_url?: string | null;
  size?: number;
};

async function fetchFileContent(
  owner: string,
  repo: string,
  entry: GitHubContentEntry,
  ref?: string
): Promise<string> {
  if (entry.download_url) {
    const downloadResponse = await fetch(entry.download_url, {
      headers: getGitHubHeaders(),
      cache: "no-store",
    });

    if (!downloadResponse.ok) {
      throw new Error(`Failed to fetch file ${entry.path}`);
    }

    return downloadResponse.text();
  }

  const fileUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodeURIComponent(entry.path).replace(/%2F/g, "/")}${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;
  const response = await fetch(fileUrl, {
    headers: getGitHubHeaders(),
    cache: "no-store",
  });

  const data = await readJsonResponse<GitHubFileContentResponse>(response, `Failed to fetch file ${entry.path}`);
  if (typeof data.content !== "string") {
    throw new Error(`Failed to fetch file ${entry.path}`);
  }

  if (data.encoding === "base64") {
    return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8");
  }

  return data.content;
}

async function collectFiles(
  owner: string,
  repo: string,
  dirPath = "",
  ref?: string
): Promise<GitHubFileEntry[]> {
  const entries = await fetchDirectoryEntries(owner, repo, dirPath, ref);
  const files: GitHubFileEntry[] = [];

  for (const entry of entries) {
    if (entry.type === "dir") {
      const nestedFiles = await collectFiles(owner, repo, entry.path, ref);
      files.push(...nestedFiles);
      continue;
    }

    if (entry.type !== "file") {
      continue;
    }

    const content = await fetchFileContent(owner, repo, entry, ref);

    files.push({
      path: entry.path,
      content,
      size: entry.size,
    });
  }

  return files;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowed, remaining } = await rateLimit(`github-import:${session.user.id}`, 8, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before importing again." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Remaining": String(remaining),
          },
        }
      );
    }

    const body = await request.json();
    const repoUrl = typeof body?.repoUrl === "string" ? body.repoUrl.trim() : "";
    const selectedSubdir = typeof body?.subdir === "string" ? body.subdir.trim().replace(/^\/+|\/+$/g, "") : "";

    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
    }

    const parsed = parseGitHubRepoUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json({ error: "Please enter a valid public GitHub repository URL" }, { status: 400 });
    }

    const repoInfo = await fetchGitHubJson<GitHubRepoMetadata>(
      `${GITHUB_API_BASE}/repos/${parsed.owner}/${parsed.repo}`
    );

    const branch = parsed.branch || repoInfo.default_branch;
    const importPath = selectedSubdir || parsed.path || "";
    const rootName = importPath ? importPath.split("/").filter(Boolean).pop()! : repoInfo.name;

    if (!importPath) {
      const rootEntries = await fetchDirectoryEntries(parsed.owner, parsed.repo, "", branch);
      const rootHasPackageJson = hasPackageJson(rootEntries);

      if (!rootHasPackageJson) {
        const candidateDirs = getMonorepoCandidates(rootEntries);
        const projectDirs: string[] = [];

        for (const candidate of candidateDirs) {
          try {
            const candidateEntries = await fetchDirectoryEntries(parsed.owner, parsed.repo, candidate, branch);
            if (hasPackageJson(candidateEntries)) {
              projectDirs.push(candidate);
            }
          } catch {
            continue;
          }
        }

        if (projectDirs.length > 1) {
          return NextResponse.json({
            needsSubdir: true,
            subdirs: projectDirs,
          });
        }
      }
    }

    const files = await collectFiles(parsed.owner, parsed.repo, importPath, branch);
    const templateData = buildTemplateFolderFromEntries(rootName, files);

    const playground = await db.playground.create({
      data: {
        title: repoInfo.name,
        description: repoInfo.description || `Imported from ${repoInfo.full_name}`,
        template: "STATIC",
        userId: session.user.id,
      },
    });

    await db.templateFile.create({
      data: {
        playgroundId: playground.id,
        content: JSON.parse(JSON.stringify(templateData)),
      },
    });

    return NextResponse.json({
      playgroundId: playground.id,
      title: playground.title,
      repository: repoInfo.full_name,
    });
  } catch (error) {
    console.error("GitHub import error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to import repository",
      },
      { status: 500 }
    );
  }
}
