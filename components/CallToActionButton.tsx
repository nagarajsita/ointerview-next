"use client";

import Image from "next/image";
import React from "react";
import { signIn, signOut } from "next-auth/react";
import { Session } from "next-auth";
import Link from "next/link";

export const CallToActionButton = ({ details }: { details: Session | null }) => {
  return (

    <div>
    <Link href={"/candidate"}>
    <p className="inline-flex text-[14px] h-10 items-center justify-center px-4 font-medium text-blue-500 hover:text-blue-700 focus:animate-ping">Join Interview</p>
    </Link>
      {!details ? (
        <button
          onClick={() => signIn()}
          className="inline-flex text-[14px] h-10 items-center justify-center px-4 font-medium text-blue-500 hover:text-blue-700 focus:animate-ping"
        >
          Interviewer Login
        </button>
      ) : (
        <Image
          src={details.user?.image || "/default.png"} // fallback if image is null
          alt="User"
          width={30}
          height={30}
          onClick={() => signOut({redirectTo:"/"})}
          className="rounded-full cursor-pointer"
        />
      )}
    </div>
  );
};