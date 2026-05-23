"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Loader2,
  Users,
  BookOpen,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Faculty {
  id: string;
  name: string;
  code: string;
  facultyHeadId?: string;
  facultyHead?: {
    id: string;
    name: string;
    nameTitle?: string;
    email: string;
    phoneNumber?: string;
  };
  departments?: {
    id: string;
    name: string;
    code: string;
    departmentHeadId?: string;
  }[];
  statistics?: {
    totalDepartments: number;
    totalStudents: number;
    totalCourses: number;
  };
  createdAt: string;
}

interface Lecturer {
  id: string;
  name: string;
  email: string;
  employeeId?: string;
}

const facultyValidationSchema = Yup.object({
  name: Yup.string()
    .required("Faculty name is required")
    .min(3, "Name must be at least 3 characters"),
  code: Yup.string()
    .required("Faculty code is required")
    .matches(/^[A-Z]{2,5}$/, "Code must be 2-5 uppercase letters"),
  facultyHeadId: Yup.string().nullable(),
});

export default function AdminFacultiesPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [viewingFaculty, setViewingFaculty] = useState<Faculty | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [facultiesRes, lecturersRes] = await Promise.all([
        apiClient.getAllFaculties(),
        apiClient.getAllLecturers(),
      ]);

      // Handle the response structure from your backend
      const facultiesData = facultiesRes.data || facultiesRes;
      setFaculties(Array.isArray(facultiesData) ? facultiesData : []);
      setLecturers(lecturersRes.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch data");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      code: "",
      facultyHeadId: "",
    },
    validationSchema: facultyValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingFaculty) {
          await apiClient.updateFaculty(editingFaculty.id, values);
          toast.success("Faculty updated successfully!");
        } else {
          await apiClient.createFaculty(values);
          toast.success("Faculty created successfully!");
        }
        resetForm();
        setIsModalOpen(false);
        setEditingFaculty(null);
        fetchAllData();
      } catch (error: any) {
        toast.error(error.message || "Operation failed");
      }
    },
  });

  const handleEdit = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    formik.setValues({
      name: faculty.name,
      code: faculty.code,
      facultyHeadId: faculty.facultyHeadId || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this faculty? This will also delete all associated departments and courses.",
      )
    ) {
      try {
        await apiClient.deleteFaculty(id);
        toast.success("Faculty deleted successfully!");
        fetchAllData();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete faculty");
      }
    }
  };

  const handleView = async (id: string) => {
    try {
      const response = await apiClient.getFacultyById(id);
      setViewingFaculty(response.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load faculty details");
    }
  };

  const filteredFaculties = faculties.filter(
    (faculty) =>
      faculty.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.code?.toLowerCase().includes(searchTerm.toLowerCase()),
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
            Faculty Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all faculties in the university
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingFaculty(null);
            formik.resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add New Faculty
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search faculties by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Faculties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculties.map((faculty) => (
          <div
            key={faculty.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="bg-linear-to-r from-indigo-500 to-purple-500 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {faculty.name}
                  </h3>
                  <p className="text-white/80 text-sm">{faculty.code}</p>
                </div>
                <Building2 className="w-6 h-6 text-white/80" />
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Faculty Head
                </p>
                <p className="font-medium">
                  {faculty.facultyHead
                    ? `${faculty.facultyHead.nameTitle || ""} ${faculty.facultyHead.name}`.trim()
                    : "Not Assigned"}
                </p>
                {faculty.facultyHead?.email && (
                  <p className="text-xs text-gray-400">
                    {faculty.facultyHead.email}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-center">
                  <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                  <p className="text-sm font-semibold">
                    {faculty.statistics?.totalStudents || 0}
                  </p>
                  <p className="text-xs text-gray-500">Students</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-center">
                  <Building2 className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                  <p className="text-sm font-semibold">
                    {faculty.departments?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500">Departments</p>
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => handleView(faculty.id)}
                  className="flex-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => handleEdit(faculty)}
                  className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(faculty.id)}
                  className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFaculties.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No faculties found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Click "Add New Faculty" to create one.
          </p>
        </div>
      )}

      {/* Faculty Modal (Create/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingFaculty ? "Edit Faculty" : "Create New Faculty"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
              <Input
                label="Faculty Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.name && formik.errors.name
                    ? formik.errors.name
                    : undefined
                }
                placeholder="e.g., Faculty of Computing"
              />
              <Input
                label="Faculty Code"
                name="code"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.code && formik.errors.code
                    ? formik.errors.code
                    : undefined
                }
                placeholder="e.g., FOC"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Faculty Head (Optional)
                </label>
                <select
                  name="facultyHeadId"
                  value={formik.values.facultyHeadId}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Faculty Head</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.name} ({lecturer.employeeId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" loading={formik.isSubmitting}>
                  {editingFaculty ? "Update Faculty" : "Create Faculty"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Faculty Modal */}
      {viewingFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Faculty Details
              </h2>
              <button
                onClick={() => setViewingFaculty(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Faculty Name
                    </p>
                    <p className="font-medium">{viewingFaculty.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Faculty Code
                    </p>
                    <p>{viewingFaculty.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Faculty Head
                    </p>
                    <p className="font-medium">
                      {viewingFaculty.facultyHead
                        ? `${viewingFaculty.facultyHead.nameTitle || ""} ${viewingFaculty.facultyHead.name}`.trim()
                        : "Not Assigned"}
                    </p>
                    {viewingFaculty.facultyHead?.email && (
                      <p className="text-xs text-gray-400">
                        {viewingFaculty.facultyHead.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Created Date
                    </p>
                    <p>
                      {new Date(viewingFaculty.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Statistics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {viewingFaculty.statistics?.totalDepartments || 0}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Departments
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {viewingFaculty.statistics?.totalStudents || 0}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Students
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {viewingFaculty.statistics?.totalCourses || 0}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Courses
                    </p>
                  </div>
                </div>
              </div>

              {/* Departments */}
              {viewingFaculty.departments &&
                viewingFaculty.departments.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                      Departments
                    </h3>
                    <div className="space-y-2">
                      {viewingFaculty.departments.map((dept) => (
                        <div
                          key={dept.id}
                          className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{dept.name}</p>
                            <p className="text-sm text-gray-500">{dept.code}</p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {dept.departmentHeadId
                              ? "Has Head"
                              : "No Head Assigned"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
