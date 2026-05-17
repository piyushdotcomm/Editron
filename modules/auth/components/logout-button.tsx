"use client";
import React from 'react'
import { LogoutButtonProps } from '../types'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react';

const LogoutButton = ({ children }: LogoutButtonProps) => {
  const router = useRouter();
  const onLogout = async () => {
    await signOut()
    router.refresh()
  }
  return (
    <button 
      type='button'
      className='cursor-pointer' 
      onClick={onLogout}
    >
      {children}
    </button>
  )
}

export default LogoutButton
