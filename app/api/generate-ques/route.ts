// app/api/generate-questions/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || ""); // Use server-side env variable (no NEXT_PUBLIC_ prefix)

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { resumeData } = body;

    if (!resumeData) {
      return NextResponse.json(
        { error: "Resume data is required" },
        { status: 400 }
      );
    }

    const prompt = `
       Based on the following resume details, generate a set of technical interview questions formatted specifically for my React component:

${JSON.stringify(resumeData)}

Return ONLY a properly formatted JSON object with these exact keys and structure:

{
  "technicalquestions": [
     // Array of 10-12 string questions about all listed languages and technologies(each should have minimum 1 question).
  ],
  "projectquestions": [
    // Array of objects with this exact structure:
    {
      "project": "ProjectName",
      "questions": [
        // Array of 2-3 string questions related to this specific project
      ]
    }
    // Include separate objects for each project mentioned
  ],
  "certifications": [
    // Array of objects with this exact structure:
    {
      "certification": "CertificationName",
      "questions": [
        // Array of 2-3 string questions related to this certification
      ]
    }
    // Include separate objects for each certification mentioned
  ],
  "behavioural": [
    // Array of 5-7 string behavioural questions
  ],
  "codingchallenges": [
    // Array of exactly 3 objects with this exact structure:
    {
      "title": "Challenge Title",
      "description": "Detailed description of the challenge",
      "focus": "Main skill being tested (e.g., 'Algorithms', 'Data Structures', 'React')"
    }
  ],
  "experiences":[
    //Generate only if there is section experience or experiences
   // Array of 5-7 string experience based questions 
   ]
}

Ensure the output is valid JSON that matches exactly this structure, as it will be directly passed to a React component.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    if (!text) {
      return NextResponse.json(
        { error: "Failed to generate content" },
        { status: 500 }
      );
    }

    try {   
    return new Response(JSON.stringify({response:text}), { status: 200 });
    } catch (error) {
      // If parsing fails, return the raw text
      return NextResponse.json({ error });
    }
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}
