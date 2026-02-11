"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Code2,
  Compass,
  FolderPlus,
  History,
  Home,
  LayoutDashboard,
  Lightbulb,
  type LucideIcon,
  Plus,
  Settings,
  Star,
  Terminal,
  Zap,
  Database,
  FlameIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Image from "next/image"

// Define the interface for a single playground item, icon is now a string
interface PlaygroundData {
  id: string
  name: string
  icon: string // Changed to string
  starred: boolean
}

// Map icon names (strings) to their corresponding LucideIcon components
const lucideIconMap: Record<string, LucideIcon> = {
  Zap: Zap,
  Lightbulb: Lightbulb,
  Database: Database,
  Compass: Compass,
  FlameIcon: FlameIcon,
  Terminal: Terminal,
  Code2: Code2, // Include the default icon
  // Add any other icons you might use dynamically
}

export function DashboardSidebar({ initialPlaygroundData }: { initialPlaygroundData: PlaygroundData[] }) {
  const pathname = usePathname()
  const [starredPlaygrounds, setStarredPlaygrounds] = useState(initialPlaygroundData.filter((p) => p.starred))
  const [recentPlaygrounds, setRecentPlaygrounds] = useState(initialPlaygroundData)

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r border-border/40 bg-background/60 backdrop-blur-md">
      <SidebarHeader className="pb-4 pt-6">
        <Link href="/" className="flex items-center gap-3 px-4 group">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl p-0.5 shadow-lg group-hover:shadow-red-500/25 transition-all duration-300">
            <div className="flex h-full w-full items-center justify-center bg-black/90 rounded-[10px]">
              <Image src="/logo.svg" alt="Editron Logo" width={24} height={24} className="h-6 w-6" />
            </div>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-lg tracking-tight">Editron</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard"}
                tooltip="Dashboard"
                className="h-10 data-[active=true]:bg-red-500/10 data-[active=true]:text-red-500 hover:bg-muted/50 transition-all duration-200"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/"}
                tooltip="Home"
                className="h-10 hover:bg-muted/50 transition-all duration-200"
              >
                <Link href="/">
                  <Home className="h-4 w-4" />
                  <span className="font-medium">Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider px-4 mb-2">
            Favorites
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {starredPlaygrounds.length === 0 ? (
                <div className="px-4 py-3 text-xs text-muted-foreground/60 italic">
                  No starred projects
                </div>
              ) : (
                starredPlaygrounds.map((playground) => {
                  const IconComponent = lucideIconMap[playground.icon] || Code2;
                  const isActive = pathname === `/playground/${playground.id}`;
                  return (
                    <SidebarMenuItem key={playground.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={playground.name}
                        className="h-9 hover:bg-muted/50 data-[active=true]:bg-amber-500/10 data-[active=true]:text-amber-500 transition-all duration-200"
                      >
                        <Link href={`/playground/${playground.id}`}>
                          {IconComponent && <IconComponent className="h-4 w-4 opacity-70" />}
                          <span className="truncate">{playground.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarGroupAction title="Add starred playground" className="hover:bg-muted/50 text-muted-foreground hover:text-foreground top-1 right-2 w-6 h-6">
            <Plus className="h-3.5 w-3.5" />
          </SidebarGroupAction>
        </SidebarGroup>

        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider px-4 mb-2">
            Recents
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentPlaygrounds.slice(0, 5).map((playground) => {
                const IconComponent = lucideIconMap[playground.icon] || Code2;
                const isActive = pathname === `/playground/${playground.id}`;
                return (
                  <SidebarMenuItem key={playground.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={playground.name}
                      className="h-9 hover:bg-muted/50 data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-500 transition-all duration-200"
                    >
                      <Link href={`/playground/${playground.id}`}>
                        {IconComponent && <IconComponent className="h-4 w-4 opacity-70" />}
                        <span className="truncate">{playground.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}


            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarGroupAction title="Create new playground" className="hover:bg-muted/50 text-muted-foreground hover:text-foreground top-1 right-2 w-6 h-6">
            <Link href="/dashboard">
              <FolderPlus className="h-3.5 w-3.5" />
            </Link>
          </SidebarGroupAction>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/40 bg-muted/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings" className="h-10 hover:bg-background/80 transition-all duration-200">
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span className="font-medium">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
