import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DiffEditor } from "@monaco-editor/react";
import { useGit } from "../hooks/useGit";
import { usePlaygroundContext } from "../contexts/playground-context";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

interface GitDiffViewerProps {
  filepath: string | null;
  onClose: () => void;
}

export const GitDiffViewer: React.FC<GitDiffViewerProps> = ({ filepath, onClose }) => {
  const { instance } = usePlaygroundContext();
  const { getFileDiff } = useGit(instance);
  const { resolvedTheme } = useTheme();
  
  const [original, setOriginal] = useState<string>("");
  const [modified, setModified] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filepath || !instance) return;
    
    let isMounted = true;
    setLoading(true);

    getFileDiff(filepath).then((diff) => {
      if (isMounted) {
        setOriginal(diff.original || "");
        setModified(diff.modified || "");
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [filepath, instance, getFileDiff]);

  const getLanguage = (file: string) => {
    const ext = file.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts': case 'tsx': return 'typescript';
      case 'js': case 'jsx': return 'javascript';
      case 'json': return 'json';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'md': return 'markdown';
      default: return 'plaintext';
    }
  };

  return (
    <Dialog open={!!filepath} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] w-full h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-4 py-2 border-b">
          <DialogTitle className="text-sm font-medium">
            Diff: {filepath}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : null}
          {filepath && (
            <DiffEditor
              language={getLanguage(filepath)}
              original={original}
              modified={modified}
              theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
              options={{
                readOnly: true,
                renderSideBySide: true,
                minimap: { enabled: false },
                wordWrap: "on",
                scrollBeyondLastLine: false,
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
