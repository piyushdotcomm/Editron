"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCode, Check, X } from "lucide-react";
import { diffLines } from "diff";

interface PendingChange {
  toolCallId: string;
  toolName: string;
  changes: Array<{
    path: string;
    oldContent: string;
    newContent: string;
  }>;
}

interface AIDiffPreviewProps {
  pendingChanges: PendingChange | null;
  isOpen: boolean;
  onAccept: () => void;
  onReject: () => void;
}

interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

/**
 * Shows pending AI file changes before they are applied.
 * Keeping this separate from the chat panel keeps the review flow cleaner.
 */
export default function AIDiffPreview({
  pendingChanges,
  isOpen,
  onAccept,
  onReject,
}: AIDiffPreviewProps) {
  if (!isOpen || !pendingChanges) {
    return null;
  }

  const { changes, toolName } = pendingChanges;
  const fileCount = changes.length;

  // Basic line diff preview so users can quickly review AI edits.
  const renderDiffPreview = (oldContent: string, newContent: string) => {
    const diff = diffLines(oldContent, newContent);
    const maxLines = 100;
    let lineCount = 0;
    const truncatedDiff: DiffPart[] = [];

    for (const part of diff) {
      const lines = part.value
        .split("\n")
        .filter((line: string) => line !== "");
      if (lineCount + lines.length > maxLines) {
        const remaining = maxLines - lineCount;
        if (remaining > 0) {
          const truncatedValue = part.value
            .split("\n")
            .slice(0, remaining)
            .join("\n");
          truncatedDiff.push({
            value:
              truncatedValue +
              (remaining < lines.length ? "\n... (truncated)" : ""),
            added: part.added,
            removed: part.removed,
          });
        }
        break;
      }
      truncatedDiff.push({
        value: part.value,
        added: part.added,
        removed: part.removed,
      });
      lineCount += lines.length;
    }

    return truncatedDiff.map((part, partIdx) => {
      const style = part.added
        ? "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300"
        : part.removed
          ? "bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300"
          : "text-muted-foreground";
      const prefix = part.added ? "+ " : part.removed ? "- " : "  ";

      const valueStart = part.value.slice(0, 20);
      const partKey = `${partIdx}-${valueStart}`;

      return (
        <div
          key={partKey}
          className={`text-xs font-mono ${style} whitespace-pre-wrap`}
        >
          {part.value.split("\n").map((line: string, lineIdx: number) => {
            const lineKey = `${partKey}-${lineIdx}-${line.slice(0, 10)}`;
            return (
              <div key={lineKey} className="py-0.5">
                {prefix}
                {line}
              </div>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[32rem] max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <Card className="border-2 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileCode className="h-4 w-4 text-blue-500" />
            AI Changes Pending Review
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground sticky top-0 bg-background/95 pb-2">
              {toolName === "edit_multiple_files"
                ? `${fileCount} file${fileCount !== 1 ? "s" : ""} to update`
                : "1 file to update"}
            </div>
            {changes.map((change) => (
              <div key={change.path} className="space-y-2">
                <div className="text-xs font-semibold font-mono bg-muted/50 rounded px-2 py-1.5 border">
                  <span className="text-foreground">{change.path}</span>
                </div>
                <div className="border rounded-lg overflow-hidden bg-muted/20">
                  <div className="max-h-64 overflow-y-auto p-2 space-y-0.5">
                    {change.oldContent === "" && (
                      <div className="text-xs text-muted-foreground mb-2">
                        New file
                      </div>
                    )}
                    {renderDiffPreview(change.oldContent, change.newContent)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 pt-0">
          <Button
            size="sm"
            variant="default"
            className="flex-1 gap-1"
            onClick={onAccept}
          >
            <Check className="h-3.5 w-3.5" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1"
            onClick={onReject}
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
