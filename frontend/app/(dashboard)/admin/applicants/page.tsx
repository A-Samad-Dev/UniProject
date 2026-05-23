"use client";

import { ReactNode, useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import {
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Loader2,
  FileText,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Building2,
  Send,
  AlertCircle,
  UserCheck,
  UserX,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  gender: string;
  entryMode: string;
  status:
    | "draft"
    | "submitted"
    | "under_review"
    | "accepted"
    | "rejected"
    | "admitted";
  studentId?: string;
  createdAt: string;
  updatedAt: string;
  secondarySchoolName?: string;
  secondarySchoolYear?: number;
  secondarySchoolAddress?: string;
  jambRegistrationNumber?: string;
  jambScore?: number;
  jambSubjectCombination: string[];
  jambUploadUrl?: string;
  firstChoiceId: string;
  secondChoiceId?: string;
  facultyId?: string;
  departmentId?: string;
  submissionDate?: string;
  reviewDate?: string;
  rejectionReason?: string;
  admissionLetterUrl?: string;
  admissionLetterGeneratedAt?: string;
  previousInstitution?: string;
  qualification?: string;
  yearOfGraduation?: number;
  transcriptAvailable?: boolean;
  programme?: string;
  firstChoice?: FrontendCourse;
  secondChoice?: FrontendCourse;
  faculty?: FrontendFaculty;
  department?: FrontendDepartment;
  student?: FrontendUser;
  oLevelResults?: OLevelResult[];
}

interface FrontendCourse {
  id: string;
  title: string;
  code: string;
  department?: FrontendDepartment;
  faculty?: FrontendFaculty;
}

interface FrontendDepartment {
  id: string;
  name: string;
  code: string;
}

interface FrontendFaculty {
  id: string;
  name: string;
  code: string;
}

interface FrontendUser {
  id: string;
  name: string;
  matricNumber?: string;
}

export interface OLevelResult {
  id: string;
  applicantId: string;
  examType: string;
  examNumber: string;
  examYear: number;
  uploadUrl?: string;
  subjects: OLevelSubject[];
}

interface OLevelSubject {
  id: string;
  oLevelResultId: string;
  name: string;
  grade: string;
}

interface Stats {
  total: number;
  stats: Array<{
    _id: string;
    count: number;
  }>;
}

export default function AdminApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null,
  );
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<
    "accept" | "reject" | "under_review" | "reset"
  >("under_review");
  const [rejectionReason, setRejectionReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [applicantsRes, statsRes] = await Promise.all([
        apiClient.getAllApplicants(statusFilter),
        apiClient.getAdmissionStats(),
      ]);

      setApplicants(applicantsRes.data || []);
      setStats(statsRes.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch applicants");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplicant = async (id: string) => {
    try {
      const response = await apiClient.getApplicantById(id);
      setSelectedApplicant(response.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load applicant details");
    }
  };

  const handleReviewAction = async () => {
    if (!selectedApplicant) return;

    if (actionType === "reject" && !rejectionReason) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setSubmitting(true);

      let newStatus = "";
      let successMessage = "";

      switch (actionType) {
        case "accept":
          newStatus = "accepted";
          successMessage =
            "Applicant accepted successfully! They can now be enrolled as a student.";
          break;
        case "reject":
          newStatus = "rejected";
          successMessage = "Application rejected successfully.";
          break;
        case "under_review":
          newStatus = "under_review";
          successMessage = "Application marked as under review.";
          break;
        case "reset":
          newStatus = "submitted";
          successMessage = "Application reset to submitted status.";
          break;
      }

      await apiClient.reviewApplication(selectedApplicant.id, {
        decision: actionType,
        status: newStatus,
        rejectionReason: actionType === "reject" ? rejectionReason : undefined,
        remarks: remarks || "",
      });

      toast.success(successMessage);

      setActionModalOpen(false);
      setSelectedApplicant(null);
      setRejectionReason("");
      setRemarks("");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to process application");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-yellow-100 text-yellow-800",
      under_review: "bg-blue-100 text-blue-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      admitted: "bg-purple-100 text-purple-800",
    };
    const icons: Record<string, ReactNode> = {
      draft: <FileText className="w-3 h-3" />,
      submitted: <Clock className="w-3 h-3" />,
      under_review: <Eye className="w-3 h-3" />,
      accepted: <CheckCircle className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
      admitted: <GraduationCap className="w-3 h-3" />,
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badges[status] || badges.submitted}`}
      >
        {icons[status] || icons.submitted}
        {status.replace("_", " ")}
      </span>
    );
  };

  const getAvailableActions = (status: string) => {
    switch (status) {
      case "submitted":
        return [
          {
            type: "under_review",
            label: "Mark as Under Review",
            icon: Eye,
            color: "blue",
          },
          {
            type: "accept",
            label: "Accept Application",
            icon: CheckCircle,
            color: "green",
          },
          {
            type: "reject",
            label: "Reject Application",
            icon: XCircle,
            color: "red",
          },
        ];
      case "under_review":
        return [
          {
            type: "accept",
            label: "Accept Application",
            icon: CheckCircle,
            color: "green",
          },
          {
            type: "reject",
            label: "Reject Application",
            icon: XCircle,
            color: "red",
          },
          {
            type: "reset",
            label: "Reset to Submitted",
            icon: RefreshCw,
            color: "yellow",
          },
        ];
      case "accepted":
        return [
          {
            type: "reject",
            label: "Reject Application",
            icon: XCircle,
            color: "red",
          },
          {
            type: "reset",
            label: "Reset to Submitted",
            icon: RefreshCw,
            color: "yellow",
          },
        ];
      case "rejected":
        return [
          {
            type: "accept",
            label: "Accept Application",
            icon: CheckCircle,
            color: "green",
          },
          {
            type: "reset",
            label: "Reset to Submitted",
            icon: RefreshCw,
            color: "yellow",
          },
        ];
      default:
        return [];
    }
  };

  const filteredApplicants = applicants.filter(
    (applicant) =>
      applicant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.firstChoice?.department?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      applicant.department?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Applicant Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and manage admission applications
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        {stats?.stats.map((stat) => (
          <div
            key={stat._id}
            onClick={() =>
              setStatusFilter(stat._id === statusFilter ? "" : stat._id)
            }
            className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
              statusFilter === stat._id ? "ring-2 ring-indigo-500" : ""
            }`}
          >
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.count}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {stat._id.replace("_", " ")}
            </div>
          </div>
        ))}
        <div
          onClick={() => setStatusFilter("")}
          className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
            statusFilter === "" ? "ring-2 ring-indigo-500" : ""
          }`}
        >
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.total || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search applicants by name, email, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Applicants Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Entry Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department Choice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredApplicants.map((applicant) => (
                <tr
                  key={applicant.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {applicant.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {applicant.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {applicant.phoneNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm capitalize">
                      {applicant.entryMode?.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">
                      {applicant.firstChoice?.department?.name || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {applicant.firstChoice?.department?.code || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(applicant.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {applicant.submissionDate
                      ? new Date(applicant.submissionDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleViewApplicant(applicant.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredApplicants.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No applicants found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              No applicants match your search criteria.
            </p>
          </div>
        )}
      </div>

      {/* View Applicant Modal with Action Buttons */}
      {selectedApplicant && !actionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Applicant Details
              </h2>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Full Name
                    </p>
                    <p className="font-medium">{selectedApplicant.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="font-medium flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {selectedApplicant.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Phone
                    </p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedApplicant.phoneNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Entry Mode
                    </p>
                    <p className="font-medium capitalize">
                      {selectedApplicant.entryMode?.toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    {getStatusBadge(selectedApplicant.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Submitted Date
                    </p>
                    <p className="font-medium">
                      {selectedApplicant.submissionDate
                        ? new Date(
                            selectedApplicant.submissionDate,
                          ).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Department Choices - Updated to show departments */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Department Choices
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      First Choice Department
                    </p>
                    <p className="font-medium text-lg">
                      {selectedApplicant.firstChoice?.department?.name || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Code: {selectedApplicant.firstChoice?.department?.code}
                    </p>
                  </div>
                  {selectedApplicant.secondChoice?.department && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Second Choice Department
                      </p>
                      <p className="font-medium text-lg">
                        {selectedApplicant.secondChoice?.department?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Code: {selectedApplicant.secondChoice?.department?.code}
                      </p>
                    </div>
                  )}
                </div>
                {selectedApplicant.faculty && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span>Faculty: {selectedApplicant.faculty.name}</span>
                  </div>
                )}
              </div>

              {/* JAMB Information */}
              {selectedApplicant.entryMode === "UTME" &&
                selectedApplicant.jambScore && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                      JAMB Information
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Registration Number
                        </p>
                        <p className="font-medium">
                          {selectedApplicant.jambRegistrationNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Score
                        </p>
                        <p className="font-medium text-lg text-indigo-600">
                          {selectedApplicant.jambScore}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Secondary School */}
              {selectedApplicant.secondarySchoolName && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    Secondary School
                  </h3>
                  <div>
                    <p className="font-medium">
                      {selectedApplicant.secondarySchoolName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedApplicant.secondarySchoolYear ?? "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {/* O'Level Results */}
              {selectedApplicant.oLevelResults &&
                selectedApplicant.oLevelResults.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                      O'Level Results
                    </h3>
                    {selectedApplicant.oLevelResults.map((result) => (
                      <div key={result.id} className="mb-4 last:mb-0">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium">
                            {result.examType} - {result.examYear}
                          </p>
                          <p className="text-sm text-gray-500">
                            Number: {result.examNumber}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {result.subjects.map((subject, idx) => (
                            <div
                              key={idx}
                              className="bg-white dark:bg-gray-800 rounded p-2 text-sm"
                            >
                              <span className="font-medium">
                                {subject.name}
                              </span>
                              <span className="ml-2 text-indigo-600">
                                {subject.grade}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Student Info if Admitted */}
              {selectedApplicant.student && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold mb-3 text-green-700 dark:text-green-400">
                    Student Account Created
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Student Name
                      </p>
                      <p className="font-medium">
                        {selectedApplicant.student.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Matric Number
                      </p>
                      <p className="font-medium">
                        {selectedApplicant.student.matricNumber}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedApplicant.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Rejection Reason
                  </p>
                  <p className="font-medium">
                    {selectedApplicant.rejectionReason}
                  </p>
                </div>
              )}

              {/* Action Buttons - Show based on status */}
              {getAvailableActions(selectedApplicant.status).length > 0 && (
                <div className="border-t dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Application Actions
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {getAvailableActions(selectedApplicant.status).map(
                      (action) => {
                        const Icon = action.icon;
                        const colorClasses = {
                          green: "bg-green-600 hover:bg-green-700",
                          red: "bg-red-600 hover:bg-red-700",
                          blue: "bg-blue-600 hover:bg-blue-700",
                          yellow: "bg-yellow-600 hover:bg-yellow-700",
                        };
                        return (
                          <Button
                            key={action.type}
                            onClick={() => {
                              setActionType(action.type as any);
                              setActionModalOpen(true);
                            }}
                            className={
                              colorClasses[
                                action.color as keyof typeof colorClasses
                              ]
                            }
                          >
                            <Icon className="w-4 h-4" />
                            {action.label}
                          </Button>
                        );
                      },
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModalOpen && selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {actionType === "accept" && "Accept Application"}
                {actionType === "reject" && "Reject Application"}
                {actionType === "under_review" && "Mark as Under Review"}
                {actionType === "reset" && "Reset Application"}
              </h2>
              <button
                onClick={() => {
                  setActionModalOpen(false);
                  setRejectionReason("");
                  setRemarks("");
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {actionType === "accept" &&
                  `You are about to accept ${selectedApplicant.name}'s application. This will create a student account.`}
                {actionType === "reject" &&
                  `You are about to reject ${selectedApplicant.name}'s application.`}
                {actionType === "under_review" &&
                  `Mark ${selectedApplicant.name}'s application as under review.`}
                {actionType === "reset" &&
                  `Reset ${selectedApplicant.name}'s application to submitted status.`}
              </p>

              {actionType === "reject" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Provide reason for rejection..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Add any additional remarks..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleReviewAction}
                  loading={submitting}
                  className={
                    actionType === "accept"
                      ? "bg-green-600 hover:bg-green-700"
                      : actionType === "reject"
                        ? "bg-red-600 hover:bg-red-700"
                        : actionType === "under_review"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-yellow-600 hover:bg-yellow-700"
                  }
                >
                  {actionType === "accept" && "Accept & Create Student"}
                  {actionType === "reject" && "Reject Application"}
                  {actionType === "under_review" && "Mark as Under Review"}
                  {actionType === "reset" && "Reset Application"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setActionModalOpen(false);
                    setRejectionReason("");
                    setRemarks("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
