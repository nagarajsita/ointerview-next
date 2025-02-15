import { getServerSession } from "next-auth";
import React from "react";

const SessionDetails = async () => {
  const session = await getServerSession();

  return (
    <div>
      {session?.user?.name} {session?.user?.email}
    </div>
  );
};

export default SessionDetails;
