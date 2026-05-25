"use client"

import Link from "next/link"
import { format } from "date-fns"
import type { Project } from "@/modules/dashboard/types"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useMemo, useState } from "react"
import { MoreHorizontal, Edit3, Trash2, ExternalLink, Eye, Star, Copy, Search } from "lucide-react"
import { toast } from "sonner"

interface CompactProjectTableProps {
    projects: Project[]
    onUpdateProject?: (id: string, data: { title: string; description: string }) => Promise<void>
    onDeleteProject?: (id: string) => Promise<void>
    onDuplicateProject?: (id: string) => Promise<any>
}

interface EditProjectData {
    title: string
    description: string
}

export default function CompactProjectTable({
    projects,
    onUpdateProject,
    onDeleteProject,
    onDuplicateProject,
}: CompactProjectTableProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [editData, setEditData] = useState<EditProjectData>({ title: "", description: "" })
    const [isLoading, setIsLoading] = useState(false)
    const [projectFilter, setProjectFilter] = useState<"all" | "starred" | "recent">("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [sortMode, setSortMode] = useState<"updated" | "name" | "template">("updated")

    const filteredProjects = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase()
        const recentThreshold = new Date()
        recentThreshold.setDate(recentThreshold.getDate() - 30)

        return [...projects]
            .filter((project) => {
                const isStarred = project.Starmark?.[0]?.isMarked || false
                const updatedAt = new Date(project.updatedAt)
                const matchesFilter =
                    projectFilter === "all" ||
                    (projectFilter === "starred" && isStarred) ||
                    (projectFilter === "recent" && updatedAt >= recentThreshold)
                const matchesSearch =
                    normalizedQuery.length === 0 ||
                    project.title.toLowerCase().includes(normalizedQuery) ||
                    project.description?.toLowerCase().includes(normalizedQuery) ||
                    project.template.toLowerCase().includes(normalizedQuery)

                return matchesFilter && matchesSearch
            })
            .sort((a, b) => {
                if (sortMode === "name") return a.title.localeCompare(b.title)
                if (sortMode === "template") return a.template.localeCompare(b.template)

                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            })
    }, [projects, projectFilter, searchQuery, sortMode])

    const handleEditClick = (project: Project) => {
        setSelectedProject(project);
        setEditData({ title: project.title, description: project.description || "" })
        setEditDialogOpen(true)
    }

    const handleDeleteClick = async (project: Project) => {
        setSelectedProject(project)
        setDeleteDialogOpen(true)
    }

    const handleDuplicateProject = async (project: Project) => {
        if (!onDuplicateProject) return
        setIsLoading(true)
        try {
            await onDuplicateProject(project.id)
            toast.success("Project duplicated successfully")
        } catch (error) {
            toast.error("Failed to duplicate project")
            console.error("Error duplicating project:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateProject = async () => {
        if (!selectedProject || !onUpdateProject) return
        setIsLoading(true);
        try {
            await onUpdateProject(selectedProject.id, editData);
            setEditDialogOpen(false);
            toast.success("Project updated successfully");
        } catch (error) {
            toast.error("Failed to update project");
            console.error("Error updating project:", error);
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteProject = async () => {
        if (!selectedProject || !onDeleteProject) return;
        setIsLoading(true);
        try {
            await onDeleteProject(selectedProject.id);
            setDeleteDialogOpen(false);
            setSelectedProject(null);
            toast.success("Project deleted successfully");
        } catch (error) {
            toast.error("Failed to delete project");
            console.error("Error deleting project:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className="rounded-lg border border-[#ebebeb] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_2px_2px_rgba(0,0,0,0.04)] dark:border-border dark:bg-card">
                <div className="flex flex-col gap-4 border-b border-[#ebebeb] p-4 dark:border-border lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <p className="font-mono text-[11px] uppercase tracking-normal text-[#888888] dark:text-muted-foreground">
                            Workspaces
                        </p>
                        <h3 className="text-xl font-semibold tracking-normal text-[#171717] dark:text-foreground">
                            Projects
                        </h3>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex rounded-md border border-[#ebebeb] bg-[#fafafa] p-1 dark:border-border dark:bg-muted/30">
                            {[
                                ["all", "All"],
                                ["starred", "Starred"],
                                ["recent", "Recent"],
                            ].map(([value, label]) => (
                                <Button
                                    key={value}
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setProjectFilter(value as "all" | "starred" | "recent")}
                                    className={`h-7 rounded-[5px] px-3 text-xs ${projectFilter === value
                                        ? "bg-white text-[#171717] shadow-sm dark:bg-background dark:text-foreground"
                                        : "text-[#4d4d4d] hover:text-[#171717] dark:text-muted-foreground dark:hover:text-foreground"
                                        }`}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                        <div className="relative min-w-[220px]">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" aria-hidden="true" />
                            <Input
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search projects..."
                                className="h-9 rounded-md border-[#ebebeb] bg-white pl-9 text-sm shadow-none dark:border-border dark:bg-card"
                            />
                        </div>
                        <select
                            value={sortMode}
                            onChange={(event) => setSortMode(event.target.value as "updated" | "name" | "template")}
                            className="h-9 rounded-md border border-[#ebebeb] bg-white px-3 text-sm text-[#171717] outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-border dark:bg-card dark:text-foreground"
                            aria-label="Sort projects"
                        >
                            <option value="updated">Recently updated</option>
                            <option value="name">Name A-Z</option>
                            <option value="template">Template</option>
                        </select>
                    </div>
                </div>

                <div className="w-full overflow-x-auto">
                <div className="min-w-[640px] sm:min-w-full">
                    <Table>
                        <TableHeader className="bg-[#fafafa] dark:bg-muted/30">
                            <TableRow className="border-[#ebebeb] hover:bg-[#fafafa] dark:border-border dark:hover:bg-muted/30">
                                <TableHead className="font-mono text-[11px] uppercase tracking-normal text-[#888888] dark:text-muted-foreground">Project</TableHead>
                                <TableHead className="hidden font-mono text-[11px] uppercase tracking-normal text-[#888888] dark:text-muted-foreground sm:table-cell">Template</TableHead>
                                <TableHead className="hidden font-mono text-[11px] uppercase tracking-normal text-[#888888] dark:text-muted-foreground md:table-cell">Updated</TableHead>
                                <TableHead className="w-[50px] font-mono text-[11px] uppercase tracking-normal text-[#888888] dark:text-muted-foreground"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProjects.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-28 text-center text-sm text-[#888888] dark:text-muted-foreground">
                                        No projects match this view.
                                    </TableCell>
                                </TableRow>
                            )}

                            {filteredProjects.map((project) => {
                                const isStarred = project.Starmark?.[0]?.isMarked || false;

                                return (
                                    <TableRow key={project.id} className="border-[#ebebeb] transition-colors hover:bg-[#fafafa] dark:border-border dark:hover:bg-muted/30">
                                        <TableCell className="font-medium">
                                            <div className="flex min-w-0 flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/playground/${project.id}`} className="min-w-0 transition-colors hover:text-red-500 hover:underline">
                                                        <span className="block max-w-[220px] truncate font-semibold text-[#171717] sm:max-w-[300px] md:max-w-[420px] dark:text-foreground">
                                                            {project.title}
                                                        </span>
                                                    </Link>
                                                    {isStarred && (
                                                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                                {project.description && (
                                                    <span className="max-w-[220px] truncate text-xs text-[#888888] sm:max-w-[300px] md:max-w-[420px] dark:text-muted-foreground">
                                                        {project.description}
                                                    </span>
                                                )}
                                                {/* Show template badge on mobile (when hidden in column) */}
                                                <div className="sm:hidden mt-1">
                                                    <Badge variant="outline" className="border-[#ebebeb] bg-[#fafafa] text-xs text-[#4d4d4d] dark:border-border dark:bg-muted/30 dark:text-muted-foreground">
                                                        {project.template}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <Badge variant="outline" className="border-[#ebebeb] bg-[#fafafa] font-mono text-[11px] text-[#4d4d4d] dark:border-border dark:bg-muted/30 dark:text-muted-foreground">
                                                {project.template}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <span className="whitespace-nowrap font-mono text-xs text-[#888888] dark:text-muted-foreground">
                                                {format(new Date(project.updatedAt), "MMM d, yyyy")}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" side="bottom">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/playground/${project.id}`} className="flex items-center cursor-pointer">
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Open Project
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/playground/${project.id}`} target="_blank" className="flex items-center cursor-pointer">
                                                            <ExternalLink className="h-4 w-4 mr-2" />
                                                            Open in New Tab
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleEditClick(project)}>
                                                        <Edit3 className="h-4 w-4 mr-2" />
                                                        Edit Project
                                                    </DropdownMenuItem>
                                                    {onDuplicateProject && (
                                                        <DropdownMenuItem onClick={() => handleDuplicateProject(project)} disabled={isLoading}>
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Duplicate Project
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(project)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Project
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
                </div>
            </div>

            {/* Edit Project Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>
                            Make changes to your project details here. Click save when you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Project Title</Label>
                            <Input
                                id="title"
                                value={editData.title}
                                onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter project title"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={editData.description}
                                onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter project description"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleUpdateProject} disabled={isLoading || !editData.title.trim()}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{selectedProject?.title}&quot;? This action cannot be undone. All files and
                            data associated with this project will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProject}
                            disabled={isLoading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isLoading ? "Deleting..." : "Delete Project"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
