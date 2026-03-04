"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Code, Settings, Plus, Home } from "lucide-react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";

export function CommandPalette() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
                        <Home className="mr-2 h-4 w-4" />
                        <span>Home</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                        <Code className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Actions">
                    <CommandItem onSelect={() => runCommand(() => router.push("/dashboard?new=true"))}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>New Playground</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
