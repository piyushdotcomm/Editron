//import { Empty } from '@/components/ui/empty';
import { deleteProjectById, duplicateProjectById, editProjectById, getAllPlaygroundForUser } from '@/modules/dashboard/actions';
import AddNewButton from '@/modules/dashboard/components/add-new'
import AddRepo from '@/modules/dashboard/components/add-repo'
import EmptyState from '@/modules/dashboard/components/empty-state';
import ProjectTable from '@/modules/dashboard/components/project-table';
import React from 'react'

import { currentUser } from '@/modules/auth/actions';
import LogoutButton from '@/modules/auth/components/logout-button';
import { LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const Page = async () => {
  const playgrounds = await getAllPlaygroundForUser();
  const user = await currentUser();



  return (
    <div className="relative min-h-screen bg-background selection:bg-primary/20 overflow-hidden font-sans">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <main className="flex flex-col items-center justify-start pt-6 px-4 w-full max-w-7xl mx-auto space-y-12 pb-20">

        {/* Header Section */}
        <section className="relative z-10 w-full flex flex-row items-start justify-between animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col items-start space-y-4">
            <div className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-sm text-red-500 backdrop-blur-md cursor-default">
              <span className="flex h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
              <span className="font-medium">Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
              My <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 italic pr-2">Projects</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Manage your playgrounds, repositories, and creative coding experiments.
            </p>
          </div>

          {/* Profile Description */}
          {user && (
            <div className="hidden md:flex flex-row items-center gap-4 bg-background/50 backdrop-blur-md border border-border/50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 max-w-sm">
              <Link href="/dashboard/profile">
                <div className="h-12 w-12 rounded-full overflow-hidden border border-border hover:ring-2 hover:ring-red-500/50 transition-all cursor-pointer">
                  <Image
                    src={user.image || "/placeholder.svg"}
                    alt={user.name || "User"}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
              </Link>
              <div className="flex flex-col">
                <Link href="/dashboard/profile" className="hover:underline underline-offset-2 decoration-red-500/50">
                  <h3 className="font-bold text-foreground cursor-pointer">{user.name}</h3>
                </Link>
                <p className="text-xs text-muted-foreground line-clamp-2">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <LogoutButton>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 cursor-pointer transition-colors">
                      <LogOut size={10} />
                      <span>Logout</span>
                    </div>
                  </LogoutButton>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          <AddNewButton />
          <AddRepo />
        </div>

        {/* Projects Table */}
        <div className='w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200'>
          {
            playgrounds && playgrounds.length === 0 ? (
              <EmptyState />
            ) : (
              <ProjectTable
                projects={playgrounds || []}
                onDeleteProject={deleteProjectById}
                onUpdateProject={editProjectById}
                onDuplicateProject={duplicateProjectById}
              />
            )
          }
        </div>

      </main>
    </div>
  )
}
export default Page
