
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";


export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <button
            type="button"
            aria-label="Toggle theme"
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => {
                setTheme(resolvedTheme === "light" ? "dark" : "light");
            }}
        >
            {
                resolvedTheme === "light" ? (
                    <Moon className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
                ) : (
                    <Sun className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
                )
            }
        </button>
    )
}

