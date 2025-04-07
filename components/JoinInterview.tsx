"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { INTERVIEW_BY_INTERVIEWER_ID_QUERY } from "@/sanity/lib/queries";
import { Session } from "next-auth";

interface Interview {
  id: string;
  name: string;
  date_time: string;
  status: string;
}

export default function JoinInterviews({
  session,
  children,
}: {
  session: Session;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleModal = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (!isOpen) return;
    
    setLoading(true);
    
    client
      .fetch(INTERVIEW_BY_INTERVIEWER_ID_QUERY, { id: session?.id })
      .then((data) => {
        const now = new Date();
        const tenMinsLater = new Date(now.getTime() + 10 * 60000);
        
        const upcoming = (data || []).filter((interview: Interview) => {
          const interviewTime = new Date(interview.date_time);
          return interviewTime > now && interviewTime <= tenMinsLater;
        });
        
        setInterviews(upcoming);
      })
      .finally(() => setLoading(false));
  }, [isOpen, session?.id]);

  const handleJoin = (interviewId: string) => {
    router.push(`/interviewer/${interviewId}`);
  };

  return (
    <>
      <button
        onClick={toggleModal}
        className="appearance-none border-none bg-transparent p-0 w-full text-left"
      >
        {children}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative animate-fadeIn">
            <button
              onClick={toggleModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-semibold mb-5 text-gray-800">Upcoming Interviews</h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : interviews.length === 0 ? (
              <div className="py-8 text-center text-gray-600">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No upcoming interviews in the next 10 minutes.</p>
              </div>
            ) : (
              <ul className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {interviews.map((interview, index) => (
                  <li
                    key={index}
                    className="p-4 rounded-lg bg-yellow-50 border border-yellow-100 text-sm space-y-2 hover:shadow-md transition-shadow"
                  >
                    <p className="font-medium text-gray-800 text-base">{interview.name}</p>
                    <p className="text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(interview.date_time).toLocaleString()}
                    </p>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {interview.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleJoin(interview.id)}
                      className="w-full mt-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join Interview
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={toggleModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
