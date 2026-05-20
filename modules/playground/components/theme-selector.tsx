"use client";

import * as React from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAI } from "@/modules/playground/hooks/useAI";
import { Palette } from "lucide-react";

export const THEME_OPTIONS = [
	{ value: "vs-dark", label: "VS Code Dark" },
	{ value: "vs", label: "VS Code Light" },
	{ value: "hc-black", label: "High Contrast Dark" },
	{ value: "Active4D", label: "Active4D" },
	{ value: "All Hallows Eve", label: "All Hallows Eve" },
	{ value: "Amy", label: "Amy" },
	{ value: "Birds of Paradise", label: "Birds of Paradise" },
	{ value: "Blackboard", label: "Blackboard" },
	{ value: "Brilliance Black", label: "Brilliance Black" },
	{ value: "Brilliance Dull", label: "Brilliance Dull" },
	{ value: "Chrome DevTools", label: "Chrome DevTools" },
	{ value: "Clouds Midnight", label: "Clouds Midnight" },
	{ value: "Clouds", label: "Clouds" },
	{ value: "Cobalt", label: "Cobalt" },
	{ value: "Dawn", label: "Dawn" },
	{ value: "Dreamweaver", label: "Dreamweaver" },
	{ value: "Eiffel", label: "Eiffel" },
	{ value: "Espresso Libre", label: "Espresso Libre" },
	{ value: "GitHub", label: "GitHub" },
	{ value: "IDLE", label: "IDLE" },
	{ value: "Katzenmilch", label: "Katzenmilch" },
	{ value: "Kuroir Theme", label: "Kuroir Theme" },
	{ value: "LAZY", label: "LAZY" },
	{ value: "MagicWB (Amiga)", label: "MagicWB" },
	{ value: "Merbivore Soft", label: "Merbivore Soft" },
	{ value: "Merbivore", label: "Merbivore" },
	{ value: "Monokai", label: "Monokai" },
	{ value: "Night Owl", label: "Night Owl" },
	{ value: "Oceanic Next", label: "Oceanic Next" },
	{ value: "Pastels on Dark", label: "Pastels on Dark" },
	{ value: "Slush and Poppies", label: "Slush and Poppies" },
	{ value: "Solarized-dark", label: "Solarized Dark" },
	{ value: "Solarized-light", label: "Solarized Light" },
	{ value: "SpaceCadet", label: "SpaceCadet" },
	{ value: "Sunburst", label: "Sunburst" },
	{ value: "Textmate (Mac Classic)", label: "Textmate Classic" },
	{ value: "Tomorrow-Night-Blue", label: "Tomorrow Night Blue" },
	{ value: "Tomorrow-Night-Bright", label: "Tomorrow Night Bright" },
	{ value: "Tomorrow-Night-Eighties", label: "Tomorrow Night Eighties" },
	{ value: "Tomorrow-Night", label: "Tomorrow Night" },
	{ value: "Tomorrow", label: "Tomorrow" },
	{ value: "Twilight", label: "Twilight" },
	{ value: "Upstream Sunburst", label: "Upstream Sunburst" },
	{ value: "Vibrant Ink", label: "Vibrant Ink" },
	{ value: "Xcode_default", label: "Xcode Default" },
	{ value: "Zenburnesque", label: "Zenburnesque" },
	{ value: "iPlastic", label: "iPlastic" },
	{ value: "idleFingers", label: "idleFingers" },
	{ value: "krTheme", label: "krTheme" },
	{ value: "monoindustrial", label: "monoindustrial" }
];

export function ThemeSelector() {
	const { editorTheme, setEditorTheme } = useAI();

	return (
		<div className="flex items-center gap-2">
			<Select value={editorTheme} onValueChange={setEditorTheme}>
				<SelectTrigger className="w-[180px] h-8 text-xs bg-background" aria-label="Select editor theme">
					<Palette className="w-3 h-3 mr-2 text-muted-foreground" />
					<SelectValue placeholder="Select Theme" />
				</SelectTrigger>
				<SelectContent className="max-h-[300px]">
					<SelectGroup>
						<SelectLabel className="text-xs text-muted-foreground">Editor Themes</SelectLabel>
						{THEME_OPTIONS.map((theme) => (
							<SelectItem key={theme.value} value={theme.value} className="text-xs">
								{theme.label}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	);
}