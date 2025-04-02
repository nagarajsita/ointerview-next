import { MoveLeft, MoveRight } from "lucide-react";
import React, { useState, useRef } from "react";

interface QuestionData {
  technicalquestions?: string[];
  projectquestions?: { project: string; questions: string[] }[];
  certifications?: { certification: string; questions: string[] }[];
  behavioural?: string[];
  codingchallenges?: { title: string; description: string; focus: string }[];
  experiences?: string[];
}

const SimpleQuestionCards = ({ data }: { data: QuestionData }) => {
  const [activeSection, setActiveSection] = useState("technical");
  const carouselRef = useRef<HTMLDivElement>(null);

  if (!data) {
    return <div className="p-6 text-center text-gray-500 text-lg">No data available</div>;
  }

  // Scroll functions
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 350, behavior: "smooth" });
    }
  };

  const renderCarousel = (
    items: string[] | { title: string; description: string; focus?: string }[],
    label: string
  ) => {
    return (
      <div className="relative flex items-center">
        <button
          onClick={scrollLeft}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 shadow-md"
        >
          <MoveLeft />
        </button>

        <div
          ref={carouselRef}
          className="flex overflow-x-auto space-x-4 scrollbar-hide snap-x scroll-smooth w-full"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item, index) => (
            <div key={index} className="flex-shrink-0 w-80 p-5 bg-white shadow-lg rounded-xl border border-gray-200 mx-2 snap-center overflow-y-auto">
              <div className="h-full flex flex-col justify-between">
                {typeof item === "string" ? (
                  <p className="text-gray-800 text-base">{item}</p>
                ) : (
                  <>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-700 text-sm">{item.description}</p>
                  </>
                )}
                <div className="mt-auto">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-md">
                    {label} #{index + 1}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={scrollRight}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 shadow-md"
        >
          <MoveRight />
        </button>
      </div>
    );
  };

  return (
    <div className="w-full h-[430px] mx-auto p-6 bg-white rounded-lg shadow-md overflow-y-auto">
      {/* Category Tabs */}
      <div className="mb-8 flex text-sm flex-wrap gap-2 justify-center">
        {[
          { key: "technical", label: "Technical" },
          { key: "project", label: "Projects" },
          { key: "certification", label: "Certifications" },
          { key: "behavioural", label: "Behavioural" },
          { key: "coding", label: "Coding" },
          { key: "experiences", label: "Experiences" },
        ].map((category) => (
          <button
            key={category.key}
            onClick={() => setActiveSection(category.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSection === category.key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Render Questions Based on Active Section */}
      <div className="overflow-y-auto pr-2">
        {activeSection === "technical" && data.technicalquestions && renderCarousel(data.technicalquestions, "Technical")}
        {activeSection === "project" &&
          data.projectquestions &&
          data.projectquestions.map((projectGroup) => (
            <div key={projectGroup.project} className="mb-6">
              <h3 className="font-bold text-lg mb-3 text-gray-800">{projectGroup.project}</h3>
              {renderCarousel(projectGroup.questions, projectGroup.project)}
            </div>
          ))}
        {activeSection === "certification" &&
          data.certifications &&
          data.certifications.map((certGroup) => (
            <div key={certGroup.certification} className="mb-6">
              <h3 className="font-bold text-lg mb-3 text-gray-800">{certGroup.certification}</h3>
              {renderCarousel(certGroup.questions, certGroup.certification)}
            </div>
          ))}
        {activeSection === "behavioural" && data.behavioural && renderCarousel(data.behavioural, "Behavioural")}
        {activeSection === "coding" && data.codingchallenges && renderCarousel(data.codingchallenges, "Coding")}
        {activeSection === "experiences" && data.experiences && renderCarousel(data.experiences, "Experience")}
      </div>
    </div>
  );
};

export default SimpleQuestionCards;
