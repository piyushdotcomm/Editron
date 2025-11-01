import { SidebarProvider } from "@/components/ui/sidebar";
import { getAllPlaygroundForUser } from "@/modules/dashboard/actions";
import { DashboardSidebar } from "@/modules/dashboard/components/dashboard-sidebar";

export default async function ({
    children
}: {
    children: React.ReactNode
}) {

    const playgroundData = await getAllPlaygroundForUser();
    const technologyIconMap: Record<string, string> = {
    REACT: "Zap",
    NEXTJS: "Lightbulb",
    EXPRESS: "Database",
    VUE: "Compass",
    HONO: "FlameIcon",
    ANGULAR: "Terminal",
    }

    const formattedPlaygroundData = playgroundData?.map((item)=>({
        id:item.id,
        name:item.title,
        starred:false,
        icon: technologyIconMap[item.template] || "Code"
    }))

    return (<SidebarProvider>
        <div className="flex min-h-screen w-full overflow-x-hidden">
            {/*Dashboard Sidebar */}
            {/* @ts-ignore */}
            <DashboardSidebar initialPlaygroundData={formattedPlaygroundData} />
            <main className="flex-1">
                {children}
            </main>

        </div>
    </SidebarProvider>
    )
}