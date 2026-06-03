"use client";

import { useState, useEffect, useCallback } from "react";
import type { WebContainer } from "@webcontainer/api";

export interface GitCommit {
  id: string;
  hash: string;
  message: string;
  author: string;
  date: Date;
}

export function useGitHistory(instance: WebContainer | null) {
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCommitHash, setCurrentCommitHash] = useState<string | null>(null);

  const fetchCommits = useCallback(async () => {
    if (!instance) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check if git is initialized
      const checkGit = await instance.spawn("git", ["rev-parse", "--git-dir"]);
      const gitCheckExit = await checkGit.exit;

      if (gitCheckExit !== 0) {
        // Git not initialized, initialize it
        const initProcess = await instance.spawn("git", ["init"]);
        await initProcess.exit;

        // Configure git user
        await instance.spawn("git", ["config", "user.name", "Editron User"]);
        await instance.spawn("git", ["config", "user.email", "user@editron.dev"]);

        // Create initial commit
        await instance.spawn("git", ["add", "."]);
        const commitProcess = await instance.spawn("git", [
          "commit",
          "-m",
          "Initial commit",
        ]);
        await commitProcess.exit;
      }

      // Get current commit hash
      const currentHashProcess = await instance.spawn("git", [
        "rev-parse",
        "HEAD",
      ]);
      let currentHash = "";
      currentHashProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            currentHash += data;
          },
        })
      );
      await currentHashProcess.exit;
      setCurrentCommitHash(currentHash.trim());

      // Fetch git log
      const logProcess = await instance.spawn("git", [
        "log",
        "--pretty=format:%H|%an|%ae|%at|%s",
        "--all",
      ]);

      let logOutput = "";
      logProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            logOutput += data;
          },
        })
      );

      const exitCode = await logProcess.exit;

      if (exitCode === 0 && logOutput.trim()) {
        const lines = logOutput.trim().split("\n");
        const parsedCommits: GitCommit[] = lines.map((line, index) => {
          const [hash, author, , timestamp, ...messageParts] = line.split("|");
          const message = messageParts.join("|");
          return {
            id: `commit-${index}`,
            hash: hash.trim(),
            message: message.trim() || "No commit message",
            author: author.trim(),
            date: new Date(parseInt(timestamp) * 1000),
          };
        });

        setCommits(parsedCommits);
      } else {
        setCommits([]);
      }
    } catch (err) {
      console.error("Failed to fetch git history:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch commits");
      setCommits([]);
    } finally {
      setIsLoading(false);
    }
  }, [instance]);

  const createCommit = useCallback(
    async (message: string) => {
      if (!instance) return false;

      try {
        // Stage all changes
        const addProcess = await instance.spawn("git", ["add", "."]);
        await addProcess.exit;

        // Create commit
        const commitProcess = await instance.spawn("git", [
          "commit",
          "-m",
          message,
        ]);
        const exitCode = await commitProcess.exit;

        if (exitCode === 0) {
          // Refresh commits
          await fetchCommits();
          return true;
        }
        return false;
      } catch (err) {
        console.error("Failed to create commit:", err);
        return false;
      }
    },
    [instance, fetchCommits]
  );

  const checkoutCommit = useCallback(
    async (hash: string) => {
      if (!instance) return false;

      try {
        // Checkout the commit
        const checkoutProcess = await instance.spawn("git", ["checkout", hash]);
        const exitCode = await checkoutProcess.exit;

        if (exitCode === 0) {
          setCurrentCommitHash(hash);
          return true;
        }
        return false;
      } catch (err) {
        console.error("Failed to checkout commit:", err);
        return false;
      }
    },
    [instance]
  );

  const checkoutMain = useCallback(async () => {
    if (!instance) return false;

    try {
      // Try to checkout main or master
      let checkoutProcess = await instance.spawn("git", ["checkout", "main"]);
      let exitCode = await checkoutProcess.exit;

      if (exitCode !== 0) {
        checkoutProcess = await instance.spawn("git", ["checkout", "master"]);
        exitCode = await checkoutProcess.exit;
      }

      if (exitCode === 0) {
        await fetchCommits();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to checkout main:", err);
      return false;
    }
  }, [instance, fetchCommits]);

  // Auto-fetch commits when instance is ready
  useEffect(() => {
    if (instance) {
      fetchCommits();
    }
  }, [instance, fetchCommits]);

  return {
    commits,
    isLoading,
    error,
    currentCommitHash,
    fetchCommits,
    createCommit,
    checkoutCommit,
    checkoutMain,
  };
}
