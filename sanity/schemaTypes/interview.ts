import { ListIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

export const interview = defineType({
  name: "interview",
  title: "Interview",
  type: "document",
  icon: ListIcon,
  fields: [
    defineField({
      name: "id",
      type: "string",
    }),
    defineField({
      name: "name",
      type: "string",
    }),
    defineField({
      name: "email",
      type: "string",
    }),
    defineField({
      name: "date_time",
      type: "datetime",
    }),
    defineField({
      name: "resume_link",
      type: "url",
    }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: ["Scheduled", "Completed", "Canceled"],
      },
    }),
    defineField({
      name: "feedback",
      type: "file",
      options: {
        accept: "application/pdf",
      },
    }),
    defineField({
      name: "interviewer",
      type: "reference",
      to: {
        type: "interviewer",
      },
    }),
  ],
});
