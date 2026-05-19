"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Search, Filter, Plus, Check, Loader2, BookOpen, Clock, User } from "lucide-react";
import toast from "react-hot-toast";

interface AvailableCourse {
  id: string;
  code: string;
  title: string;
  unit: number;
  level: number;
  semester: string;
  lecturer: { name: string };
  schedule: string;
}

export default function StudentRegistrationPage() {
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAvailableCourses();
  }, []);

  const fetchAvailableCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAvailableCourses();
      setAvailableCourses(response.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.registerCourses(selectedCourses);
      toast.success(`Successfully registered for ${selectedCourses.length} course(s)!`);
      setSelectedCourses([]);
      fetchAvailableCourses();
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const filteredCourses = availableCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnits = availableCourses
    .filter(c => selectedCourses.includes(c.id))
    .reduce((sum, c) => sum + c.unit, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Registration</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Select courses for the upcoming semester</p>
        </div>
        <button
          onClick={handleRegister}
          disabled={submitting || selectedCourses.length === 0}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Register ({selectedCourses.length} courses)
        </button>
      </div>

      {/* Summary Card */}
      {selectedCourses.length > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-indigo-700 dark:text-indigo-300">Selected Courses</p>
              <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{selectedCourses.length} courses</p>
              <p className="text-sm text-indigo-600 dark:text-indigo-400">Total Units: {totalUnits}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCourses([])}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const isSelected = selectedCourses.includes(course.id);
          return (
            <div
              key={course.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer ${
                isSelected ? "ring-2 ring-indigo-500" : ""
              }`}
              onClick={() => toggleCourse(course.id)}
            >
              <div className={`p-4 ${isSelected ? "bg-indigo-50 dark:bg-indigo-900/20" : ""}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{course.code}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-600"
                      : "border-gray-300 dark:border-gray-600"
                  }`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.unit} Units</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>{course.lecturer?.name || "Staff"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{course.schedule || "TBA"}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No courses available</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Check back later for course registration.</p>
        </div>
      )}
    </div>
  );
}