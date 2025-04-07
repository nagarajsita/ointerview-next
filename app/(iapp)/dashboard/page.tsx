{
  // import { LogIn, LucideBadgePlus } from "lucide-react";
  // import Link from "next/link";
  // export default function Home() {
  //   return (
  //     // Join Room Section
  //     // <div className="flex flex-col md:flex-row gap-4 justify-evenly items-center h-full p-5">
  //     <div className="flex flex-col md:flex-row justify-center items-center gap-28 p-5 w-full h-full sm:w-auto">
  //       <Link href="/candidate">
  //         <button className="flex w-full sm:w-auto px-8 py-2 border-2 border-black hover:-translate-y-1 hover:scale-100 hover:bg-[#f5ebfa] uppercase bg-white text-black transition duration-200 text-sm md:text-lg lg:text-2xl shadow-[1px_1px_rgba(0,0,0),2px_2px_rgba(0,0,0),3px_3px_rgba(0,0,0),4px_4px_rgba(0,0,0),5px_5px_0px_0px_rgba(0,0,0)]">
  //           Join Room {<div className="translate-x-1 translate-y-0.5"><LogIn/></div>}
  //         </button>
  //       </Link>
  //       <Link href="/interviewer">
  //         <button className="flex w-full sm:w-auto px-8 py-2 border-2 border-black hover:-translate-y-1 hover:scale-100 hover:bg-[#f5ebfa] uppercase bg-white text-black transition duration-200 text-sm md:text-lg lg:text-2xl shadow-[1px_1px_rgba(0,0,0),2px_2px_rgba(0,0,0),3px_3px_rgba(0,0,0),4px_4px_rgba(0,0,0),5px_5px_0px_0px_rgba(0,0,0)]">
  //           Create Room {<div className="translate-x-1 translate-y-0.5"><LucideBadgePlus/></div>}
  //         </button>
  //       </Link>
  //     </div>
  //   // </div>
  //   );
  // }
}

import React from "react";
import { Calendar, Plus, Users } from "lucide-react";
import { auth, signIn } from "@/auth";
import ScheduleInterview from "@/components/ScheduleInterview";
import ViewInterviews from "@/components/ViewInterviews";
import JoinInterviews from "@/components/JoinInterview";

const Dashboard = async () => {
  const session = await auth();
  // console.log(session.id);
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = currentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1>You are not logged in</h1>
        <form
          action={async () => {
            "use server";
            await signIn("github");
          }}
        >
          <button
            className='className="z-10 ml-auto px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"'
            type="submit"
          >
            LogIn
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 p-2 shadow-md rounded-lg">
        <div className=" rounded-xl p-6 mb-8 relative overflow-hidden shadow-lg">
          <div className="text-6xl font-bold">{formattedTime}</div>
          <div className="text-xl text-gray-600 mt-2">{formattedDate}</div>

          {/* Decorative image element */}
          <div className="absolute right-0 bottom-0 w-1/3 h-full opacity-20">
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-bl-full"></div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          <ScheduleInterview>
            <div className="bg-purple-500 rounded-xl p-6 hover:bg-purple-600 transition-colors">
              <div className="bg-purple-400 bg-opacity-30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Calendar size={24} />
              </div>

              <h3 className="text-xl font-bold mb-2 self-start">
                Schedule Interview
              </h3>
              <p className="text-purple-100">Plan your interviews</p>
            </div>
          </ScheduleInterview>
          <ViewInterviews session={session}>
            <div className="bg-orange-500 rounded-xl p-6 hover:bg-orange-600 transition-colors">
              <div className="bg-orange-400 bg-opacity-30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Plus size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">View Interviews</h3>
              <p className="text-orange-100">View all Interviews</p>
            </div>
          </ViewInterviews>
          <JoinInterviews session={session}>
          <div
            className="bg-blue-500 rounded-xl p-6 hover:bg-blue-600 transition-colors"
          >
            <div className="bg-blue-400 bg-opacity-30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Join Interview</h3>
            <p className="text-blue-100">Interview Scheduled in 10 minutes</p>
          </div>
          </JoinInterviews>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
