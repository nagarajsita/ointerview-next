import React from "react";
import { Code, MessageSquare, Video } from "lucide-react";
import { CallToActionButton } from "@/components/CallToActionButton";

export default function Hero() {
  return (
    <div className="flex flex-col justify-center items-center bg-gradient-radial from-blue-50 via-white to-blue-100 min-h-screen w-full relative overflow-hidden p-4">
      {/* Enhanced Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/30 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-300/20 blur-[80px] rounded-full animate-pulse delay-1000" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-purple-300/20 blur-[60px] rounded-full animate-pulse delay-500" />
      
      <div className="absolute top-3 right-32 gap-4 z-20 hidden md:block">
     <CallToActionButton/>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center max-w-6xl mx-auto mb-1">
        {/* Header Section */}
        <div className="mb-12 text-center cursor-default">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold">
            <span className="text-blue-600 drop-shadow-lg">O</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500">
              Interview
            </span>
          </h1>

          <h2 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Technical Interviews, Reimagined
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-gray-600 leading-relaxed">
            A platform for seamless technical interviews with integrated video
            calls, real-time coding, and comprehensive evaluation tools.
          </p>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto p-4">
          {/* Card 1 */}
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Video
                className="text-blue-600 group-hover:scale-110 transition-transform"
                size={24}
              />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Crystal Clear Video Calls
            </h3>
            <p className="text-gray-600">
              High-quality WebRTC-powered video conferencing for face-to-face
              interactions.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Code
                className="text-blue-600 group-hover:scale-110 transition-transform"
                size={24}
              />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Live Coding Environment
            </h3>
            <p className="text-gray-600">
              Real-time collaborative code editor for authentic coding
              assessment.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <MessageSquare
                className="text-blue-600 group-hover:scale-110 transition-transform"
                size={24}
              />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Instant Communication
            </h3>
            <p className="text-gray-600">
              Integrated chat system for sharing links and additional
              information.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-1 w-full text-center text-sm text-gray-600">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-gray-700">OInterview</span>. All
        rights reserved.
      </footer>
    </div>
  );
}
