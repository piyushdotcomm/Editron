import React, { ReactNode } from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { usePlaygroundShortcuts } from '../hooks/usePlaygroundShortcuts';

export const PlaygroundLayout = ({ children, sidebar }: { children: ReactNode, sidebar: ReactNode }) => {
  usePlaygroundShortcuts();
  const { state } = useSidebar();
  
  return (
    <TooltipProvider>
      <>
        {sidebar}
        <SidebarInset
          data-state={state}
          className="flex-1 w-auto min-w-0 transition-all ease-linear duration-300 relative bg-background"
        >
          {children}
        </SidebarInset>
      </>
    </TooltipProvider>
  );
};
