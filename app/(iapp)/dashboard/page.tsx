import { LogIn, LucideBadgePlus } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    // Join Room Section 
    // <div className="flex flex-col md:flex-row gap-4 justify-evenly items-center h-full p-5">
    <div className="flex flex-col md:flex-row justify-center items-center gap-28 p-5 w-full h-full sm:w-auto">
      <Link href="/candidate">
        <button className="flex w-full sm:w-auto px-8 py-2 border-2 border-black hover:-translate-y-1 hover:scale-100 hover:bg-[#f5ebfa] uppercase bg-white text-black transition duration-200 text-sm md:text-lg lg:text-2xl shadow-[1px_1px_rgba(0,0,0),2px_2px_rgba(0,0,0),3px_3px_rgba(0,0,0),4px_4px_rgba(0,0,0),5px_5px_0px_0px_rgba(0,0,0)]">
          Join Room {<div className="translate-x-1 translate-y-0.5"><LogIn/></div>}
        </button>
      </Link>
  
      <Link href="/interviewer">
        <button className="flex w-full sm:w-auto px-8 py-2 border-2 border-black hover:-translate-y-1 hover:scale-100 hover:bg-[#f5ebfa] uppercase bg-white text-black transition duration-200 text-sm md:text-lg lg:text-2xl shadow-[1px_1px_rgba(0,0,0),2px_2px_rgba(0,0,0),3px_3px_rgba(0,0,0),4px_4px_rgba(0,0,0),5px_5px_0px_0px_rgba(0,0,0)]">
          Create Room {<div className="translate-x-1 translate-y-0.5"><LucideBadgePlus/></div>}
        </button>
      </Link>
    </div>
  // </div> 
  
  );
}
