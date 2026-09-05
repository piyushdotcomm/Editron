"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HomePageClient() {
  useEffect(() => {
    // Hide scrollbars on html and body while on the landing page
    document.documentElement.classList.add("hide-scrollbar");
    document.body.classList.add("hide-scrollbar");

    return () => {
      document.documentElement.classList.remove("hide-scrollbar");
      document.body.classList.remove("hide-scrollbar");
    };
  }, []);

  return (
    <main className="relative z-10 pointer-events-auto w-full min-h-[calc(100vh-4rem)] p-8 flex flex-col items-center justify-center text-center font-sans hide-scrollbar">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-3xl font-semibold text-foreground">
          Editron
        </h1>
        <p className="text-muted-foreground text-sm">
          Blank canvas ready for your custom redesign.
        </p>

        <div className="flex flex-wrap gap-3 justify-center pt-4">
          <Link href="/dashboard">
            <Button>Dashboard</Button>
          </Link>
          <Link href="/templates">
            <Button variant="outline">Templates</Button>
          </Link>
          <Link href="/docs">
            <Button variant="outline">Documentation</Button>
          </Link>
          <Link href="/auth/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
