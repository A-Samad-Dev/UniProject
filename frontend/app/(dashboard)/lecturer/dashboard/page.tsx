"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { apiClient } from "@/lib/api/client";
import {
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  Loader2,
  TrendingUp,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import { StatsCard } from "@/components/dashboard/StatsCard";

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  pendingGrading: number;
  completedGrading: number;
}

export default function LecturerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getLecturerDashboard();
      const courses = await apiClient.getLecturerCourses();

      setStats(
        response.data || {
          totalCourses: courses.data?.length || 0,
          totalStudents: 0,
          pendingGrading: 0,
          completedGrading: 0,
        },
      );
      setRecentCourses(courses.data?.slice(0, 3) || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load dashboard");
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

  const statCards = [
    {
      title: "My Courses",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: "bg-blue-500",
      change: "This semester",
      changeType: "neutral",
    },
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "bg-green-500",
      change: "Across all courses",
      changeType: "neutral",
    },
    {
      title: "Pending Grading",
      value: stats?.pendingGrading || 0,
      icon: Clock,
      color: "bg-yellow-500",
      change: "Need attention",
      changeType: "warning",
    },
    {
      title: "Completed",
      value: stats?.completedGrading || 0,
      icon: CheckCircle,
      color: "bg-purple-500",
      change: "Graded",
      changeType: "success",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome, {user?.name?.split(" ")[0]}! 📚
        </h1>
        <p className="mt-2 opacity-90">
          Lecturer Dashboard - Manage your courses and students
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      {/* Recent Courses & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">My Courses</h2>
          <div className="space-y-4">
            {recentCourses.map((course, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium">{course.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {course.code}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {course.students?.length || 0} Students
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
          <div className="space-y-4">
            {[
              {
                course: "CS401 - AI",
                time: "10:00 AM",
                room: "Room 301",
                students: 45,
              },
              {
                course: "CS402 - ML",
                time: "2:00 PM",
                room: "Room 302",
                students: 38,
              },
            ].map((schedule, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium">{schedule.course}</p>
                  <p className="text-sm text-gray-500">{schedule.room}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{schedule.time}</p>
                  <p className="text-xs text-gray-500">
                    {schedule.students} students
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
