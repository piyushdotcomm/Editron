import * as React from "react";
// @ts-ignore - lucide-react includes its own types
import { Clock, GitCommit, Sparkles, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Commit {
  id: string;
  message: string;
  date: Date | string;
  author?: string;
  hash?: string;
}

export interface CodeTimeTravelProps {
  commits: Commit[];
  onTravelBack: (commitId: string) => void;
  onExplainWithAI: (commitId: string) => void;
  className?: string;
  isLoading?: boolean;
  activeCommitId?: string;
}

export function CodeTimeTravel({
  commits,
  onTravelBack,
  onExplainWithAI,
  className,
  isLoading = false,
  activeCommitId,
}: CodeTimeTravelProps) {
  const formatDate = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-card border-l border-border",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Clock className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Code Time Travel</h2>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="flex flex-col gap-4 p-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-shimmer rounded-lg bg-muted/50 h-24"
              />
            ))}
          </div>
        ) : commits.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            <GitCommit className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No commits available
            </p>
            <p className="text-xs text-muted-foreground/70">
              Make changes to see history
            </p>
          </div>
        ) : (
          <div className="relative px-4 py-4">
            {/* Timeline line */}
            <div className="absolute left-[1.875rem] top-0 bottom-0 w-px bg-border" />

            {/* Commits */}
            <div className="space-y-4">
              {commits.map((commit, index) => {
                const isActive = activeCommitId === commit.id;
                const isFirst = index === 0;

                return (
                  <div
                    key={commit.id}
                    className={cn(
                      "relative pl-8 group animate-fadeInUp",
                      isActive && "ring-1 ring-primary/20 rounded-lg -ml-2 pl-10 pr-2 py-2"
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "absolute left-[1.375rem] top-2 size-3 rounded-full border-2 bg-background transition-all",
                        isActive
                          ? "border-primary bg-primary shadow-sm shadow-primary/50"
                          : isFirst
                          ? "border-primary/60 bg-primary/20"
                          : "border-border bg-muted group-hover:border-primary/40"
                      )}
                    />

                    {/* Commit content */}
                    <div className="flex flex-col gap-2">
                      {/* Commit header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-medium leading-tight line-clamp-2",
                              isActive
                                ? "text-foreground"
                                : "text-foreground/90"
                            )}
                          >
                            {commit.message}
                          </p>
                          {commit.author && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {commit.author}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Commit metadata */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        <span>{formatDate(commit.date)}</span>
                        <span className="text-muted-foreground/50">•</span>
                        <span>{formatTime(commit.date)}</span>
                      </div>

                      {commit.hash && (
                        <div className="flex items-center gap-1.5">
                          <code className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {commit.hash.slice(0, 7)}
                          </code>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => onTravelBack(commit.id)}
                          disabled={isActive}
                          className={cn(
                            "inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all h-7 px-3",
                            "bg-primary text-primary-foreground hover:bg-primary/90",
                            "disabled:opacity-50 disabled:pointer-events-none",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                          )}
                        >
                          <Clock className="size-3" />
                          {isActive ? "Current" : "Travel Back"}
                        </button>

                        <button
                          onClick={() => onExplainWithAI(commit.id)}
                          className={cn(
                            "inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all h-7 px-3",
                            "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                          )}
                        >
                          <Sparkles className="size-3" />
                          Explain
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      {commits.length > 0 && !isLoading && (
        <div className="border-t border-border px-4 py-2">
          <p className="text-xs text-muted-foreground">
            {commits.length} {commits.length === 1 ? "commit" : "commits"} in
            history
          </p>
        </div>
      )}
    </div>
  );
}
