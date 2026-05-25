import { Metadata } from "next";
import { currentUser } from "@/modules/auth/actions";
import { getUserProfileStats } from "@/modules/profile/actions";
import KPIStats from "@/modules/profile/components/KPIStats";
import ContributionHeatmap from "@/modules/profile/components/ContributionHeatmap";
import UsageAnalytics from "@/modules/profile/components/UsageAnalytics";
import RecentActivity from "@/modules/profile/components/RecentActivity";
import { QuickActions } from "@/modules/profile/components/SidebarWidgets";
import HeaderNewProjectButton from "@/modules/profile/components/HeaderNewProjectButton";
import { ArrowLeft, CalendarDays, LogOut, Mail, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import CompactProjectTable from "@/modules/profile/components/CompactProjectTable";
import { deleteProjectById, duplicateProjectById, editProjectById } from "@/modules/dashboard/actions";
import LogoutButton from "@/modules/auth/components/logout-button";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Profile Dashboard | Editron",
    description: "User profile analytics and dashboard",
};

export default async function ProfilePage() {
    const user = await currentUser();
    if (!user?.id) {
        return (
            <div className="min-h-screen bg-background p-8 text-center text-muted-foreground">
                Please log in to view your profile.
            </div>
        );
    }

    const stats = await getUserProfileStats(user.id);

    if (!stats) {
        return (
            <div className="min-h-screen bg-background p-8 text-center text-muted-foreground">
                Error loading stats.
            </div>
        );
    }

    const latestProject = stats.playgrounds[0];

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#fafafa] text-[#171717] dark:bg-background dark:text-foreground">
            <header className="sticky top-0 z-30 border-b border-[#ebebeb] bg-white/85 px-4 backdrop-blur-xl dark:border-border dark:bg-background/85 sm:px-6">
                <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="font-mono text-[11px] uppercase tracking-normal text-[#888888] dark:text-muted-foreground">
                            Dashboard / Profile
                        </p>
                        <h1 className="truncate text-lg font-semibold tracking-normal text-[#171717] dark:text-foreground">
                            Account console
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="hidden border-[#ebebeb] bg-white text-[#171717] shadow-none hover:bg-[#fafafa] dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted/30 sm:inline-flex"
                        >
                            <Link href="/dashboard">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Dashboard
                            </Link>
                        </Button>
                        <HeaderNewProjectButton />
                        <Image
                            src={user.image || "/placeholder.svg"}
                            alt={user.name ? `${user.name} avatar` : "User avatar"}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full border border-[#ebebeb] object-cover dark:border-border"
                        />
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-lg border border-[#ebebeb] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_2px_2px_rgba(0,0,0,0.04)] dark:border-border dark:bg-card">
                    <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_25%_20%,rgba(0,124,240,0.16),transparent_32%),radial-gradient(circle_at_58%_0%,rgba(255,0,128,0.12),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(249,203,40,0.16),transparent_24%)] dark:opacity-60" />

                    <div className="relative grid gap-6 p-5 lg:grid-cols-[1.4fr_1fr_auto] lg:items-end lg:p-6">
                        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-[#ebebeb] bg-white p-1 shadow-[0_8px_16px_-8px_rgba(0,0,0,0.18)] dark:border-border dark:bg-card">
                                <Image
                                    src={user.image || "/placeholder.svg"}
                                    alt={user.name ? `${user.name} avatar` : "User avatar"}
                                    width={96}
                                    height={96}
                                    className="h-full w-full rounded-full object-cover"
                                />
                                <span className="absolute bottom-2 right-2 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-card" />
                            </div>

                            <div className="min-w-0 space-y-3">
                                <div>
                                    <p className="font-mono text-[11px] uppercase tracking-normal text-[#888888] dark:text-muted-foreground">
                                        Developer profile
                                    </p>
                                    <h2 className="break-words text-3xl font-semibold tracking-normal text-[#171717] dark:text-foreground sm:text-4xl">
                                        {user.name || "Editron user"}
                                    </h2>
                                </div>
                                <div className="flex min-w-0 flex-col gap-2 text-sm text-[#4d4d4d] dark:text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center">
                                    <span className="inline-flex min-w-0 items-center gap-2">
                                        <Mail className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{user.email}</span>
                                    </span>
                                    <span className="hidden h-1 w-1 rounded-full bg-[#d4d4d4] sm:block" />
                                    <span className="inline-flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 shrink-0" />
                                        Workspace owner
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3">
                            {[
                                ["Projects", stats.totalProjects],
                                ["Starred", stats.starredProjects],
                                ["Streak", `${stats.currentStreak}d`],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="rounded-md border border-[#ebebeb] bg-white/80 p-3 dark:border-border dark:bg-background/60"
                                >
                                    <p className="font-mono text-[10px] uppercase tracking-normal text-[#888888] dark:text-muted-foreground">
                                        {label}
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold leading-none text-[#171717] dark:text-foreground">
                                        {value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 lg:justify-end">
                            <LogoutButton>
                                <Button
                                    variant="outline"
                                    className="border-[#ebebeb] bg-white text-[#171717] shadow-none hover:bg-[#fafafa] dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted/30"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </Button>
                            </LogoutButton>
                        </div>
                    </div>
                </section>

                <KPIStats stats={stats} />

                <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="min-w-0 space-y-6">
                        <CompactProjectTable
                            projects={stats.playgrounds}
                            onDeleteProject={deleteProjectById}
                            onUpdateProject={editProjectById}
                            onDuplicateProject={duplicateProjectById}
                        />

                        <ContributionHeatmap data={stats.heatmapData} />

                        <UsageAnalytics activityData={stats.heatmapData} techStack={stats.techStackDistribution} />
                    </div>

                    <aside className="min-w-0 space-y-6">
                        <div className="rounded-lg border border-[#ebebeb] bg-white p-5 shadow-[0_1px_1px_rgba(0,0,0,0.02),0_2px_2px_rgba(0,0,0,0.04)] dark:border-border dark:bg-card">
                            <p className="font-mono text-[11px] uppercase tracking-normal text-[#888888] dark:text-muted-foreground">
                                Workspace
                            </p>
                            <h3 className="mt-1 text-xl font-semibold tracking-normal text-[#171717] dark:text-foreground">
                                Account snapshot
                            </h3>
                            <div className="mt-5 space-y-3 text-sm">
                                <div className="flex items-center justify-between gap-4 border-b border-[#ebebeb] pb-3 dark:border-border">
                                    <span className="text-[#4d4d4d] dark:text-muted-foreground">Latest project</span>
                                    <span className="truncate font-medium text-[#171717] dark:text-foreground">
                                        {latestProject?.title || "No projects"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4 border-b border-[#ebebeb] pb-3 dark:border-border">
                                    <span className="text-[#4d4d4d] dark:text-muted-foreground">Last update</span>
                                    <span className="inline-flex items-center gap-1 font-mono text-xs text-[#888888] dark:text-muted-foreground">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        {latestProject ? new Date(latestProject.updatedAt).toLocaleDateString() : "-"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[#4d4d4d] dark:text-muted-foreground">Active days</span>
                                    <span className="font-mono text-xs text-[#888888] dark:text-muted-foreground">
                                        {stats.heatmapData.length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <QuickActions />
                        <RecentActivity activities={stats.recentActivity} />
                    </aside>
                </div>
            </main>
        </div>
    );
}
