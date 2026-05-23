"use client";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiClient } from "@/lib/api/client";
import {
  Save,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building2,
  Calendar,
  FileText,
  Upload,
  Plus,
  Trash2,
  GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";

interface OLevelSubject {
  name: string;
  grade: string;
}

interface OLevelResult {
  examType: string;
  examNumber: string;
  examYear: number;
  subjects: OLevelSubject[];
}

interface Department {
  id: string;
  name: string;
  code: string;
  courses: Array<{
    id: string;
    title: string;
    code: string;
    program: string;
  }>;
}

const grades = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];
const subjects = [
  "English Language",
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
  "Agricultural Science",
  "Computer Science",
  "Further Mathematics",
];

const applicationSchema = Yup.object({
  // JAMB Details
  jambRegistrationNumber: Yup.string().when("entryMode", {
    is: (val: string) => val && val.toUpperCase() === "UTME",
    then: () => Yup.string().required("JAMB registration number is required"),
  }),
  jambScore: Yup.number().when("entryMode", {
    is: (val: string) => val && val.toUpperCase() === "UTME",
    then: () =>
      Yup.number()
        .min(100, "Minimum score is 100")
        .max(400, "Maximum score is 400"),
  }),

  // Direct Entry Details
  previousInstitution: Yup.string(),
  qualification: Yup.string(),
  yearOfGraduation: Yup.number(),

  // Choices
  firstChoice: Yup.string().required("Please select a course"),
  secondChoice: Yup.string(),

  // Secondary School
  secondarySchoolName: Yup.string(),
  secondarySchoolYear: Yup.number(),
});

export default function ApplicationPage() {
  const [applicantId, setApplicantId] = useState<string>("");
  // ! Note  department => firstChoice id || departments => secondChoice id
  const [department, setDepartment] = useState<Department[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");

  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [oLevelResults, setOLevelResults] = useState<OLevelResult[]>([
    {
      examType: "WAEC",
      examNumber: "",
      examYear: new Date().getFullYear(),
      subjects: [],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [entryMode, setEntryMode] = useState<"UTME" | "DIRECT_ENTRY">("UTME");

  useEffect(() => {
    const id = localStorage.getItem("applicantId");
    if (id) {
      setApplicantId(id);
      fetchExistingApplication(id);
    }
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await apiClient.getPublicDepartments();
      if (response.success) {
        setDepartments(response.data);
        setDepartment(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const fetchExistingApplication = async (id: string) => {
    try {
      const response = await apiClient.getApplicationStatus(id);
      if (
        response.success &&
        response.data &&
        response.data.status !== "draft"
      ) {
        // Load existing data
        formik.setValues({
          ...response.data,
          entryMode: response.data.entryMode,
        });
        setEntryMode(response.data.entryMode);
      }
    } catch (error) {
      console.error("Failed to fetch application:", error);
    }
  };

  const formik = useFormik({
    initialValues: {
      entryMode: "UTME",
      jambRegistrationNumber: "",
      jambScore: "",
      jambSubjectCombination: [] as string[],
      firstChoice: "",
      secondChoice: "",
      previousInstitution: "",
      qualification: "",
      yearOfGraduation: "",
      secondarySchoolName: "",
      secondarySchoolYear: "",
      secondarySchoolAddress: "",
    },
    validationSchema: applicationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const applicationData = {
          ...values,
          jambScore: values.jambScore
            ? parseInt(values.jambScore as string)
            : undefined,
          yearOfGraduation: values.yearOfGraduation
            ? parseInt(values.yearOfGraduation as string)
            : undefined,
          secondarySchoolYear: values.secondarySchoolYear
            ? parseInt(values.secondarySchoolYear as string)
            : undefined,
          oLevelResults,
        };

        await apiClient.submitApplication(applicantId, applicationData);
        toast.success("Application submitted successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to submit application");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      // await apiClient.updateApplication(applicantId, formik.values);
      toast.success("Application saved as draft");
    } catch (error: any) {
      toast.error(error.message || "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  const addOLevelResult = () => {
    setOLevelResults([
      ...oLevelResults,
      {
        examType: "WAEC",
        examNumber: "",
        examYear: new Date().getFullYear(),
        subjects: [],
      },
    ]);
  };

  const removeOLevelResult = (index: number) => {
    setOLevelResults(oLevelResults.filter((_, i) => i !== index));
  };

  const addSubject = (resultIndex: number) => {
    const newSubjects = [
      ...oLevelResults[resultIndex].subjects,
      { name: "", grade: "" },
    ];
    const newResults = [...oLevelResults];
    newResults[resultIndex].subjects = newSubjects;
    setOLevelResults(newResults);
  };

  const updateSubject = (
    resultIndex: number,
    subjectIndex: number,
    field: string,
    value: string,
  ) => {
    const newResults = [...oLevelResults];
    newResults[resultIndex].subjects[subjectIndex] = {
      ...newResults[resultIndex].subjects[subjectIndex],
      [field]: value,
    };
    setOLevelResults(newResults);
  };

  const removeSubject = (resultIndex: number, subjectIndex: number) => {
    const newResults = [...oLevelResults];
    newResults[resultIndex].subjects = newResults[resultIndex].subjects.filter(
      (_, i) => i !== subjectIndex,
    );
    setOLevelResults(newResults);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Application Form
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Complete your admission application
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Draft
          </button>
          <button
            type="submit"
            form="application-form"
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Submit Application
          </button>
        </div>
      </div>

      {/* Form Sections */}
      <form id="application-form"
      onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Entry Mode Display */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            <strong>Entry Mode:</strong> {entryMode}
          </p>
        </div>

        {/* JAMB Section (UTME only) */}
        {formik.values.entryMode &&
          formik.values.entryMode.toUpperCase() === "UTME" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                JAMB Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    JAMB Registration Number{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("jambRegistrationNumber")}
                    value={formik.values.jambRegistrationNumber ?? ""}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                    placeholder="e.g., 202412345678"
                  />
                  {formik.touched.jambRegistrationNumber &&
                    formik.errors.jambRegistrationNumber && (
                      <p className="mt-1 text-sm text-red-500">
                        {formik.errors.jambRegistrationNumber}
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    JAMB Score <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...formik.getFieldProps("jambScore")}
                     value={formik.values.jambScore ?? ""}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                    placeholder="e.g., 250"
                  />
                </div>
              </div>
            </div>
          )}

        {/* Direct Entry Section */}
        {formik.values.entryMode && formik.values.entryMode.toUpperCase() === "DIRECT_ENTRY" &&  (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Previous Institution Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Previous Institution
                </label>
                <input
                  type="text"
                  {...formik.getFieldProps("previousInstitution")}
                  value={formik.values.previousInstitution ?? ""}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                  placeholder="University/College name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Qualification Obtained
                </label>
                <select
                  {...formik.getFieldProps("qualification")}
                    value={formik.values.qualification ?? ""}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                >
                  <option value="">Select Qualification</option>
                  <option value="OND">OND - Ordinary National Diploma</option>
                  <option value="NCE">
                    NCE - Nigeria Certificate in Education
                  </option>
                  <option value="HND">HND - Higher National Diploma</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Year of Graduation
                </label>
                <input
                  type="number"
                  {...formik.getFieldProps("yearOfGraduation")}
                  value={formik.values.yearOfGraduation ?? ""}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                  placeholder="e.g., 2020"
                />
              </div>
            </div>
          </div>
        )}

        {/* Course Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            Course Selection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Choice Course *
              </label>
              <select
                {...formik.getFieldProps("firstChoice")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
              >
                <option value={formik.values.firstChoice || ""}>
                  First Choice
                </option>
                {department.map((dept) => (
                  <option key={dept.id} value={dept.courses?.[0]?.id || ""}>
                    {dept.name.split(" ")[0]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Second Choice Course (Optional)
              </label>
              <select
                {...formik.getFieldProps("secondChoice")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
              >
                <option value={formik.values.secondChoice || ""}>
                  Select Course
                </option>
                {departments.flatMap((dept) => (
                  <option key={dept.id} value={dept.courses?.[0]?.id}>
                    {dept.name.split(" ")[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* O'Level Results */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              O'Level Results
            </h2>
            <button
              type="button"
              onClick={addOLevelResult}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Another Result
            </button>
          </div>

          {oLevelResults.map((result, resultIndex) => (
            <div
              key={resultIndex}
              className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Exam Result {resultIndex + 1}</h3>
                {resultIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => removeOLevelResult(resultIndex)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Exam Type
                  </label>
                  <select
                    value={result.examType}
                    onChange={(e) => {
                      const newResults = [...oLevelResults];
                      newResults[resultIndex].examType = e.target.value;
                      setOLevelResults(newResults);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                  >
                    <option value="WAEC">WAEC</option>
                    <option value="NECO">NECO</option>
                    <option value="NABTEB">NABTEB</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Exam Number
                  </label>
                  <input
                    type="text"
                    value={result.examNumber}
                    onChange={(e) => {
                      const newResults = [...oLevelResults];
                      newResults[resultIndex].examNumber = e.target.value;
                      setOLevelResults(newResults);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                    placeholder="e.g., 42567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Exam Year
                  </label>
                  <input
                    type="number"
                    value={result.examYear}
                    onChange={(e) => {
                      const newResults = [...oLevelResults];
                      newResults[resultIndex].examYear = parseInt(
                        e.target.value,
                      );
                      setOLevelResults(newResults);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                    placeholder="e.g., 2023"
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium">Subjects</label>
                  <button
                    type="button"
                    onClick={() => addSubject(resultIndex)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Subject
                  </button>
                </div>
                <div className="space-y-2">
                  {result.subjects.map((subject, subjectIndex) => (
                    <div key={subjectIndex} className="flex gap-3 items-center">
                      <select
                        value={subject.name}
                        onChange={(e) =>
                          updateSubject(
                            resultIndex,
                            subjectIndex,
                            "name",
                            e.target.value,
                          )
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 text-sm"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((subj) => (
                          <option key={subj} value={subj}>
                            {subj}
                          </option>
                        ))}
                      </select>
                      <select
                        value={subject.grade}
                        onChange={(e) =>
                          updateSubject(
                            resultIndex,
                            subjectIndex,
                            "grade",
                            e.target.value,
                          )
                        }
                        className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 text-sm"
                      >
                        <option value="">Grade</option>
                        {grades.map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeSubject(resultIndex, subjectIndex)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary School Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Secondary School Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                School Name
              </label>
              <input
                type="text"
                {...formik.getFieldProps("secondarySchoolName")}
                value={formik.values.secondarySchoolName ?? ""}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                placeholder="Secondary school name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Year of Graduation
              </label>
              <input
                type="number"
                {...formik.getFieldProps("secondarySchoolYear")}
                value={formik.values.secondarySchoolYear ?? ""}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                placeholder="e.g., 2020"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                School Address
              </label>
              <textarea
                {...formik.getFieldProps("secondarySchoolAddress")}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                placeholder="School address"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
