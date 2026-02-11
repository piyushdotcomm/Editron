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
import { useState } from "react"
import { MoreHorizontal, Edit3, Trash2, ExternalLink, Eye, Star } from "lucide-react"
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

    const handleEditClick = (project: Project) => {
        setSelectedProject(project);
        setEditData({ title: project.title, description: project.description || "" })
        setEditDialogOpen(true)
    }

    const handleDeleteClick = async (project: Project) => {
        setSelectedProject(project)
        setDeleteDialogOpen(true)
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
            <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="hover:bg-muted/50 border-border/40">
                                <TableHead className="text-muted-foreground font-medium">Project</TableHead>
                                <TableHead className="text-muted-foreground font-medium hidden sm:table-cell">Template</TableHead>
                                <TableHead className="text-muted-foreground font-medium hidden md:table-cell">Updated</TableHead>
                                <TableHead className="w-[50px] text-muted-foreground font-medium"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.map((project) => {
                                const isStarred = project.Starmark?.[0]?.isMarked || false;

                                return (
                                    <TableRow key={project.id} className="hover:bg-muted/30 border-border/40 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/playground/${project.id}`} className="hover:underline hover:text-red-500 transition-colors">
                                                        <span className="font-semibold text-foreground">{project.title}</span>
                                                    </Link>
                                                    {isStarred && (
                                                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                                {project.description && (
                                                    <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] sm:max-w-[300px]">
                                                        {project.description}
                                                    </span>
                                                )}
                                                {/* Show template badge on mobile (when hidden in column) */}
                                                <div className="sm:hidden mt-1">
                                                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
                                                        {project.template}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 transition-colors">
                                                {project.template}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <span className="text-sm text-muted-foreground whitespace-nowrap">
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

            {/* Edit Project Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>
                            Make changes to your project details here. Click save when you're done.
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
                            Are you sure you want to delete "{selectedProject?.title}"? This action cannot be undone. All files and
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
