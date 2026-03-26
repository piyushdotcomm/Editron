"use client";

export default function PlaygroundSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Sidebar skeleton */}
      <div className="w-60 border-r bg-muted/30 p-4 space-y-3 shrink-0">
        <div className="h-4 w-24 rounded bg-muted animate-shimmer" />
        <div className="space-y-2 mt-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 rounded bg-muted animate-shimmer" style={{ animationDelay: `${i * 0.1}s` }} />
              <div
                className="h-3 rounded bg-muted animate-shimmer"
                style={{
                  width: `${60 + ((i * 7) % 60)}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            </div>
          ))}
          <div className="pl-4 space-y-2 mt-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 rounded bg-muted animate-shimmer" style={{ animationDelay: `${(i + 6) * 0.1}s` }} />
                <div
                  className="h-3 rounded bg-muted animate-shimmer"
                  style={{
                    width: `${40 + ((i * 13) % 50)}px`,
                    animationDelay: `${(i + 6) * 0.1}s`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main editor skeleton */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab bar skeleton */}
        <div className="h-10 border-b bg-muted/20 flex items-center gap-1 px-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-6 rounded-md bg-muted animate-shimmer"
              style={{
                width: `${70 + ((i * 11) % 30)}px`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>

        {/* Breadcrumb skeleton */}
        <div className="h-7 border-b bg-muted/10 flex items-center gap-1.5 px-4">
          <div className="h-2.5 w-12 rounded bg-muted animate-shimmer" />
          <div className="h-2.5 w-2 rounded bg-muted/50" />
          <div className="h-2.5 w-20 rounded bg-muted animate-shimmer" style={{ animationDelay: "0.1s" }} />
          <div className="h-2.5 w-2 rounded bg-muted/50" />
          <div className="h-2.5 w-16 rounded bg-muted animate-shimmer" style={{ animationDelay: "0.2s" }} />
        </div>

        {/* Code lines skeleton */}
        <div className="flex-1 p-4 space-y-2 overflow-hidden">
          {/* Line numbers + code */}
          {[...Array(18)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="h-3 w-6 rounded bg-muted/50 animate-shimmer shrink-0"
                style={{ animationDelay: `${i * 0.05}s` }}
              />
              <div
                className="h-3 rounded bg-muted animate-shimmer"
                style={{
                  width: `${30 + ((i * 23) % 300)}px`,
                  animationDelay: `${i * 0.05}s`,
                  marginLeft: i > 2 && i < 12 ? `${(i % 4) * 16}px` : "0px",
                }}
              />
            </div>
          ))}
        </div>

        {/* Status bar skeleton */}
        <div className="h-6 border-t bg-muted/30 flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-16 rounded bg-muted animate-shimmer" />
            <div className="h-2.5 w-14 rounded bg-muted animate-shimmer" style={{ animationDelay: "0.1s" }} />
          </div>
          <div className="h-2.5 w-12 rounded bg-muted animate-shimmer" style={{ animationDelay: "0.2s" }} />
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-14 rounded bg-muted animate-shimmer" style={{ animationDelay: "0.3s" }} />
            <div className="h-2.5 w-10 rounded bg-muted animate-shimmer" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}