import { Metadata } from "next";
import { currentUser } from "@/modules/auth/actions";
import { getUserProfileStats } from "@/modules/profile/actions";
import KPIStats from "@/modules/profile/components/KPIStats";
import ContributionHeatmap from "@/modules/profile/components/ContributionHeatmap";
import UsageAnalytics from "@/modules/profile/components/UsageAnalytics";
import RecentActivity from "@/modules/profile/components/RecentActivity";
import { QuickActions } from "@/modules/profile/components/SidebarWidgets";
import HeaderNewProjectButton from "@/modules/profile/components/HeaderNewProjectButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Bell, Settings, LogOut } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import CompactProjectTable from "@/modules/profile/components/CompactProjectTable";
import { deleteProjectById, duplicateProjectById, editProjectById } from "@/modules/dashboard/actions";
import EmptyState from "@/modules/dashboard/components/empty-state";
import LogoutButton from "@/modules/auth/components/logout-button";

export const metadata: Metadata = {
    title: "Profile Dashboard | Editron",
    description: "User profile analytics and dashboard",
};

export default async function ProfilePage() {
    const user = await currentUser();
    if (!user?.id) {
        return <div className="p-8 text-center text-muted-foreground">Please log in to view your profile.</div>;
    }

    // Optimization: Pass user.id directly to avoid re-fetching auth
    const stats = await getUserProfileStats(user.id);

    if (!stats) {
        return <div className="p-8 text-center text-muted-foreground">Error loading stats.</div>;
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans pb-8">

            {/* Top Navigation Wrapper for Profile Context */}
            <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border/50 bg-background/80 backdrop-blur-xl px-6 justify-between">
                <div className="flex items-center gap-4 w-full max-w-xl">
                    <h1 className="text-xl font-bold tracking-tight mr-4 hidden md:block">Profile</h1>
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search projects, files, templates..."
                            className="h-9 w-full rounded-md border border-input bg-muted/50 px-9 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <div className="absolute right-2 top-2 text-[10px] text-muted-foreground border px-1.5 rounded bg-background">⌘K</div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <HeaderNewProjectButton />
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[1px]">
                        <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                            <Image src={user.image || "/placeholder.svg"} alt="User" width={32} height={32} className="object-cover" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* User Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-background">
                            <Image src={user.image || "/placeholder.svg"} alt={user.name || "User"} width={96} height={96} className="object-cover" />
                        </div>
                        <div className="absolute bottom-0 right-0 h-6 w-6 bg-green-500 border-2 border-background rounded-full" title="Online" />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-3xl font-bold tracking-tight">{user.name}</h2>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            {user.email}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <LogoutButton>
                            <Button variant="outline" className="gap-2 text-red-500 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-600">
                                <LogOut className="w-4 h-4" />
                                Logout
                            </Button>
                        </LogoutButton>
                    </div>
                </div>

                {/* 2. KPI Stats */}
                <KPIStats stats={stats} />

                {/* 3. Heatmap */}
                <ContributionHeatmap data={stats.heatmapData} />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="xl:col-span-2 space-y-8">

                        {/* 4. Analytics */}
                        <UsageAnalytics activityData={stats.heatmapData} techStack={stats.techStackDistribution} />

                        {/* 6. Running Environments & AI Insights removed as per request */}

                        {/* Projects Tabs */}
                        <Tabs defaultValue="all" className="w-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">Projects</h3>
                                <TabsList>
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="starred">Starred</TabsTrigger>
                                </TabsList>
                            </div>
                            <TabsContent value="all" className="mt-0">
                                {stats.playgrounds.length > 0 ? (
                                    <CompactProjectTable
                                        projects={stats.playgrounds}
                                        onDeleteProject={deleteProjectById}
                                        onUpdateProject={editProjectById}
                                        onDuplicateProject={duplicateProjectById}
                                    />
                                ) : (
                                    <div className="bg-card border border-border/50 rounded-xl p-8">
                                        <EmptyState />
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="starred" className="mt-0">
                                {stats.playgrounds.filter((p: any) => p.Starmark?.length > 0 && p.Starmark[0].isMarked).length > 0 ? (
                                    <CompactProjectTable
                                        projects={stats.playgrounds.filter((p: any) => p.Starmark?.length > 0 && p.Starmark[0].isMarked)}
                                        onDeleteProject={deleteProjectById}
                                        onUpdateProject={editProjectById}
                                        onDuplicateProject={duplicateProjectById}
                                    />
                                ) : (
                                    <div className="bg-card border border-border/50 rounded-xl p-8 text-center text-muted-foreground">
                                        No starred projects yet.
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">
                        {/* 9. Quick Actions */}
                        <QuickActions />

                        {/* H. Recent Activity */}
                        <RecentActivity activities={stats.recentActivity} />
                    </div>
                </div>

            </main>
        </div>
    );
}
