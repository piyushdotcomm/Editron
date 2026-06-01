import { useState, useCallback, useEffect } from "react";
import git from "isomorphic-git";
import type { WebContainer } from "@webcontainer/api";
import { createGitFS } from "../lib/git-fs";

export type GitStatus = "untracked" | "modified" | "deleted" | "added" | "unmodified" | "*modified" | "*deleted" | "*untracked" | "*added";

export interface GitFileStatus {
  filepath: string;
  status: GitStatus;
}

export function useGit(instance: WebContainer | null) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [gitStatus, setGitStatus] = useState<GitFileStatus[]>([]);

  // The root directory in WebContainers
  const dir = "/";

  const getFs = useCallback(() => {
    if (!instance) throw new Error("WebContainer not initialized");
    return createGitFS(instance.fs);
  }, [instance]);

  const initRepo = useCallback(async () => {
    if (!instance) return;
    setIsInitializing(true);
    try {
      const fs = getFs();
      await git.init({ fs, dir });
      await refreshStatus();
    } catch (error) {
      console.error("Failed to initialize git repo:", error);
    } finally {
      setIsInitializing(false);
    }
  }, [instance, getFs]);

  const refreshStatus = useCallback(async () => {
    if (!instance) return;
    try {
      const fs = getFs();
      
      // Check if .git exists before running status
      const hasGit = await fs.promises.stat(`${dir}.git`).catch(() => null);
      if (!hasGit) {
        setGitStatus([]);
        return;
      }

      // Matrix returns [filepath, HEAD_status, WORKDIR_status, STAGE_status]
      const matrix = await git.statusMatrix({ fs, dir });
      
      const statuses: GitFileStatus[] = matrix.map((row) => {
        const [filepath, head, workdir, stage] = row;
        
        let status: GitStatus = "unmodified";

        if (head === 0 && workdir === 1 && stage === 1) status = "*added";
        else if (head === 0 && workdir === 2 && stage === 0) status = "untracked";
        else if (head === 0 && workdir === 2 && stage === 2) status = "added";
        else if (head === 1 && workdir === 2 && stage === 1) status = "*modified";
        else if (head === 1 && workdir === 2 && stage === 2) status = "modified";
        else if (head === 1 && workdir === 0 && stage === 1) status = "*deleted";
        else if (head === 1 && workdir === 0 && stage === 0) status = "deleted";
        // Map other combos if needed...

        return { filepath, status };
      }).filter(f => f.status !== "unmodified");

      setGitStatus(statuses);
    } catch (error) {
      console.error("Failed to get git status:", error);
    }
  }, [instance, getFs]);

  const stageFile = useCallback(async (filepath: string) => {
    try {
      const fs = getFs();
      await git.add({ fs, dir, filepath });
      await refreshStatus();
    } catch (error) {
      console.error("Failed to stage file:", error);
    }
  }, [getFs, refreshStatus]);

  const unstageFile = useCallback(async (filepath: string) => {
    try {
      const fs = getFs();
      await git.resetIndex({ fs, dir, filepath });
      await refreshStatus();
    } catch (error) {
      console.error("Failed to unstage file:", error);
    }
  }, [getFs, refreshStatus]);

  const commit = useCallback(async (message: string, authorName = "Editron User", authorEmail = "user@editron.dev") => {
    try {
      const fs = getFs();
      await git.commit({
        fs,
        dir,
        message,
        author: {
          name: authorName,
          email: authorEmail,
        }
      });
      await refreshStatus();
    } catch (error) {
      console.error("Failed to commit:", error);
    }
  }, [getFs, refreshStatus]);

  const getFileDiff = useCallback(async (filepath: string) => {
    try {
      const fs = getFs();
      // Read current working directory content
      const modifiedRaw = await fs.promises.readFile(filepath, "utf8").catch(() => "");
      const modified = modifiedRaw instanceof Uint8Array ? new TextDecoder().decode(modifiedRaw) : modifiedRaw;
      
      // Read original HEAD content
      let original = "";
      try {
        const currentCommit = await git.resolveRef({ fs, dir, ref: "HEAD" });
        const { blob } = await git.readBlob({
          fs,
          dir,
          oid: currentCommit,
          filepath
        });
        original = Buffer.from(blob).toString("utf8");
      } catch (err) {
        // Might be a new file or no commits yet
      }

      return { original, modified };
    } catch (error) {
      console.error("Failed to get file diff:", error);
      return { original: "", modified: "" };
    }
  }, [getFs]);

  return {
    isInitializing,
    gitStatus,
    initRepo,
    refreshStatus,
    stageFile,
    unstageFile,
    commit,
    getFileDiff
  };
}
