"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { apiClient } from "@/lib/api/client";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Calendar,
  Bell,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface DashboardData {
  stats: {
    gpa: number;
    enrolledCourses: number;
    pendingAssignments: number;
    completedCredits: number;
  };
  schedule: Array<{
    id: string;
    course: string;
    code: string;
    time: string;
    room: string;
    instructor: string;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
  }>;
  courseProgress: Array<{
    course: string;
    code: string;
    progress: number;
    grade: string;
  }>;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getStudentDashboard();
      setDashboardData(response.data);
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

  const stats = [
    {
      title: "Current GPA",
      value: dashboardData?.stats.gpa.toFixed(2) || "0.00",
      change: "+0.2",
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      title: "Enrolled Courses",
      value: dashboardData?.stats.enrolledCourses.toString() || "0",
      change: "This semester",
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      title: "Pending",
      value: dashboardData?.stats.pendingAssignments.toString() || "0",
      change: "Assignments",
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      title: "Credits",
      value: dashboardData?.stats.completedCredits.toString() || "0",
      change: "Completed",
      icon: Award,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome back, {user?.name?.split(" ")[0]}! 🎓
        </h1>
        <p className="mt-2 opacity-90">
          Your academic journey continues. Here's your overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  <p className="text-xs text-green-500 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Today's Schedule</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {dashboardData?.schedule.map((class_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <div>
                  <p className="font-medium">{class_.course}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {class_.code}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {class_.instructor}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{class_.time}</p>
                  <p className="text-xs text-gray-500">{class_.room}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Announcements</h2>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {dashboardData?.announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
              >
                <p className="font-medium">{announcement.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {announcement.content}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(announcement.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Course Progress</h2>
        <div className="space-y-4">
          {dashboardData?.courseProgress.map((course, idx) => (
            <div key={idx}>
              <div className="flex justify-between mb-1">
                <div>
                  <span className="text-sm font-medium">{course.course}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {course.code}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Progress: {course.progress}%
                  </span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Grade: {course.grade}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
