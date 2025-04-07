"use client"
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import React from 'react'

const Logout = () => {
  return (
    <div className='cursor-pointer text-blue-600 pt-1.5 px-2 text-xl rounded-full justify-center items-center '>
      <button
        onClick={async () => {
          await signOut({callbackUrl:'/'});        
        }}
      >
        <LogOut className='self-center size-[20px]'/>
      </button>
    </div>
  )
}

export default Logout;
