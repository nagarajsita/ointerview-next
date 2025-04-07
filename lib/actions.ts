"use server";

import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { USER_DETAILS_ID_REF_ID_QUERY } from "@/sanity/lib/queries";
import { writeClient } from "@/sanity/lib/write-client";

export const sessionDetails = async () => await auth();

export const createInterview = async (form: {
  id: string;
  name: string;
  email: string;
  date_time: string;
}) => {
  const session = await auth();
  const { id, name, email, date_time } = form;
  const interviewData = {
    id,
    name,
    email,
    date_time,
    status: "Scheduled",
    interviewer: { _type: "reference", _ref: session?.id },
  };
  try {
    const result = await writeClient.create({
      _type: "interview",
      ...interviewData,
    });
    return true;
  } catch (error) {
    console.log(error);
  }
};

export const getUserDets=async (roomId:string)=>{
  const id=(await auth()).id;
  const userDetails= await client.fetch(USER_DETAILS_ID_REF_ID_QUERY,{rid:roomId,id:id});
  return userDetails;
}

export async function updateCandidateResume(document_id: string, resumeLink: string) {
  try {
    return await writeClient
      .patch(document_id)
      .set({ resume_link: resumeLink })
      .commit()
  } catch (error) {
    console.error('Failed to update document:', error)
    throw error
  }
}


export const uploadPDFToSanity = async (blob, filename,id:string) => {
  const asset = await writeClient.assets.upload("file", blob, {
    filename,
  });
const update = await writeClient.patch(id).set({status:'Completed'}).commit();
 const res= await writeClient
    .patch(id)
    .set({
      feedback: {
        _type: "file",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
      },
    })
    .commit();

  return res; // Returns uploaded asset details
};

