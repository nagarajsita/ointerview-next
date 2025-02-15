'use client'
import {  ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation'
import React from 'react'
export const CallToActionButton = () => {
    const router=useRouter();

  return (
    <div>
         <button 
          onClick={() =>{router.push("/dashboard")}}
          className="inline-flex text-[14px]  h-10 items-center justify-center px-4 font-medium text-blue-500 hover:text-blue-700 focus:animate-ping"
        > 
          See Demo <ArrowRight className='size-3'/>
        </button>
        <button 
          onClick={() => window.location.href = '/signin'}
          className="inline-flex text-[14px] h-10 items-center justify-center px-4 font-medium text-blue-500 hover:text-blue-700 focus:animate-ping"
        >
          Sign In
        </button>
    </div>
  )
}
