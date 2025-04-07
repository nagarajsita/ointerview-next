import { auth } from "@/auth";
import React from "react";

const SessionDetails = async () => {
  const session = await auth();
  const fullName = session?.user?.name;

  return (
    <div
      title={fullName}
      className="cursor-default bg-blue-500 text-white px-2 text-xl rounded-full justify-center items-center"
    >
      {session?.user?.name[0]}
    </div>
  );
};

export default SessionDetails;
