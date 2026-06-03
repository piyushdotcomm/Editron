"use client";
import React from 'react'
import { LogoutButtonProps } from '../types'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const LogoutButton = ({ children, className }: LogoutButtonProps) => {
  const router = useRouter();
  const onLogout = async () => {
    await signOut()
    router.refresh()
  }
  return (
    <button 
      type='button'
      className={cn('cursor-pointer', className)} 
      onClick={onLogout}
    >
      {children}
    </button>
  )
}

export default LogoutButton
