"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { shortcuts } from "../constants/shortcuts";

interface ShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutsModal({
  open,
  onOpenChange,
}: ShortcutsModalProps) {

  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform));
  }, []);

  const formatKey = (key: string) => {
    if (key === "Ctrl") {
      return isMac ? "⌘" : "Ctrl";
    }

    return key;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Keyboard Shortcuts
          </DialogTitle>

          <DialogDescription>
            View all available keyboard shortcuts for navigating and using the playground efficiently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                {section.category}
              </h3>

              <div className="space-y-2">
                {section.items.map((shortcut) => (
                  <div
                    key={`${shortcut.description}-${shortcut.keys.join("-")}`}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span className="text-sm">
                      {shortcut.description}
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {shortcut.keys.map((key) => (
                        <kbd
                          key={key}
                          className="rounded-md border bg-muted px-2 py-1 text-xs font-medium"
                        >
                          {formatKey(key)}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}