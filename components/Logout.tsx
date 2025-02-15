'use client'
import { signOut } from 'next-auth/react';
import React from 'react'

const Logout = () => {
  return (
    <div>
            <button
        onClick={async () => {
          await signOut({callbackUrl:'/'});        
        }}
      >
        logout
      </button>
    </div>
  )
}

export default Logout