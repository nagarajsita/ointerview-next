'use client'
import { signIn } from 'next-auth/react'
import React from 'react'

const SignIn = () => {
  return (
    <div className='h-full flex justify-center items-center'>
      <button className='justify-center items-center ring-2' onClick={async () => {
        await signIn('google', { callbackUrl: '/dashboard' });
        }}>
        Login with Google 
      </button>   
    </div>
  )
}

export default SignIn;