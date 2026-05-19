"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import {
  Search,
  Upload,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";

interface Course {
  id: string;
  code: string;
  title: string;
}

interface Student {
  id: string;
  name: string;
  matricNumber: string;
  score?: number;
}

export default function LecturerGradingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getLecturerCourses();
      setCourses(response.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCourseStudents(selectedCourse);
      const studentsData = response.data || [];
      setStudents(studentsData);

      // Load existing scores
      const scoresResponse = await apiClient.getEditableScores(selectedCourse);
      const existingScores = scoresResponse.data || [];
      const scoresMap: Record<string, number> = {};
      existingScores.forEach((s: any) => {
        scoresMap[s.studentId] = s.score;
      });
      setScores(scoresMap);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (studentId: string, score: number) => {
    setScores((prev) => ({ ...prev, [studentId]: score }));
  };

  const handleSubmitGrades = async () => {
    const scoresToSubmit = Object.entries(scores).map(([studentId, score]) => ({
      studentId,
      score,
    }));

    if (scoresToSubmit.length === 0) {
      toast.error("No scores to submit");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.uploadScores(selectedCourse, scoresToSubmit);
      toast.success("Grades submitted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit grades");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkUpload = () => {
    // Implement CSV upload functionality
    toast.success("Bulk upload feature coming soon!");
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Grade Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Upload and manage student grades
        </p>
      </div>

      {/* Course Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Course
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.title}
              </option>
            ))}
          </select>
          <button
            onClick={handleBulkUpload}
            disabled={!selectedCourse}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Bulk Upload
          </button>
        </div>
      </div>

      {/* Grading Table */}
      {selectedCourse && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    S/N
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Matric Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((student, idx) => {
                  const score = scores[student.id] || 0;
                  let grade = "";
                  if (score >= 70) grade = "A";
                  else if (score >= 60) grade = "B";
                  else if (score >= 50) grade = "C";
                  else if (score >= 45) grade = "D";
                  else grade = "F";

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {student.matricNumber}
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={score || ""}
                          onChange={(e) =>
                            handleScoreChange(
                              student.id,
                              parseInt(e.target.value),
                            )
                          }
                          className={`w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${getScoreColor(score)}`}
                          min="0"
                          max="100"
                          step="1"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            score >= 70
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : score >= 60
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : score >= 50
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {selectedCourse && students.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmitGrades}
            disabled={submitting}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save All Grades
          </button>
        </div>
      )}
    </div>
  );
}
