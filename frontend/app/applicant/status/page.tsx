"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import {
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Download,
  Loader2,
  Calendar,
  User,
  Mail,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";

interface ApplicationStatus {
  id: string;
  status: string;
  submissionDate?: string;
  reviewDate?: string;
  rejectionReason?: string;
  admissionLetterUrl?: string;
  entryMode: string;
  name: string;
  email: string;
  phoneNumber: string; 
  program: string;

  department?: {
    id: string,
    name: string,
    code: string,
  };


  firstChoice?: {
    title: string;
    code: string;
  };
  secondChoice?: {
    title: string;
    code: string;
  };
}


const statusSteps = [
  { key: "draft", label: "Application Started", icon: FileText },
  { key: "submitted", label: "Application Submitted", icon: Clock },
  { key: "under_review", label: "Under Review", icon: Clock },
  { key: "accepted", label: "Accepted", icon: CheckCircle },
  { key: "admitted", label: "Admitted", icon: CheckCircle },
];

export default function ApplicationStatusPage() {
  const [application, setApplication] = useState<ApplicationStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [applicantId, setApplicantId] = useState<string>("");

  useEffect(() => {
    const id = localStorage.getItem("applicantId");
    if (id) {
      setApplicantId(id);
      fetchStatus(id);
    }
  }, []);

  const fetchStatus = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getApplicationStatus(id);
      if (response.success && response.data) {
        setApplication(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch application status");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!application) return 0;
    const index = statusSteps.findIndex(
      (step) => step.key === application.status,
    );
    return index >= 0 ? index : 0;
  };

  const getStatusColor = () => {
    if (!application) return "bg-gray-500";
    switch (application.status) {
      case "accepted":
      case "admitted":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "under_review":
        return "bg-blue-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getStatusMessage = () => {
    if (!application) return "";
    switch (application.status) {
      case "draft":
        return "Please complete and submit your application form.";
      case "submitted":
        return "Your application has been received and is pending review.";
      case "under_review":
        return "The admissions committee is currently reviewing your application.";
      case "accepted":
        return "Congratulations! You have been accepted. Your admission letter is being prepared.";
      case "admitted":
        return "Congratulations! You have been officially admitted. Download your admission letter below.";
      case "rejected":
        return "We regret to inform you that your application was not successful at this time.";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          No application found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Please start your application to see the status.
        </p>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Application Status
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track the progress of your admission application
        </p>
      </div>

      {/* Status Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="relative">
          {/* Progress Bar */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{
                width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} className="text-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto relative z-10 transition-all ${
                      isCompleted
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                    } ${isCurrent ? "ring-4 ring-indigo-200 dark:ring-indigo-900" : ""}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="mt-2 text-sm font-medium">{step.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Message */}
        <div
          className={`mt-8 p-4 ${getStatusColor()} bg-opacity-10 rounded-lg`}
        >
          <div className="flex items-start gap-3">
            {application.status === "rejected" ? (
              <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
            ) : application.status === "accepted" ||
              application.status === "admitted" ? (
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            ) : (
              <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Status:{" "}
                {application?.status?.replace("_", " ").toUpperCase() ??
                  "LOADING"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {getStatusMessage()}
              </p>
              {application.rejectionReason && (
                <p className="text-sm text-red-600 mt-2">
                  <strong>Reason:</strong> {application.rejectionReason}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t dark:border-gray-700">
          {application.submissionDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                Submitted:{" "}
                {new Date(application.submissionDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {application.reviewDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                Last Updated:{" "}
                {new Date(application.reviewDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Application Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Application Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Entry Mode</p>
            <p className="font-medium">{application.entryMode?.toLocaleUpperCase()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Program</p>
            <p className="font-medium">{application.program?.toLocaleUpperCase()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">First Choice</p>
            <p className="font-medium">
              {application.department?.name.split(" ")[0].toUpperCase()}
            </p>
          </div>
          {application.secondChoice && (
            <div>
              <p className="text-sm text-gray-500">Second Choice</p>
              <p className="font-medium">
                {application.secondChoice.title} (
                {application.secondChoice.code})
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Admission Letter */}
      {application.admissionLetterUrl && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Admission Letter Available
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your admission letter is ready for download
                </p>
              </div>
            </div>
            <a
              href={application.admissionLetterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Letter
            </a>
          </div>
        </div>
      )}

      {/* Applicant Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Applicant Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="text-sm font-medium">{application.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium">{application.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-medium">{application.phoneNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
