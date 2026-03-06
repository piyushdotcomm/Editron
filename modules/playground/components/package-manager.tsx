"use client";

import React, { useState, useEffect } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Package, Trash2, Download, Loader2 } from "lucide-react";
import { useWebContainer } from "@/modules/webcontainers/hooks/useWebContainer";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface NpmSearchResult {
  objects: {
    package: {
      name: string;
      version: string;
      description: string;
      publisher: { username: string; email: string };
    };
  }[];
}

export function PackageManager({
  templateData,
  instance,
}: {
  templateData: any;
  instance: any;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NpmSearchResult["objects"]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dependencies, setDependencies] = useState<Record<string, string>>({});
  const [devDependencies, setDevDependencies] = useState<Record<string, string>>({});
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);

  // Parse package.json
  const parsePackageJson = React.useCallback(() => {
    if (!templateData) return;
    
    // Find package.json
    const findPkg = (items: any[]): any => {
      for (const item of items) {
        if (!("folderName" in item) && item.filename === "package" && item.fileExtension === "json") {
          return item;
        } else if ("folderName" in item) {
          const found = findPkg(item.items);
          if (found) return found;
        }
      }
      return null;
    };

    const pkgFile = findPkg(templateData.items);
    if (pkgFile && pkgFile.content) {
      try {
        const parsed = JSON.parse(pkgFile.content);
        setDependencies(parsed.dependencies || {});
        setDevDependencies(parsed.devDependencies || {});
      } catch (e) {
        console.error("Failed to parse package.json");
      }
    }
  }, [templateData]);

  useEffect(() => {
    parsePackageJson();
  }, [parsePackageJson]);

  const searchNpm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(searchQuery)}&size=10`);
      const data = await res.json();
      setSearchResults(data.objects);
    } catch (error) {
      toast.error("Failed to search NPM registry");
    } finally {
      setIsSearching(false);
    }
  };

  const executeCommand = async (command: string, args: string[], pkgName: string) => {
    if (!instance) {
      toast.error("WebContainer is not ready");
      return;
    }

    setLoadingPkg(pkgName);
    try {
      const process = await instance.spawn(command, args);
      const exitCode = await process.exit;

      if (exitCode === 0) {
        toast.success(`Successfully ran: ${command} ${args.join(" ")}`);
        // Refresh dependencies (In a real app we'd let the FileSystem watcher trigger this, but we'll re-parse manual for now if we can)
      } else {
        toast.error(`Command failed with exit code ${exitCode}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred executing the command");
    } finally {
      setLoadingPkg(null);
    }
  };

  const handleInstall = (pkgName: string, isDev = false) => {
    const args = ["install", pkgName];
    if (isDev) args.push("-D");
    executeCommand("npm", args, pkgName);
  };

  const handleRemove = (pkgName: string) => {
    executeCommand("npm", ["uninstall", pkgName], pkgName);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex justify-between items-center text-xs uppercase text-muted-foreground font-semibold px-2 py-1.5 h-8">
        Dependencies
      </SidebarGroupLabel>
      <SidebarGroupContent className="p-2 space-y-4">
        
        {/* Search */}
        <form onSubmit={searchNpm} className="flex gap-2">
          <Input 
            placeholder="Search NPM package..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-xs bg-muted/50 focus-visible:ring-1"
          />
          <Button type="submit" size="icon" className="h-8 w-8 shrink-0">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2 border-b pb-4">
            <p className="text-xs font-medium text-muted-foreground px-1">Results</p>
            {searchResults.map((result) => (
              <div key={result.package.name} className="flex flex-col gap-1.5 p-2 rounded-md bg-muted/30 border text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{result.package.name}</span>
                  <span className="text-[10px] text-muted-foreground">{result.package.version}</span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{result.package.description}</p>
                <div className="flex gap-1.5 mt-1">
                  <Button 
                    size="sm" 
                    variant="default" 
                    className="h-6 text-[10px] px-2 w-full"
                    onClick={() => handleInstall(result.package.name)}
                    disabled={loadingPkg === result.package.name}
                  >
                    {loadingPkg === result.package.name ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                    Add
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 text-[10px] px-2 w-full"
                    onClick={() => handleInstall(result.package.name, true)}
                    disabled={loadingPkg === result.package.name}
                  >
                    Add -D
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Installed Dependencies */}
        <div className="space-y-3">
          {Object.keys(dependencies).length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground px-1 py-1">Dependencies</p>
              {Object.entries(dependencies).map(([name, version]) => (
                 <div key={name} className="group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer text-xs">
                 <div className="flex items-center gap-2 overflow-hidden">
                   <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                   <span className="truncate">{name}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 font-mono font-normal">
                     {version}
                   </Badge>
                   <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemove(name)}
                      disabled={loadingPkg === name}
                    >
                      {loadingPkg === name ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3 text-red-500 hover:text-red-600" />}
                    </Button>
                 </div>
               </div>
              ))}
            </div>
          )}

          {Object.keys(devDependencies).length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground px-1 py-1">Dev Dependencies</p>
              {Object.entries(devDependencies).map(([name, version]) => (
                <div key={name} className="group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                    <span className="truncate">{name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 font-mono font-normal">
                      {version}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemove(name)}
                      disabled={loadingPkg === name}
                    >
                      {loadingPkg === name ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3 text-red-500 hover:text-red-600" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {Object.keys(dependencies).length === 0 && Object.keys(devDependencies).length === 0 && (
            <p className="text-[11px] text-muted-foreground px-2">No dependencies found in package.json</p>
          )}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
