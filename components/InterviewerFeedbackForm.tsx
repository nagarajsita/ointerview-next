import { CircleX, ListRestart, Save } from "lucide-react";
import React, { useState, useEffect } from "react";
import FeedbackPDF from "./FeedbackPDF";
import { updateCandidateResume } from "@/lib/actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const InterviewerFeedbackForm = ({candidateDets,resumeLink}:any) => {
  // Initialize state from localStorage or use default initial state
  // console.log(candidateDets);
  // console.log(resumeLink);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [open,setOpen]=useState(false);
  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("interviewFeedbackData", JSON.stringify(formData));
    }
  }, [formData]);  


  // Function to get initial state
  function getInitialState() {
    return {
      candidateName: candidateDets?.name ,
      positionAppliedFor: "",
      interviewDate: candidateDets?.date_time,

      // Technical Skills
      technicalSkills: {
        coreTechnicalKnowledge: { rating: 0, comments: "" },
        problemSolvingAbility: { rating: 0, comments: "" },
        technicalCommunication: { rating: 0, comments: "" },
        industryKnowledge: { rating: 0, comments: "" },
        toolSoftwareProficiency: { rating: 0, comments: "" },
      },
      technicalSkillsSummary: "",

      // Behavioral Competencies
      behavioralCompetencies: {
        communication: { rating: 0, comments: "" },
        teamwork: { rating: 0, comments: "" },
        adaptability: { rating: 0, comments: "" },
        initiative: { rating: 0, comments: "" },
        workEthic: { rating: 0, comments: "" },
        leadershipPotential: { rating: 0, comments: "" },
        culturalFit: { rating: 0, comments: "" },
      },

      // Specific Questions
      specificQuestions: [
        { question: "", responseQuality: "", notes: "" },
        { question: "", responseQuality: "", notes: "" },
      ],

      candidateQuestions: "",

      // Overall Assessment
      strengths: ["", "", ""],
      developmentAreas: ["", "", ""],
      concerns: "",

      // Final Recommendation
      recommendation: "",
      overallRating: "",
      additionalComments: "",

      // Next Steps
      nextSteps: [],
      otherNextSteps: "",
    };
  }

  // Add a function to reset the form if needed
  const resetForm = () => {
    if (
      window.confirm(
        "Are you sure you want to reset the form? All entered data will be lost."
      )
    ) {
      const freshState = getInitialState();
      setFormData(freshState);
      // localStorage.removeItem("interviewFeedbackData");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  //   const handleNestedInputChange = (category: string, field: string, value: string | number) => {
  //     setFormData({
  //       ...formData,
  //       [category]: {
  //         ...formData[category],
  //         [field]: value
  //       }
  //     });
  //   };

  const handleTechnicalSkillChange = (
    skill: string,
    field: string,
    value: string | number
  ) => {
    setFormData({
      ...formData,
      technicalSkills: {
        ...formData.technicalSkills,
        [skill]: {
          ...formData.technicalSkills[skill],
          [field]: value,
        },
      },
    });
  };

  const handleBehavioralCompetencyChange = (
    competency: string,
    field: string,
    value: string | number
  ) => {
    setFormData({
      ...formData,
      behavioralCompetencies: {
        ...formData.behavioralCompetencies,
        [competency]: {
          ...formData.behavioralCompetencies[competency],
          [field]: value,
        },
      },
    });
  };

  const handleQuestionChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedQuestions = [...formData.specificQuestions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      specificQuestions: updatedQuestions,
    });
  };

  const handleListItemChange = (
    listName: string,
    index: number,
    value: string
  ) => {
    const updatedList = [...formData[listName]];
    updatedList[index] = value;

    setFormData({
      ...formData,
      [listName]: updatedList,
    });
  };

  const handleNextStepsChange = (step: string, isChecked: boolean) => {
    if (isChecked) {
      setFormData({
        ...formData,
        nextSteps: [...formData.nextSteps, step],
      });
    } else {
      setFormData({
        ...formData,
        nextSteps: formData.nextSteps.filter((item: string) => item !== step),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically send the data to your backend
    // For example: axios.post('/api/interview-feedback', formData)
    // Optional: Clear localStorage after successful submission
    try {
        await updateCandidateResume(candidateDets._id,resumeLink)
    } catch (error) {
      console.error('Failed to update document:', error);
      // Handle the error appropriately (e.g., show an error message to the user)
    } finally {
      setIsSubmitted(true);
    }
    
    // localStorage.removeItem("interviewFeedbackData");

    // setFormData(getInitialState());
    
  };

  // Response quality options
  const responseQualityOptions = [
    { value: "Poor", label: "Poor" },
    { value: "Fair", label: "Fair" },
    { value: "Good", label: "Good" },
    { value: "Excellent", label: "Excellent" },
  ];

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-full shadow-lg flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Interview Feedback
        </button>
      </div>
    );
  }

  if (!isSubmitted) {
    return (
      <div className="fixed bottom-0 right-0 z-50 w-full md:w-2/3 lg:w-1/2 xl:w-2/5 h-screen overflow-y-auto bg-white shadow-lg border-l border-t border-gray-200">
        <div className="sticky top-0 bg-white z-10 p-4 shadow-md shadow-blue-300 flex justify-between items-center">
          <h1 className="text-lg font-bold">Candidate Interview Feedback</h1>
          <div className="flex space-x-2">
            {/* <button
              type="button"
              title="Save"
              onClick={() => {
                // Save current progress explicitly
                localStorage.setItem(
                  "interviewFeedbackData",
                  JSON.stringify(formData)
                );
                alert("Progress saved successfully!");
              }}
              className="p-2 bg-gray-200 text-white rounded-full hover:bg-gray-300 transition-all duration-200 shadow-md"
            >
              <Save color="black" className="size-5" />
            </button> */}

            <button
              type="button"
              title="Reset"
              onClick={resetForm}
              className="p-2 bg-red-200 text-white rounded-full hover:bg-red-600 transition-all duration-200 shadow-md "
            >
              <ListRestart color="black" className="size-5" />
            </button>

            <button
              title="Close"
              onClick={() => setIsExpanded(false)}
              className="p-2 bg-gray-200 rounded-full hover:bg-gray-300  transition-all duration-200 shadow-md "
              aria-label="Minimize form"
            >
              <CircleX color="black" className="size-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-3 text-sm">
          {/* Basic Information */}
          <section className="mb-8 p-3 bg-blue-300/50 rounded-lg ring-black ring-2">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Candidate Name</label>
                <input
                  type="text"
                  name="candidateName"
                  value={candidateDets.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Candiate email</label>
                <input
                  type="string"
                  name="interviewDate"
                  value={candidateDets.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Interview Date</label>
                <input
                  type="string"
                  name="interviewDate"
                  value={candidateDets.date_time}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                  readOnly
                />
              </div>
            </div>
          </section>

          {/* Technical Skills Assessment */}
          <section className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-indigo-200 text-indigo-700 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Technical Skills Assessment
            </h2>

            <p className="mb-5 text-sm italic text-gray-600 bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
              Rate the candidate&apos;s technical skills relevant to the
              position (1 star = Unsatisfactory, 5 stars = Exceptional)
            </p>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full mb-4">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                    <th className="p-3 text-left font-medium">Skill Area</th>
                    <th className="p-3 text-center font-medium">Rating</th>
                    <th className="p-3 text-left font-medium">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: "coreTechnicalKnowledge",
                      label: "Core Technical Knowledge",
                    },
                    {
                      id: "problemSolvingAbility",
                      label: "Problem-Solving Ability",
                    },
                    {
                      id: "technicalCommunication",
                      label: "Technical Communication",
                    },
                    { id: "industryKnowledge", label: "Industry Knowledge" },
                    {
                      id: "toolSoftwareProficiency",
                      label: "Tool/Software Proficiency",
                    },
                  ].map((skill, index) => (
                    <tr
                      key={skill.id}
                      className={`border-b ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-indigo-50 transition-colors duration-150`}
                    >
                      <td className="p-3 font-medium text-gray-700">
                        {skill.label}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                handleTechnicalSkillChange(
                                  skill.id,
                                  "rating",
                                  star
                                )
                              }
                              className="focus:outline-none"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                viewBox="0 0 20 20"
                                fill={
                                  star <=
                                  formData.technicalSkills[skill.id].rating
                                    ? "gold"
                                    : "none"
                                }
                                stroke="gray"
                                strokeWidth={0.2}
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={formData.technicalSkills[skill.id].comments}
                          onChange={(e) =>
                            handleTechnicalSkillChange(
                              skill.id,
                              "comments",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          placeholder="Add comments..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <label className="block mb-2 font-medium text-gray-700">
                Technical Skills Summary
              </label>
              <textarea
                name="technicalSkillsSummary"
                value={formData.technicalSkillsSummary}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                rows={4}
                placeholder="Provide examples of strengths and areas for improvement based on technical assessment"
              ></textarea>
            </div>
          </section>

          {/* Behavioral Competencies */}
          <section className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-indigo-200 text-indigo-700 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Behavioral Competencies
            </h2>

            <p className="mb-5 text-sm italic text-gray-600 bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
              Rate the candidate&apos;s behavioral competencies (1 star =
              Unsatisfactory, 5 stars = Exceptional)
            </p>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full mb-4">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                    <th className="p-3 text-left font-medium">Competency</th>
                    <th className="p-3 text-center font-medium">Rating</th>
                    <th className="p-3 text-left font-medium">
                      Comments/Examples
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: "communication", label: "Communication" },
                    { id: "teamwork", label: "Teamwork" },
                    { id: "adaptability", label: "Adaptability" },
                    { id: "initiative", label: "Initiative" },
                    { id: "workEthic", label: "Work Ethic" },
                    {
                      id: "leadershipPotential",
                      label: "Leadership Potential",
                    },
                    { id: "culturalFit", label: "Cultural Fit" },
                  ].map((competency, index) => (
                    <tr
                      key={competency.id}
                      className={`border-b ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-indigo-50 transition-colors duration-150`}
                    >
                      <td className="p-3 font-medium text-gray-700">
                        {competency.label}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                handleBehavioralCompetencyChange(
                                  competency.id,
                                  "rating",
                                  star
                                )
                              }
                              className="focus:outline-none"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                viewBox="0 0 20 20"
                                fill={
                                  star <=
                                  formData.behavioralCompetencies[competency.id]
                                    .rating
                                    ? "gold"
                                    : "none"
                                }
                                stroke="gray"
                                strokeWidth={0.2}
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={
                            formData.behavioralCompetencies[competency.id]
                              .comments
                          }
                          onChange={(e) =>
                            handleBehavioralCompetencyChange(
                              competency.id,
                              "comments",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          placeholder="Add specific examples..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Specific Question Responses */}
          <section className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-indigo-200 text-indigo-700 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Specific Question Responses
            </h2>

            <p className="mb-5 text-sm italic text-gray-600 bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
              Document key questions asked and evaluate the quality of responses
            </p>

            {formData.specificQuestions.map(
              (questionData: any, index: number) => (
                <div
                  key={index}
                  className="mb-6 p-5 border border-gray-200 rounded-lg bg-gray-50 hover:bg-indigo-50 transition-colors duration-150 shadow-sm"
                >
                  <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-3 font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">
                      Question {index + 1}
                    </h3>
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 font-medium text-gray-700">
                      Question
                    </label>
                    <input
                      type="text"
                      value={questionData.question}
                      onChange={(e) =>
                        handleQuestionChange(index, "question", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter question asked"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 font-medium text-gray-700">
                      Response Quality
                    </label>
                    <select
                      value={questionData.responseQuality}
                      onChange={(e) =>
                        handleQuestionChange(
                          index,
                          "responseQuality",
                          e.target.value
                        )
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="">Select Quality</option>
                      {responseQualityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      value={questionData.notes}
                      onChange={(e) =>
                        handleQuestionChange(index, "notes", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      rows={3}
                      placeholder="Enter response notes"
                    ></textarea>
                  </div>
                </div>
              )
            )}

            <button
              type="button"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-md hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-md flex items-center justify-center font-medium"
              onClick={() => {
                setFormData({
                  ...formData,
                  specificQuestions: [
                    ...formData.specificQuestions,
                    { question: "", responseQuality: "", notes: "" },
                  ],
                });
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Question
            </button>
          </section>

          {/* Candidate Questions */}
          <section className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-indigo-200 text-indigo-700 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Candidate Questions
            </h2>

            <p className="mb-5 text-sm italic text-gray-600 bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
              List questions asked by the candidate and assess their quality
            </p>

            <div className="relative">
              <textarea
                name="candidateQuestions"
                value={formData.candidateQuestions}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 min-h-[150px]"
                rows="4"
                placeholder="Enter candidate's questions and your assessment here..."
              ></textarea>
              <div className="absolute bottom-3 right-3 text-gray-400 text-sm">
                {formData.candidateQuestions.length} / 1000
              </div>
            </div>
          </section>

          {/* Overall Assessment */}
          <section className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-indigo-200 text-indigo-700 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              Overall Assessment
            </h2>

            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-indigo-600">
                Strengths
              </h3>
              <p className="mb-3 text-sm italic text-gray-600">
                List 3-5 key strengths demonstrated during the interview
              </p>

              {formData.strengths.map((strength: string, index: number) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    value={strength}
                    onChange={(e) =>
                      handleListItemChange("strengths", index, e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder={`Strength ${index + 1}`}
                  />
                </div>
              ))}
            </div>

            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-indigo-600">
                Areas for Development
              </h3>
              <p className="mb-3 text-sm italic text-gray-600">
                List areas where the candidate could improve or may need
                additional support
              </p>

              {formData.developmentAreas.map((area: string, index: number) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    value={area}
                    onChange={(e) =>
                      handleListItemChange(
                        "developmentAreas",
                        index,
                        e.target.value
                      )
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder={`Development Area ${index + 1}`}
                  />
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-indigo-600">
                Concerns
              </h3>
              <textarea
                name="concerns"
                value={formData.concerns}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                rows="4"
                placeholder="Note any red flags or significant concerns about the candidate"
              ></textarea>
            </div>
          </section>

          {/* Final Recommendation */}
          <section className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-indigo-200 text-indigo-700 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Final Recommendation
            </h2>

            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              {[
                {
                  value: "Strong Hire",
                  label: "Strong Hire - Candidate exceeds requirements",
                  color: "bg-green-100 border-green-500 text-green-800",
                },
                {
                  value: "Hire",
                  label: "Hire - Candidate meets all requirements",
                  color: "bg-blue-100 border-blue-500 text-blue-800",
                },
                {
                  value: "Hire with Reservations",
                  label:
                    "Hire with Reservations - Candidate meets most requirements but has some gaps",
                  color: "bg-yellow-100 border-yellow-500 text-yellow-800",
                },
                {
                  value: "Do Not Hire",
                  label:
                    "Do Not Hire - Candidate does not meet critical requirements",
                  color: "bg-red-100 border-red-500 text-red-800",
                },
              ].map((option) => (
                <div key={option.value} className="mb-3">
                  <label
                    className={`flex items-center p-3 rounded-md border-l-4 ${
                      option.color
                    } cursor-pointer transition-all duration-200 hover:shadow-sm ${
                      formData.recommendation === option.value
                        ? "shadow-md"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="recommendation"
                      value={option.value}
                      checked={formData.recommendation === option.value}
                      onChange={handleInputChange}
                      className="form-radio mr-3 h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <label className="block mb-2 font-medium text-gray-700">
                Overall Rating (1-10)
              </label>
              <div className="flex items-center">
                {[...Array(10)].map((_, i) => {
                  const ratingValue = i + 1;
                  return (
                    <button
                      type="button"
                      key={ratingValue}
                      onClick={() => {
                        const e = {
                          target: { name: "overallRating", value: ratingValue },
                        };
                        handleInputChange(e);
                      }}
                      className="focus:outline-none mr-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-8 w-8 transition-colors duration-200 ${
                          ratingValue <= formData.overallRating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  );
                })}
                <span className="ml-3 text-lg font-medium text-indigo-600">
                  {formData.overallRating
                    ? `${formData.overallRating}/10`
                    : "Not rated"}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block mb-2 font-medium text-gray-700">
                Additional Comments
              </label>
              <textarea
                name="additionalComments"
                value={formData.additionalComments}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                rows="4"
                placeholder="Provide any additional insights or observations about the candidate"
              ></textarea>
            </div>
          </section>

          {/* Next Steps */}
          <section className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-indigo-200 text-indigo-700 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
              Next Steps
            </h2>

            <p className="mb-4 font-medium text-gray-700 bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
              Recommended Follow-up
            </p>

            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              {[
                {
                  id: "Additional interview needed",
                  icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                },
                {
                  id: "Technical assessment",
                  icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z",
                },
                {
                  id: "Reference check",
                  icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                },
                {
                  id: "Proceed to offer",
                  icon: "M13 10V3L4 14h7v7l9-11h-7z",
                },
              ].map((step) => (
                <div key={step.id} className="mb-3">
                  <label className="flex items-center p-2 rounded-md hover:bg-indigo-50 transition-colors duration-150 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.nextSteps.includes(step.id)}
                      onChange={(e) =>
                        handleNextStepsChange(step.id, e.target.checked)
                      }
                      className="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-3 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={step.icon}
                        />
                      </svg>
                      {step.id}
                    </span>
                  </label>
                </div>
              ))}

              <div className="mt-4 flex items-center">
                <label className="flex items-center p-2 rounded-md hover:bg-indigo-50 transition-colors duration-150 cursor-pointer mr-2">
                  <input
                    type="checkbox"
                    checked={formData.nextSteps.includes("Other")}
                    onChange={(e) =>
                      handleNextStepsChange("Other", e.target.checked)
                    }
                    className="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-3 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-indigo-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Other:
                  </span>
                </label>
                <input
                  type="text"
                  name="otherNextSteps"
                  value={formData.otherNextSteps}
                  onChange={handleInputChange}
                  className={`flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    !formData.nextSteps.includes("Other")
                      ? "bg-gray-100 text-gray-500"
                      : "bg-white"
                  }`}
                  disabled={!formData.nextSteps.includes("Other")}
                  placeholder="Specify other next steps..."
                />
              </div>
            </div>
          </section>

          {/* Submit and Action Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium text-lg transition-all duration-200 shadow-md flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    );
  }
  if (isSubmitted) {
    if(!open){
   return(
   <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <FeedbackPDF data={formData} isOpen={setOpen} doc_id={candidateDets._id}/>
    </div>)}
  }
};

export default InterviewerFeedbackForm;
