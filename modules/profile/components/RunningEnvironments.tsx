"use client";

import { RuntimeEnvironment } from "@/modules/profile/data/mock-data";
import { Monitor, Power, RotateCw, Terminal } from "lucide-react";

export default function RunningEnvironments({ runtimes }: { runtimes: RuntimeEnvironment[] }) {
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Monitor size={18} />
                    Active Environments
                </h3>
                <span className="bg-emerald-500/10 text-emerald-500 text-xs px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
                    Live
                </span>
            </div>

            <div className="space-y-4">
                {runtimes.map((runtime) => (
                    <div key={runtime.id} className="group relative overflow-hidden bg-background/50 border border-border/50 rounded-lg p-4 hover:border-emerald-500/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${runtime.status === 'running' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-secondary'}`} />
                                <h4 className="font-medium text-sm">{runtime.projectName}</h4>
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">{runtime.uptime}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-muted-foreground">
                            <div className="flex flex-col">
                                <span className="uppercase tracking-wider text-[10px] mb-1">CPU</span>
                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${runtime.cpuUsage}%` }} />
                                </div>
                                <span className="mt-1 text-right">{runtime.cpuUsage}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="uppercase tracking-wider text-[10px] mb-1">MEM</span>
                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${(runtime.memoryUsage / 512) * 100}%` }} />
                                </div>
                                <span className="mt-1 text-right">{runtime.memoryUsage}MB</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                            <button className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors" title="View Logs">
                                <Terminal size={14} />
                            </button>
                            <button className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground hover:text-amber-500 transition-colors" title="Restart">
                                <RotateCw size={14} />
                            </button>
                            <button className="p-1.5 hover:bg-red-500/10 rounded-md text-red-500 hover:text-red-600 transition-colors" title="Stop">
                                <Power size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {runtimes.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No active environments running.
                    </div>
                )}
            </div>
        </div>
    );
}
