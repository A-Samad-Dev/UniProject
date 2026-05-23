"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { apiClient } from "@/lib/api/client";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface ApplicationStats {
  status: string;
  submissionDate?: string;
  reviewDate?: string;
  rejectionReason?: string;
  admissionLetterUrl?: string;
}

export default function ApplicantDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicantId, setApplicantId] = useState<string>("");

  useEffect(() => {
    const id = localStorage.getItem("applicantId");
    if (id) {
      setApplicantId(id);
      fetchApplicationStatus(id);
    }
  }, []);

  const fetchApplicationStatus = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getApplicationStatus(id);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch status:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: any; color: string; bgColor: string; text: string }> = {
      draft: { icon: FileText, color: "text-gray-600", bgColor: "bg-gray-100", text: "Draft" },
      submitted: { icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-100", text: "Under Review" },
      under_review: { icon: Clock, color: "text-blue-600", bgColor: "bg-blue-100", text: "Processing" },
      accepted: { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100", text: "Accepted" },
      rejected: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100", text: "Rejected" },
      admitted: { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100", text: "Admitted" },
    };
    return configs[status] || configs.draft;
  };

  const quickActions = [
    {
      title: "Complete Application",
      description: "Fill in your academic details",
      icon: FileText,
      href: "/applicant/application",
      color: "bg-indigo-500",
    },
    {
      title: "Upload Documents",
      description: "Submit required documents",
      icon: Upload,
      href: "/applicant/documents",
      color: "bg-purple-500",
    },
    {
      title: "Check Status",
      description: "Track your application progress",
      icon: CheckCircle,
      href: "/applicant/status",
      color: "bg-green-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const statusConfig = stats ? getStatusConfig(stats.status) : getStatusConfig("draft");
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="mt-2 opacity-90">
          Track your application progress and complete your admission requirements.
        </p>
      </div>

      {/* Application Status Card */}
      <div className={`${statusConfig.bgColor} rounded-2xl p-6 border`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${statusConfig.bgColor} bg-opacity-50`}>
              <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Application Status</p>
              <p className={`text-2xl font-bold ${statusConfig.color}`}>
                {statusConfig.text}
              </p>
            </div>
          </div>
          {stats?.submissionDate && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Submitted on</p>
              <p className="font-medium">
                {new Date(stats.submissionDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {stats?.rejectionReason && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">
              <strong>Reason:</strong> {stats.rejectionReason}
            </p>
          </div>
        )}

        {stats?.admissionLetterUrl && (
          <div className="mt-4">
            <a
              href={stats.admissionLetterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FileText className="w-4 h-4" />
              Download Admission Letter
            </a>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
                <ArrowRight className="w-4 h-4 text-gray-400 mt-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium">{user?.phoneNumber || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Applicant ID</p>
              <p className="font-medium">{applicantId || "Pending"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}