"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { BookOpen, Clock, User, Calendar, Loader2, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Course {
  id: string;
  code: string;
  title: string;
  unit: number;
  level: number;
  semester: string;
  lecturer: {
    name: string;
  };
  schedule: string;
}

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMyCourses();
      setCourses(response.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View all your enrolled courses for the current semester</p>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
              <h3 className="text-lg font-semibold text-white">{course.title}</h3>
              <p className="text-white/80 text-sm">{course.code}</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">{course.unit} Units</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Level {course.level}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span className="text-sm">{course.lecturer?.name || "Staff"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{course.schedule || "TBA"}</span>
              </div>
              <div className="pt-3 border-t dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Semester: {course.semester === "first" ? "First" : "Second"}
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Enrolled
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No courses enrolled</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">You haven't registered for any courses yet.</p>
        </div>
      )}
    </div>
  );
}