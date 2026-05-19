"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/lib/auth/AuthContext";
import { apiClient } from "@/lib/api/client";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  GraduationCap,
  Plus,
  Trash2,
  Upload,
  ArrowRight,
  BookOpen,
  Building2,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const getNestedError = (errors: any, path: string): string | undefined => {
  const parts = path.split(".");
  let current = errors;
  for (const part of parts) {
    if (current && typeof current === "object") {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
};

const getNestedTouched = (touched: any, path: string): boolean => {
  const parts = path.split(".");
  let current = touched;
  for (const part of parts) {
    if (current && typeof current === "object") {
      current = current[part];
    } else {
      return false;
    }
  }
  return Boolean(current);
};

// Validation schemas
const oLevelSubjectSchema = Yup.object().shape({
  name: Yup.string().required("Subject name is required"),
  grade: Yup.string()
    .oneOf(
      ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"],
      "Invalid grade",
    )
    .required("Grade is required"),
});

const oLevelResultSchema = Yup.object().shape({
  examType: Yup.string()
    .oneOf(["WAEC", "NECO", "NABTEC", "GCE"], "Invalid exam type")
    .required("Exam type is required"),
  examNumber: Yup.string()
    .min(8, "Exam number must be at least 8 characters")
    .required("Exam number is required"),
  examYear: Yup.number()
    .min(2000, "Year must be 2000 or later")
    .max(new Date().getFullYear(), "Year cannot be in the future")
    .required("Exam year is required"),
  subjects: Yup.array()
    .of(oLevelSubjectSchema)
    .min(5, "At least 5 subjects are required")
    .required("Subjects are required"),
  uploadUrl: Yup.string().url("Must be a valid URL").optional(),
});

const applicationSchema = Yup.object().shape({
  // Secondary School
  secondarySchool: Yup.object().shape({
    name: Yup.string().required("Secondary school name is required"),
    yearOfGraduation: Yup.number()
      .min(1990, "Year must be 1990 or later")
      .max(new Date().getFullYear(), "Year cannot be in the future")
      .required("Year of graduation is required"),
    address: Yup.string().required("School address is required"),
  }),

  // O'Level Results
  oLevelResults: Yup.array()
    .of(oLevelResultSchema)
    .min(1, "At least one O'Level result is required"),

  // Conditional fields based on entry mode
  jamb: Yup.object().when([], {
    is: () => {
      const mode =
        typeof window !== "undefined"
          ? localStorage.getItem("applicantEntryMode")
          : null;
      return mode === "UTME";
    },
    then: (schema) =>
      schema.shape({
        registrationNumber: Yup.string()
          .matches(/^[0-9]{10,15}$/, "Invalid registration number format")
          .required("JAMB registration number is required"),
        score: Yup.number()
          .min(100, "Score must be at least 100")
          .max(400, "Score cannot exceed 400")
          .required("JAMB score is required"),
        subjectCombination: Yup.array()
          .of(Yup.string())
          .min(4, "Select 4 subjects")
          .max(4, "Select exactly 4 subjects")
          .required("Subject combination is required"),
        uploadUrl: Yup.string().url("Must be a valid URL").optional(),
      }),
    otherwise: (schema) => schema.optional(),
  }),

  // Direct Entry fields
  directEntry: Yup.object().when([], {
    is: () => {
      const mode =
        typeof window !== "undefined"
          ? localStorage.getItem("applicantEntryMode")
          : null;
      return mode === "DIRECT_ENTRY";
    },
    then: (schema) =>
      schema.shape({
        previousInstitution: Yup.string().required(
          "Previous institution is required",
        ),
        qualification: Yup.string()
          .oneOf(["OND", "NCE", "HND"], "Invalid qualification")
          .required("Qualification is required"),
        yearOfGraduation: Yup.number()
          .min(1990, "Year must be 1990 or later")
          .max(new Date().getFullYear(), "Year cannot be in the future")
          .required("Year of graduation is required"),
        transcriptAvailable: Yup.boolean(),
        programme: Yup.string()
          .oneOf(["YEAR_200", "YEAR_300"], "Invalid programme")
          .required("Programme is required"),
      }),
    otherwise: (schema) => schema.optional(),
  }),

  // Course choices
  firstChoiceId: Yup.string().required("First choice course is required"),
  secondChoiceId: Yup.string().optional(),
});

// Types
interface OLevelSubject {
  name: string;
  grade: string;
}

interface OLevelResult {
  examType: string;
  examNumber: string;
  examYear: number;
  subjects: OLevelSubject[];
  uploadUrl?: string;
}

interface FormValues {
  secondarySchool: {
    name: string;
    yearOfGraduation: number;
    address: string;
  };
  oLevelResults: OLevelResult[];
  jamb?: {
    registrationNumber: string;
    score: number;
    subjectCombination: string[];
    uploadUrl?: string;
  };
  directEntry?: {
    previousInstitution: string;
    qualification: string;
    yearOfGraduation: number;
    transcriptAvailable: boolean;
    programme: string;
  };
  firstChoiceId: string;
  secondChoiceId: string;
}

// Available subjects for O'Level
const availableSubjects = [
  "English Language",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Government",
  "Literature in English",
  "History",
  "Geography",
  "Commerce",
  "Accounting",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "Agricultural Science",
  "Further Mathematics",
  "French",
  "Yoruba",
  "Hausa",
  "Igbo",
];

// Available grades
const grades = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];

// JAMB subject combinations
const jambSubjects = [
  "Use of English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Government",
  "Literature",
  "History",
  "Geography",
  "Commerce",
  "Accounting",
  "CRS",
  "IRS",
  "Agric Science",
];

export default function ApplicationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [entryMode, setEntryMode] = useState<"UTME" | "DIRECT_ENTRY" | null>(
    null,
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const mode = localStorage.getItem("applicantEntryMode") as
      | "UTME"
      | "DIRECT_ENTRY";
    if (!mode) {
      toast.error("Please select an entry mode first");
      router.push("/register");
      return;
    }
    setEntryMode(mode);
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const response = await apiClient.get("/courses/available");
      if (response.success && response.data) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  const formik = useFormik<FormValues>({
    initialValues: {
      secondarySchool: {
        name: "",
        yearOfGraduation: new Date().getFullYear(),
        address: "",
      },
      oLevelResults: [
        {
          examType: "WAEC",
          examNumber: "",
          examYear: new Date().getFullYear(),
          subjects: [{ name: "", grade: "" }],
          uploadUrl: "",
        },
      ],
      ...(entryMode === "UTME" && {
        jamb: {
          registrationNumber: "",
          score: 0,
          subjectCombination: [],
          uploadUrl: "",
        },
      }),
      ...(entryMode === "DIRECT_ENTRY" && {
        directEntry: {
          previousInstitution: "",
          qualification: "",
          yearOfGraduation: new Date().getFullYear(),
          transcriptAvailable: false,
          programme: "YEAR_200",
        },
      }),
      firstChoiceId: "",
      secondChoiceId: "",
    },
    validationSchema: applicationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        // Get applicant ID with proper error handling
        const applicantId = user?.id || localStorage.getItem("applicantId");

        if (!applicantId) {
          toast.error("Unable to identify applicant. Please login again.");
          router.push("/login");
          return;
        }

        const applicationData = {
          secondarySchool: values.secondarySchool,
          oLevelResults: values.oLevelResults,
          ...(entryMode === "UTME" && { jamb: values.jamb }),
          ...(entryMode === "DIRECT_ENTRY" && {
            directEntry: values.directEntry,
          }),
          firstChoice: values.firstChoiceId,
          secondChoice: values.secondChoiceId || null,
        };

        const response = await apiClient.submitApplication(
          applicantId,
          applicationData,
        );

        if (response.success) {
          toast.success("Application submitted successfully!");
          localStorage.removeItem("applicantEntryMode");
          setTimeout(() => {
            router.push("/student/dashboard");
          }, 2000);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to submit application");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Add O'Level result
  const addOLevelResult = () => {
    formik.setFieldValue("oLevelResults", [
      ...formik.values.oLevelResults,
      {
        examType: "WAEC",
        examNumber: "",
        examYear: new Date().getFullYear(),
        subjects: [{ name: "", grade: "" }],
        uploadUrl: "",
      },
    ]);
  };

  // Remove O'Level result
  const removeOLevelResult = (index: number) => {
    const results = [...formik.values.oLevelResults];
    results.splice(index, 1);
    formik.setFieldValue("oLevelResults", results);
  };

  // Add subject to O'Level result
  const addSubject = (resultIndex: number) => {
    const results = [...formik.values.oLevelResults];
    results[resultIndex].subjects.push({ name: "", grade: "" });
    formik.setFieldValue("oLevelResults", results);
  };

  // Remove subject from O'Level result
  const removeSubject = (resultIndex: number, subjectIndex: number) => {
    const results = [...formik.values.oLevelResults];
    results[resultIndex].subjects.splice(subjectIndex, 1);
    formik.setFieldValue("oLevelResults", results);
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (
        !formik.values.secondarySchool.name ||
        !formik.values.secondarySchool.address
      ) {
        toast.error("Please fill in all secondary school details");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (formik.values.oLevelResults.length === 0) {
        toast.error("Please add at least one O'Level result");
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!formik.values.firstChoiceId) {
        toast.error("Please select a first choice course");
        return;
      }
      setCurrentStep(4);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Complete Your Application
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {entryMode === "UTME"
              ? "UTME Candidate - Please provide your academic details"
              : "Direct Entry Candidate - Please provide your academic details"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-center items-center gap-2 sm:gap-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= step
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-all ${
                      currentStep > step
                        ? "bg-indigo-600"
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 sm:gap-12 mt-3 text-xs sm:text-sm">
            <span
              className={
                currentStep >= 1
                  ? "text-indigo-600 font-medium"
                  : "text-gray-500"
              }
            >
              Secondary School
            </span>
            <span
              className={
                currentStep >= 2
                  ? "text-indigo-600 font-medium"
                  : "text-gray-500"
              }
            >
              O'Level Results
            </span>
            <span
              className={
                currentStep >= 3
                  ? "text-indigo-600 font-medium"
                  : "text-gray-500"
              }
            >
              {entryMode === "UTME" ? "JAMB Details" : "Previous Education"}
            </span>
            <span
              className={
                currentStep >= 4
                  ? "text-indigo-600 font-medium"
                  : "text-gray-500"
              }
            >
              Course Selection
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 md:p-8">
          <form onSubmit={formik.handleSubmit}>
            {/* Step 1: Secondary School */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Secondary School Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    School Name *
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("secondarySchool.name")}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all outline-none"
                    placeholder="Enter your secondary school name"
                  />
                  {formik.touched.secondarySchool?.name &&
                    formik.errors.secondarySchool?.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {formik.errors.secondarySchool.name}
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year of Graduation *
                  </label>
                  <input
                    type="number"
                    {...formik.getFieldProps(
                      "secondarySchool.yearOfGraduation",
                    )}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all outline-none"
                    placeholder="e.g., 2023"
                  />
                  {formik.touched.secondarySchool?.yearOfGraduation &&
                    formik.errors.secondarySchool?.yearOfGraduation && (
                      <p className="mt-1 text-sm text-red-500">
                        {formik.errors.secondarySchool.yearOfGraduation}
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    School Address *
                  </label>
                  <textarea
                    {...formik.getFieldProps("secondarySchool.address")}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all outline-none"
                    placeholder="Enter school address"
                  />
                  {formik.touched.secondarySchool?.address &&
                    formik.errors.secondarySchool?.address && (
                      <p className="mt-1 text-sm text-red-500">
                        {formik.errors.secondarySchool.address}
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* Step 2: O'Level Results */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    O'Level Results
                  </h2>
                  <button
                    type="button"
                    onClick={addOLevelResult}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Exam
                  </button>
                </div>

                {formik.values.oLevelResults.map((result, resultIndex) => (
                  <div
                    key={resultIndex}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4 relative"
                  >
                    {formik.values.oLevelResults.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOLevelResult(resultIndex)}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Exam Type *
                        </label>
                        <select
                          value={result.examType}
                          onChange={(e) => {
                            const newResults = [...formik.values.oLevelResults];
                            newResults[resultIndex].examType = e.target.value;
                            formik.setFieldValue("oLevelResults", newResults);
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                          <option value="WAEC">WAEC</option>
                          <option value="NECO">NECO</option>
                          <option value="NABTE">NABTEB</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Exam Number *
                        </label>
                        <input
                          type="text"
                          value={result.examNumber}
                          onChange={(e) => {
                            const newResults = [...formik.values.oLevelResults];
                            newResults[resultIndex].examNumber = e.target.value;
                            formik.setFieldValue("oLevelResults", newResults);
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Enter exam number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Exam Year *
                        </label>
                        <input
                          type="number"
                          value={result.examYear}
                          onChange={(e) => {
                            const newResults = [...formik.values.oLevelResults];
                            newResults[resultIndex].examYear = parseInt(
                              e.target.value,
                            );
                            formik.setFieldValue("oLevelResults", newResults);
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="e.g., 2023"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Subjects & Grades *
                        </label>
                        <button
                          type="button"
                          onClick={() => addSubject(resultIndex)}
                          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          <Plus className="w-4 h-4" />
                          Add Subject
                        </button>
                      </div>

                      <div className="space-y-3">
                        {result.subjects.map((subject, subjectIndex) => (
                          <div
                            key={subjectIndex}
                            className="flex gap-3 items-start"
                          >
                            <div className="flex-1">
                              <select
                                value={subject.name}
                                onChange={(e) => {
                                  const newResults = [
                                    ...formik.values.oLevelResults,
                                  ];
                                  newResults[resultIndex].subjects[
                                    subjectIndex
                                  ].name = e.target.value;
                                  formik.setFieldValue(
                                    "oLevelResults",
                                    newResults,
                                  );
                                }}
                                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                              >
                                <option value="">Select Subject</option>
                                {availableSubjects.map((subj) => (
                                  <option key={subj} value={subj}>
                                    {subj}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="w-32">
                              <select
                                value={subject.grade}
                                onChange={(e) => {
                                  const newResults = [
                                    ...formik.values.oLevelResults,
                                  ];
                                  newResults[resultIndex].subjects[
                                    subjectIndex
                                  ].grade = e.target.value;
                                  formik.setFieldValue(
                                    "oLevelResults",
                                    newResults,
                                  );
                                }}
                                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                              >
                                <option value="">Grade</option>
                                {grades.map((grade) => (
                                  <option key={grade} value={grade}>
                                    {grade}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {result.subjects.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeSubject(resultIndex, subjectIndex)
                                }
                                className="text-red-500 hover:text-red-700 p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Upload Certificate (Optional)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={result.uploadUrl || ""}
                          onChange={(e) => {
                            const newResults = [...formik.values.oLevelResults];
                            newResults[resultIndex].uploadUrl = e.target.value;
                            formik.setFieldValue("oLevelResults", newResults);
                          }}
                          className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                          placeholder="Enter URL to uploaded certificate"
                        />
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}

                {formik.errors.oLevelResults &&
                  typeof formik.errors.oLevelResults === "string" && (
                    <p className="text-sm text-red-500">
                      {formik.errors.oLevelResults}
                    </p>
                  )}
              </div>
            )}

            {/* Step 3: Entry Mode Specific Fields */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                {entryMode === "UTME" ? (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-600" />
                      JAMB Details
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        JAMB Registration Number *
                      </label>
                      <input
                        type="text"
                        {...formik.getFieldProps("jamb.registrationNumber")}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., 202312345678"
                      />
                      {getNestedTouched(
                        formik.touched,
                        "jamb.registrationNumber",
                      ) &&
                        getNestedError(
                          formik.errors,
                          "jamb.registrationNumber",
                        ) && (
                          <p className="mt-1 text-sm text-red-500">
                            {getNestedError(
                              formik.errors,
                              "jamb.registrationNumber",
                            )}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        JAMB Score *
                      </label>
                      <input
                        type="number"
                        {...formik.getFieldProps("jamb.score")}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., 250"
                      />
                      {getNestedTouched(formik.touched, "jamb.score") &&
                        getNestedError(formik.errors, "jamb.score") && (
                          <p className="mt-1 text-sm text-red-500">
                            {getNestedError(formik.errors, "jamb.score")}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject Combination * (Select exactly 4)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {jambSubjects.map((subject) => (
                          <label
                            key={subject}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              value={subject}
                              checked={
                                formik.values.jamb?.subjectCombination?.includes(
                                  subject,
                                ) || false
                              }
                              onChange={(e) => {
                                const current =
                                  formik.values.jamb?.subjectCombination || [];
                                let newCombination;
                                if (e.target.checked) {
                                  newCombination = [...current, subject];
                                } else {
                                  newCombination = current.filter(
                                    (s) => s !== subject,
                                  );
                                }
                                formik.setFieldValue(
                                  "jamb.subjectCombination",
                                  newCombination,
                                );
                              }}
                              className="w-4 h-4 text-indigo-600 rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {subject}
                            </span>
                          </label>
                        ))}
                      </div>
                      {getNestedTouched(
                        formik.touched,
                        "jamb.subjectCombination",
                      ) &&
                        getNestedError(
                          formik.errors,
                          "jamb.subjectCombination",
                        ) && (
                          <p className="mt-1 text-sm text-red-500">
                            {getNestedError(
                              formik.errors,
                              "jamb.subjectCombination",
                            )}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Upload JAMB Result (Optional)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          {...formik.getFieldProps("jamb.uploadUrl")}
                          className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                          placeholder="Enter URL to uploaded JAMB result"
                        />
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                      Direct Entry Information
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Previous Institution *
                      </label>
                      <input
                        type="text"
                        {...formik.getFieldProps(
                          "directEntry.previousInstitution",
                        )}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Name of previous institution"
                      />
                      {getNestedTouched(
                        formik.touched,
                        "directEntry.previousInstitution",
                      ) &&
                        getNestedError(
                          formik.errors,
                          "directEntry.previousInstitution",
                        ) && (
                          <p className="mt-1 text-sm text-red-500">
                            {getNestedError(
                              formik.errors,
                              "directEntry.previousInstitution",
                            )}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Qualification *
                      </label>
                      <select
                        {...formik.getFieldProps("directEntry.qualification")}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Qualification</option>
                        <option value="OND">
                          Ordinary National Diploma (OND)
                        </option>
                        <option value="NCE">
                          Nigeria Certificate in Education (NCE)
                        </option>
                        <option value="HND">
                          Higher National Diploma (HND)
                        </option>
                      </select>
                      {getNestedTouched(
                        formik.touched,
                        "directEntry.qualification",
                      ) &&
                        getNestedError(
                          formik.errors,
                          "directEntry.qualification",
                        ) && (
                          <p className="mt-1 text-sm text-red-500">
                            {getNestedError(
                              formik.errors,
                              "directEntry.qualification",
                            )}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Year of Graduation *
                      </label>
                      <input
                        type="number"
                        {...formik.getFieldProps(
                          "directEntry.yearOfGraduation",
                        )}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., 2022"
                      />
                      {getNestedTouched(
                        formik.touched,
                        "directEntry.yearOfGraduation",
                      ) &&
                        getNestedError(
                          formik.errors,
                          "directEntry.yearOfGraduation",
                        ) && (
                          <p className="mt-1 text-sm text-red-500">
                            {getNestedError(
                              formik.errors,
                              "directEntry.yearOfGraduation",
                            )}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Programme Applying For *
                      </label>
                      <select
                        {...formik.getFieldProps("directEntry.programme")}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="YEAR_200">Year 2 (200 Level)</option>
                        <option value="YEAR_300">Year 3 (300 Level)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        {...formik.getFieldProps(
                          "directEntry.transcriptAvailable",
                        )}
                        className="w-5 h-5 text-indigo-600 rounded"
                      />
                      <label className="text-sm text-gray-700 dark:text-gray-300">
                        I have my academic transcript available for submission
                      </label>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 4: Course Selection */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Course Selection
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Choice Course *
                  </label>
                  <select
                    {...formik.getFieldProps("firstChoiceId")}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={loadingCourses}
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title} ({course.code})
                      </option>
                    ))}
                  </select>
                  {formik.touched.firstChoiceId &&
                    formik.errors.firstChoiceId && (
                      <p className="mt-1 text-sm text-red-500">
                        {formik.errors.firstChoiceId}
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Second Choice Course (Optional)
                  </label>
                  <select
                    {...formik.getFieldProps("secondChoiceId")}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={loadingCourses}
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mt-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-medium mb-1">Important Notes:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          Ensure you meet the requirements for your chosen
                          course
                        </li>
                        <li>
                          Your admission will be based on your qualifications
                          and available slots
                        </li>
                        <li>
                          You cannot change your course choices after submission
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-8 mt-6 border-t border-gray-200 dark:border-gray-700">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Back
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
