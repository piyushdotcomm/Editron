import React, { useEffect, useState } from "react";
import { useGit, GitFileStatus } from "../hooks/useGit";
import { usePlaygroundContext } from "../contexts/playground-context";
import { Button } from "@/components/ui/button";
import { Plus, Minus, GitBranch, RefreshCw, GitCommit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface GitSourceControlProps {
  onOpenFileDiff?: (filepath: string) => void;
}

export const GitSourceControl: React.FC<GitSourceControlProps> = ({ onOpenFileDiff }) => {
  const { instance } = usePlaygroundContext();
  const {
    gitStatus,
    initRepo,
    refreshStatus,
    stageFile,
    unstageFile,
    commit,
    isInitializing
  } = useGit(instance);

  const [commitMessage, setCommitMessage] = useState("");
  const [hasRepo, setHasRepo] = useState<boolean | null>(null);

  // Check if repo exists on mount and instance change
  useEffect(() => {
    if (!instance) return;
    const checkRepo = async () => {
      try {
        const files = await instance.fs.readdir("/");
        if (files.includes(".git")) {
          setHasRepo(true);
          refreshStatus();
        } else {
          setHasRepo(false);
        }
      } catch (err) {
        setHasRepo(false);
      }
    };
    checkRepo();
  }, [instance, refreshStatus]);

  if (hasRepo === false) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-4">
        <GitBranch className="h-12 w-12 text-muted-foreground" />
        <h3 className="font-semibold">Source Control</h3>
        <p className="text-sm text-muted-foreground">
          The current workspace does not have a git repository initialized.
        </p>
        <Button onClick={() => initRepo().then(() => setHasRepo(true))} disabled={isInitializing}>
          {isInitializing ? "Initializing..." : "Initialize Repository"}
        </Button>
      </div>
    );
  }

  const stagedFiles = gitStatus.filter(f => ["added", "modified", "deleted"].includes(f.status));
  const unstagedFiles = gitStatus.filter(f => ["*added", "*modified", "*deleted", "untracked"].includes(f.status));

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    await commit(commitMessage);
    setCommitMessage("");
  };

  const getStatusColor = (status: string) => {
    if (status.includes("deleted")) return "text-red-500";
    if (status.includes("untracked") || status.includes("added")) return "text-green-500";
    return "text-yellow-500"; // modified
  };

  const getStatusLetter = (status: string) => {
    if (status.includes("deleted")) return "D";
    if (status.includes("untracked")) return "U";
    if (status.includes("added")) return "A";
    return "M"; // modified
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b flex justify-between items-center">
        <span className="text-xs font-semibold uppercase text-muted-foreground">Source Control</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={refreshStatus}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      <div className="p-2 space-y-2 border-b">
        <Textarea
          placeholder="Message (Enter to commit)"
          className="min-h-[80px] text-sm resize-none"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleCommit();
            }
          }}
        />
        <Button 
          className="w-full h-8 text-xs" 
          onClick={handleCommit}
          disabled={!commitMessage.trim() || stagedFiles.length === 0}
        >
          <GitCommit className="mr-2 h-3 w-3" /> Commit
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Staged Changes */}
        {stagedFiles.length > 0 && (
          <div className="py-2">
            <div className="px-2 pb-1 text-xs font-semibold text-muted-foreground flex justify-between">
              <span>Staged Changes</span>
              <span className="bg-muted px-1.5 rounded-full">{stagedFiles.length}</span>
            </div>
            {stagedFiles.map((file) => (
              <div 
                key={file.filepath} 
                className="group flex items-center justify-between px-2 py-1 hover:bg-muted/50 cursor-pointer text-sm"
                onClick={() => onOpenFileDiff?.(file.filepath)}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className={`text-[10px] font-bold ${getStatusColor(file.status)}`}>
                    {getStatusLetter(file.status)}
                  </span>
                  <span className="truncate">{file.filepath}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100" 
                  onClick={(e) => { e.stopPropagation(); unstageFile(file.filepath); }}
                  title="Unstage Changes"
                >
                  <Minus className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Unstaged Changes */}
        {unstagedFiles.length > 0 && (
          <div className="py-2">
            <div className="px-2 pb-1 text-xs font-semibold text-muted-foreground flex justify-between">
              <span>Changes</span>
              <span className="bg-muted px-1.5 rounded-full">{unstagedFiles.length}</span>
            </div>
            {unstagedFiles.map((file) => (
              <div 
                key={file.filepath} 
                className="group flex items-center justify-between px-2 py-1 hover:bg-muted/50 cursor-pointer text-sm"
                onClick={() => onOpenFileDiff?.(file.filepath)}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className={`text-[10px] font-bold ${getStatusColor(file.status)}`}>
                    {getStatusLetter(file.status)}
                  </span>
                  <span className="truncate">{file.filepath}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100" 
                  onClick={(e) => { e.stopPropagation(); stageFile(file.filepath); }}
                  title="Stage Changes"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
