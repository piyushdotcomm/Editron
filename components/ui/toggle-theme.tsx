
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, SunMoon } from "lucide-react";


export function ThemeToggle() {
    const { setTheme, theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div
            className="cursor-pointer"
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
        </div>
    )
}

