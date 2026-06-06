"use client";
import React from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const LogoutButton = () => {
  const router = useRouter();
  const onLogout = async () => {
    await signOut()
    router.refresh()
  }
  return (
    <Button
      variant="outline"
      className="cursor-pointer gap-2 text-red-500 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-600"
      onClick={onLogout}
    >
      <LogOut className="w-4 h-4" />
      Logout
    </Button>
  )
}

export default LogoutButton
