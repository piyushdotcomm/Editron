"use client";

import { toast } from "sonner";
import { ArrowDown } from "lucide-react";
import Image from "next/image";

import GithubImportDialog from "./github-import-dialog";

const AddRepo = () => {
  return (
    <GithubImportDialog>
      <div
        className="group relative px-6 py-8 flex flex-row justify-between items-center border border-border/40 rounded-xl bg-background/50 hover:bg-background/80 backdrop-blur-sm cursor-pointer 
      transition-all duration-300 ease-out
      hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1"
      >
        <div className="flex flex-row items-center gap-5">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 group-hover:border-amber-500/40 transition-all duration-300">
            <ArrowDown className="h-6 w-6 text-amber-500 transition-transform duration-300 group-hover:translate-y-1" />
          </div>
          <div className="flex flex-col space-y-1">
            <h1 className="text-xl font-bold text-foreground group-hover:text-amber-500 transition-colors">
              Import Repository
            </h1>
            <p className="text-sm text-muted-foreground">
              Clone from GitHub URL
            </p>
          </div>
        </div>

        <div className="relative opacity-80 group-hover:opacity-100 transition-opacity">
          <Image
            src={"/github.svg"}
            alt="Open GitHub repository"
            width={120}
            height={120}
            className="transition-transform duration-500 group-hover:scale-110 drop-shadow-lg"
          />
        </div>
      </div>
    </GithubImportDialog>
  );
};

export default AddRepo


