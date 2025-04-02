import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  Image,
  Font,
} from "@react-pdf/renderer";
import { X } from "lucide-react";

// Register custom fonts for a more professional look
Font.register({
  family: "OpenSans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf",
      fontWeight: 600,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf",
      fontWeight: 700,
    },
  ],
});

// Define PDF styles with enhanced aesthetics
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,

    backgroundColor: "#F8FAFC", // Lighter background for contrast
    color: "#1E293B",
  },
  headerContainer: {
    backgroundColor: "#3B82F6", // Modern blue
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderBottom: "3 solid #2563EB",
  },
  headerText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  companyInfo: {
    color: "white",
    fontSize: 10,
    textAlign: "center",
    marginTop: 5,
    opacity: 0.9,
  },
  section: {
    marginBottom: 15,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    border: "1 solid #E2E8F0",
  },
  subheading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#2563EB",
    borderBottom: "1 solid #E5E7EB",
    paddingBottom: 6,
  },
  text: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 1.6,
  },
  bullet: {
    fontSize: 12,
    marginLeft: 10,
    marginBottom: 6,
    lineHeight: 1.5,
  },
  highlight: {
    fontWeight: "bold",
    color: "#334155",
  },
  divider: {
    marginVertical: 15,
    borderBottom: "1 solid #E5E7EB",
  },
  table: {
    display: "table",
    width: "100%",
    borderCollapse: "collapse",
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1 solid #E5E7EB",
    paddingVertical: 8,
    alignItems: "center",
  },
  col: {
    width: "50%",
    paddingHorizontal: 8,
  },
  candidateInfoGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  candidateInfoItem: {
    width: "50%",
    marginBottom: 8,
  },
  recommendation: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#DBEAFE", // Light blue background
    textAlign: "center",
    marginTop: 5,
  },
  recommendationHire: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#059669", // Green for positive recommendation
  },
  recommendationReject: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#DC2626", // Red for negative recommendation
  },
  recommendationConsider: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#D97706", // Amber for neutral recommendation
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  starFilled: {
    color: "#F59E0B", // Amber color for stars
  },
  starEmpty: {
    color: "#D1D5DB", // Gray for empty stars
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    textAlign: "center",
    color: "#64748B",
    borderTop: "1 solid #E2E8F0",
    paddingTop: 10,
  },
  strengthsSection: {
    backgroundColor: "#F0FDF4", // Light green background
    border: "1 solid #DCFCE7",
  },
  developmentSection: {
    backgroundColor: "#FEF2F2", // Light red background
    border: "1 solid #FEE2E2",
  },
  skillLabel: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skillRating: {
    fontSize: 12,
    fontWeight: "bold",
  },
  summaryBox: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    border: "1 solid #DBEAFE",
  },
  summaryText: {
    fontStyle: "italic",
    fontSize: 12,
    lineHeight: 1.6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sliderContainer: {
    position: "relative",
    height: 20,
    width: "40%",
    backgroundColor: "#EFF6FF",
    marginVertical: 8,
    borderRadius: 10,
    overflow: "hidden",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
  },
  sliderFill: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "#ffdd00",
    borderRadius: 10,
    zIndex: 100,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 10,
    color: "#64748B",
    marginTop: 4,
    right: 0,
  },
});

// Improved Star rating component
const StarRating = ({ rating }) => (
  <View style={styles.sliderContainer}>
    <View style={[styles.sliderFill, { width: `${(rating / 5) * 100}%` }]} />
    <Text />
    <Text style={styles.ratingText}>({rating}/5)</Text>
  </View>
);

// Format date function
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Skill evaluation component with improved visual layout
const SkillEvaluation = ({ title, skills, color = "#2563EB" }) => (
  <View style={[styles.section, { borderTop: `3 solid ${color}` }]}>
    <Text style={[styles.subheading, { color: color }]}>{title}</Text>
    {Object.entries(skills).map(([key, value]) => (
      <View
        key={key}
        style={{
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: "1 solid #F1F5F9",
        }}
      >
        <View style={styles.skillLabel}>
          <Text style={styles.sectionTitle}>
            {key.replace(/([A-Z])/g, " $1").trim()}
          </Text>
          <Text
            style={[
              styles.skillRating,
              {
                color:
                  value.rating >= 4
                    ? "#059669"
                    : value.rating >= 3
                    ? "#D97706"
                    : "#DC2626",
              },
            ]}
          >
            {value.rating >= 4
              ? "Strong"
              : value.rating >= 3
              ? "Adequate"
              : "Needs Work"}
          </Text>
        </View>
        <StarRating rating={value.rating} />
        <Text style={styles.text}>{value.comments}</Text>
      </View>
    ))}
  </View>
);

// Get recommendation style based on the text
const getRecommendationStyle = (recommendation) => {
  const text = recommendation.toLowerCase();
  if (text.includes("hire") || text.includes("proceed")) {
    return styles.recommendationHire;
  } else if (text.includes("reject") || text.includes("not")) {
    return styles.recommendationReject;
  } else {
    return styles.recommendationConsider;
  }
};

// Enhanced PDF Component
const PDFDocument = ({ data }) => (
  <Document>
    <Page style={styles.page}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Interview Feedback Report</Text>
        <Text style={styles.companyInfo}>
          Confidential Assessment Document - HR Department
        </Text>
      </View>

      {/* Summary Box */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>
          This report summarizes the interview assessment for{" "}
          {data.candidateName} for the {data.positionAppliedFor} position,
          conducted on {formatDate(data.interviewDate)} by{" "}
          {data.interviewerName}. The overall recommendation is:{" "}
          {data.recommendation}.
        </Text>
      </View>

      {/* Candidate Information */}
      <View style={styles.section}>
        <Text style={styles.subheading}>Candidate Details</Text>
        <View style={styles.candidateInfoGrid}>
          <View style={styles.candidateInfoItem}>
            <Text style={styles.text}>
              <Text style={styles.highlight}>Candidate:</Text>{" "}
              {data.candidateName}
            </Text>
          </View>
          <View style={styles.candidateInfoItem}>
            <Text style={styles.text}>
              <Text style={styles.highlight}>Position:</Text>{" "}
              {data.positionAppliedFor}
            </Text>
          </View>
          <View style={styles.candidateInfoItem}>
            <Text style={styles.text}>
              <Text style={styles.highlight}>Interviewer:</Text>{" "}
              {data.interviewerName}
            </Text>
          </View>
          <View style={styles.candidateInfoItem}>
            <Text style={styles.text}>
              <Text style={styles.highlight}>Date:</Text>{" "}
              {formatDate(data.interviewDate)}
            </Text>
          </View>
          <View style={styles.candidateInfoItem}>
            <Text style={styles.text}>
              <Text style={styles.highlight}>Format:</Text>{" "}
              {data.interviewFormat}
            </Text>
          </View>
          <View style={styles.candidateInfoItem}>
            <Text style={styles.text}>
              <Text style={styles.highlight}>Duration:</Text>{" "}
              {data.interviewDuration}
            </Text>
          </View>
        </View>
      </View>

      {/* Technical Skills Section */}
      <SkillEvaluation
        title="Technical Skills Assessment"
        skills={data.technicalSkills}
        color="#0891B2"
      />

      {/* Behavioral Skills Section */}
      <SkillEvaluation
        title="Behavioral Competencies"
        skills={data.behavioralCompetencies}
        color="#8B5CF6"
      />

      <View style={styles.divider} />

      {/* Strengths & Development Areas */}
      <View style={{ flexDirection: "row" }}>
        <View
          style={[
            styles.section,
            styles.strengthsSection,
            { flex: 1, marginRight: 10 },
          ]}
        >
          <Text style={[styles.subheading, { color: "#059669" }]}>
            Strengths
          </Text>
          {data.strengths.map((item, index) => (
            <Text key={index} style={styles.bullet}>
              • {item}
            </Text>
          ))}
        </View>
        <View style={[styles.section, styles.developmentSection, { flex: 1 }]}>
          <Text style={[styles.subheading, { color: "#DC2626" }]}>
            Development Areas
          </Text>
          {data.developmentAreas.map((item, index) => (
            <Text key={index} style={styles.bullet}>
              • {item}
            </Text>
          ))}
        </View>
      </View>

      {/* Recommendation & Next Steps */}
      <View style={styles.section}>
        <Text style={styles.subheading}>Final Assessment</Text>
        <Text style={styles.sectionTitle}>Recommendation</Text>
        <View
          style={[
            styles.recommendation,
            {
              backgroundColor: data.recommendation
                .toLowerCase()
                .includes("hire")
                ? "#ECFDF5"
                : data.recommendation.toLowerCase().includes("reject")
                ? "#FEF2F2"
                : "#FEF3C7",
            },
          ]}
        >
          <Text style={getRecommendationStyle(data.recommendation)}>
            {data.recommendation}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Next Steps</Text>
        {data.nextSteps.map((step, index) => (
          <Text key={index} style={styles.bullet}>
            • {step}
          </Text>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>
          Generated on {new Date().toLocaleDateString()} | Confidential
          Interview Assessment | For Internal Use Only
        </Text>
      </View>
    </Page>
  </Document>
);

// Component with Download Link
const FeedbackPDF = ({data,isOpen}) => {
  const feedbackData = data;
// console.log(feedbackData);
  return (
    <div className="p-6 mx-auto bg-white rounded-lg shadow-lg border border-blue-100">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
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
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          Interview Feedback Generator
        </h2>
       
      </div>

      <div className="bg-blue-50 p-4 rounded-md mb-6 border-l-4 border-blue-500">
        <h3 className="font-semibold text-blue-800 mb-1">
          Candidate Information
        </h3>
        <p className="text-sm text-blue-700 mb-1">
          <span className="font-medium">Name:</span>{" "}
          {feedbackData.candidateName}
        </p>
        <p className="text-sm text-blue-700 mb-1">
          <span className="font-medium">Position:</span>{" "}
          {feedbackData.positionAppliedFor}
        </p>
        <p className="text-sm text-blue-700">
          <span className="font-medium">Interview Date:</span>{" "}
          {formatDate(feedbackData.interviewDate)}
        </p>
      </div>

      <div className="bg-green-50 p-3 rounded-md mb-6 border border-green-200 text-center">
        <p className="text-sm text-green-800 font-medium">
          Recommendation: {feedbackData.recommendation}
        </p>
      </div>

      <PDFDownloadLink
        document={<PDFDocument data={feedbackData} />}
        fileName={`Interview_Feedback_${feedbackData.candidateName}.pdf`}
        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-md"
      >
        {({ loading }) => (
          <span className="flex items-center justify-center">
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating PDF...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  ></path>
                </svg>
                Download Feedback PDF
              </>
            )}
          </span>
        )}
      </PDFDownloadLink>
      <button
          className='mt-3 block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-md'
          onClick={() => isOpen(true)}>
           Return to Room
          </button>

      <p className="text-xs text-gray-500 mt-4 text-center">
        This document is confidential and for internal use only.
      </p>
    </div>
  );
};

export default FeedbackPDF;
