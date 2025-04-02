"use client";

import { useState, useEffect } from "react";
import SimpleQuestionCards from "./SimpleQuestionCards";

export default function ResumeAnalysis({ resumeLink }: { resumeLink: string }) {
  const [parsedText, setParsedText] = useState<Record<string, string> | null>(null);
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loading1, setLoading1] = useState<boolean>(false);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false); // Track button state

  function extractJSON(input: string) {
    return input.replace(/^```json\s*|\s*```$/g, "").trim();
  }

  const extractText = async () => {
    if (!resumeLink) return;
    setLoading1(true);
    setButtonDisabled(true); // Disable button after first click

    try {
      const res = await fetch("/api/extract-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driveUrl: resumeLink }),
      });

      const data = await res.json();
      if (data.text) {
        setParsedText(data.text);
      } else {
        console.error("Failed to extract text");
        setButtonDisabled(false); // Re-enable button if extraction fails
      }
    } catch (error) {
      console.error("Error extracting resume:", error);
      setButtonDisabled(false);
    } finally {
      setLoading1(false);
    }
  };

  useEffect(() => {
    if (!parsedText) return;

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/generate-ques", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeData: parsedText }),
        });
        
        const generatedResponse=await res.json();
        setResponse(extractJSON(generatedResponse.response));
      }

      // try {
      //   const generatedResponse = await generateInterviewQuestions(parsedText);
        
      //   setResponse(extractJSON(generatedResponse));
      // }
       catch (error) {
        console.error("Error generating questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [parsedText]);

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {!buttonDisabled && (
        <button
          onClick={extractText}
          className={`p-2 bg-blue-500 text-white rounded transition-opacity ${
            buttonDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
          }`}
          disabled={buttonDisabled}
        >
          Generate Questions
        </button>
      )}

      {loading1 && <div className="animate-pulse text-xl text-gray-600">Parsing resume...</div>}

      {loading && <div className="animate-pulse text-xl text-gray-600">Analyzing and generating questions...</div>}

      {response && <SimpleQuestionCards data={JSON.parse(response)} />}
    </div>
  );
}
