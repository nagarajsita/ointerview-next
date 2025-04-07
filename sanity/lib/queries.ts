import { defineQuery } from "next-sanity";

export const INTERVIEWER_BY_GITHUB_ID_QUERY = defineQuery(`
    *[_type=='interviewer' && id==$id][0]{
    _id,id,name,username,email,image,bio}
    `);

export const INTERVIEW_BY_INTERVIEWER_QUERY =
  defineQuery(`*[_type == "interview" && interviewer._ref == $id] | order(_createdAt desc) {
  name,
  date_time,
  status,
  feedback{
    asset->{
      url,
  }}
}`);


export const INTERVIEW_BY_INTERVIEWER_ID_QUERY =
  defineQuery(`*[_type == "interview" && interviewer._ref == $id] | order(_createdAt desc) {
    id,
    name,
  date_time,
  status,
}`);

export const USER_DETAILS_ID_REF_ID_QUERY =
  defineQuery(`*[_type == "interview" && interviewer._ref == $id && id==$rid][0] {
    _id,
    id,
    name,
    email,
    date_time,
    status,
}`);
