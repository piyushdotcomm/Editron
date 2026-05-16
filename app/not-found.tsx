import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-background selection:bg-primary/20 overflow-hidden font-sans flex items-center justify-center px-4 py-12">
      {/* Background Grid Pattern matching Dashboard and Home */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <Card className="w-full max-w-lg text-center shadow-2xl border-border/60 bg-background/60 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 ease-out">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex justify-center">
            <div className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-sm text-red-500 backdrop-blur-md cursor-default">
              <Terminal className="mr-2 h-3.5 w-3.5 animate-pulse" />
              <span className="font-medium">404 Error</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-7xl sm:text-8xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 select-none py-2">
              404
            </h1>
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Looks like this route got{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 italic pr-1">
                lost in the void.
              </span>
            </CardTitle>
          </div>

          <CardDescription className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto pt-2 leading-relaxed">
            You’ve reached a route that isn’t part of this workspace. Head back to get back on track.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 pb-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-red-500/20 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white border-0 w-full sm:w-auto transition-transform hover:scale-105"
            >
              Return to Home
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
