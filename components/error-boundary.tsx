"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";

export type FallbackRenderProps = {
    error: Error | null;
    reset: () => void;
};

interface Props {
    children: ReactNode;
    fallback?: ReactNode | ((props: FallbackRenderProps) => ReactNode);
    name?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    reset = () => {
        this.setState({ hasError: false, error: null });
    };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(
            JSON.stringify({
                timestamp: new Date().toISOString(),
                level: "error",
                context: `ErrorBoundary:${this.props.name || "unknown"}`,
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
            })
        );
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                if (typeof this.props.fallback === "function") {
                    return this.props.fallback({
                        error: this.state.error,
                        reset: this.reset,
                    });
                }

                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4 p-6 text-center">
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 max-w-md">
                        <h3 className="text-lg font-semibold text-destructive mb-2">
                            Something went wrong
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {this.state.error?.message || "An unexpected error occurred"}
                        </p>
                        <button
                            onClick={this.reset}
                            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
