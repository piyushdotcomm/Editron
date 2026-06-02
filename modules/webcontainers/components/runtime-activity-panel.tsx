"use client";

import { cn } from "@/lib/utils";
import { useWebContainerStore } from "../hooks/useWebContainer";

const eventStyles: Record<"info" | "success" | "error", string> = {
  info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  success: "bg-green-500/10 text-green-500 border-green-500/20",
  error: "bg-red-500/10 text-red-500 border-red-500/20",
};

const dotStyles: Record<"info" | "success" | "error", string> = {
  info: "bg-blue-500",
  success: "bg-green-500",
  error: "bg-red-500",
};

const formatTime = (timestamp: number) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(timestamp);
};

const RuntimeActivityPanel = () => {
  const runtimeEvents = useWebContainerStore((state) => state.runtimeEvents);

  if (runtimeEvents.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border/40 bg-background px-3 py-2">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">
          Runtime Activity
        </h3>

        <span className="text-[10px] text-muted-foreground">
          {runtimeEvents.length} events
        </span>
      </div>

      <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
        {[...runtimeEvents].reverse().map((event) => (
          <div
            key={event.id}
            className={cn(
              "flex items-start gap-2 rounded-md border px-2 py-1.5 text-xs",
              eventStyles[event.type],
            )}
          >
            <div
              className={cn(
                "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                dotStyles[event.type],
              )}
            />

            <div className="min-w-0 flex-1">
              <p className="wrap-break-word">{event.message}</p>

              <span className="text-[10px] opacity-70">
                {formatTime(event.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RuntimeActivityPanel;
