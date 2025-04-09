"use client"; // This ensures the component runs on the client side
import React, { useEffect, useState } from "react";

const ClientTime = () => {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const currentDate = new Date();
      const formattedTime = currentDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const formattedDate = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setTime(formattedTime);
      setDate(formattedDate);
    };

    updateTime(); // Set initial time
    const timer = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  return (
    <div className="rounded-xl p-6 mb-8 relative overflow-hidden shadow-lg">
      <div className="text-6xl font-bold">{time}</div>
      <div className="text-xl text-gray-600 mt-2">{date}</div>

      {/* Decorative image element */}
      <div className="absolute right-0 bottom-0 w-1/3 h-full opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-bl-full"></div>
      </div>
    </div>
  );
};

export default ClientTime;
