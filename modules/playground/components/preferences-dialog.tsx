"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePreferences } from "@/modules/playground/hooks/usePreferences";
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

interface PreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PreferencesDialog({ open, onOpenChange }: PreferencesDialogProps) {
  const { editorTheme, setEditorTheme, fontLigatures, setFontLigatures } = usePreferences();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editor Preferences</DialogTitle>
          <DialogDescription>
            Customize your coding environment. Settings are saved locally.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex flex-col gap-3">
            <Label>Editor Theme</Label>
            <Select value={editorTheme} onValueChange={setEditorTheme}>
              <SelectTrigger className="w-full h-9 bg-background">
                <Palette className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Select Theme" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectGroup>
                  <SelectLabel className="text-xs text-muted-foreground">Themes</SelectLabel>
                  {THEME_OPTIONS.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value} className="text-sm">
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Font Ligatures</Label>
              <p className="text-xs text-muted-foreground">
                Enable special font ligatures for symbols (e.g., =&gt; to ⇒)
              </p>
            </div>
            <Switch
              checked={fontLigatures}
              onCheckedChange={setFontLigatures}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
