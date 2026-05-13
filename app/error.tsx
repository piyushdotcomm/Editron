"use client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

/**
 * Global error boundary UI for handling unexpected runtime errors.
 */

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    console.error(error);
    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <Card className="w-full max-w-md text-center shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        Something went wrong
                    </CardTitle>

                    <CardDescription>
                        An unexpected error occurred. Please try again.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Button onClick={() => reset()}>
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}