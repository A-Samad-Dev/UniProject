"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { apiClient } from "@/lib/api/client";
import {
  Users,
  BookOpen,
  Building2,
  School,
  TrendingUp,
  UserPlus,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { log } from "console";

interface DashboardStats {
  totalStudents: number;
  totalLecturers: number;
  totalDepartments: number;
  totalFaculties: number;
  pendingApplications: number;
  totalCourses: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [students, lecturers, departments, faculties, coursesRes, admissionStats] =
        await Promise.all([
          apiClient.getAllStudents(),
          apiClient.getAllLecturers(),
          apiClient.getAllDepartmentHeads(),
          apiClient.getAllFacultyHeads(),
          apiClient.getAllCourses(),
          apiClient.getAdmissionStats(),
        ]);
        const pendingApplications = admissionStats.data?.stats?.find(
      (s: any) => s._id === "submitted"
    )?.count || 0;

      setStats({
        totalStudents: students.data?.length || 0,
        totalLecturers: lecturers.data?.length || 0,
        totalDepartments: departments.data?.length || 0,
        totalFaculties: faculties.data?.length || 0,
        pendingApplications: pendingApplications,
        totalCourses: coursesRes.data.length || 0,
      });
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
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "increase",
    },
    {
      title: "Total Lecturers",
      value: stats?.totalLecturers || 0,
      icon: Users,
      color: "bg-green-500",
      change: "+5%",
      changeType: "increase",
    },
    {
      title: "Departments",
      value: stats?.totalDepartments || 0,
      icon: Building2,
      color: "bg-purple-500",
      change: "+2",
      changeType: "increase",
    },
    {
      title: "Faculties",
      value: stats?.totalFaculties || 0,
      icon: School,
      color: "bg-orange-500",
      change: "0",
      changeType: "neutral",
    },
    {
      title: "Active Courses",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: "bg-indigo-500",
      change: "+8",
      changeType: "increase",
    },
    {
      title: "Pending Applications",
      value: stats?.pendingApplications || 0,
      icon: UserPlus,
      color: "bg-yellow-500",
      change: "+3",
      changeType: "increase",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="mt-2 opacity-90">
          System Administrator Dashboard - Overview of university operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              {
                action: "New student registered",
                user: "John Doe",
                time: "5 minutes ago",
                icon: UserPlus,
              },
              {
                action: "Course created",
                user: "Dr. Smith",
                time: "1 hour ago",
                icon: BookOpen,
              },
              {
                action: "Department updated",
                user: "Admin",
                time: "3 hours ago",
                icon: Building2,
              },
              {
                action: "Faculty head assigned",
                user: "Prof. Johnson",
                time: "Yesterday",
                icon: School,
              },
            ].map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.user}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition text-left">
              <UserPlus className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2" />
              <p className="font-medium">Add New User</p>
              <p className="text-xs text-gray-500 mt-1">
                Create student or lecturer account
              </p>
            </button>
            <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition text-left">
              <Building2 className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
              <p className="font-medium">Create Faculty</p>
              <p className="text-xs text-gray-500 mt-1">
                Add new faculty to system
              </p>
            </button>
            <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition text-left">
              <School className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
              <p className="font-medium">Add Department</p>
              <p className="text-xs text-gray-500 mt-1">
                Create new department
              </p>
            </button>
            <button className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition text-left">
              <BookOpen className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
              <p className="font-medium">Create Course</p>
              <p className="text-xs text-gray-500 mt-1">
                Add new course to curriculum
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
