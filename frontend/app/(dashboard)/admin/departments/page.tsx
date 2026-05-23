"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  School,
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

interface Department {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  faculty?: {
    id: string;
    name: string;
    code: string;
    facultyHeadId?: string;
  };
  departmentHeadId?: string;
  departmentHead?: {
    id: string;
    name: string;
    nameTitle?: string;
    email: string;
    phoneNumber?: string;
  };
  courses?: {
    id: string;
    code: string;
    title: string;
    unit: number;
  }[];
  statistics?: {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    totalCourses: number;
    studentsByLevel: Record<string, number>;
  };
  createdAt: string;
}

interface Faculty {
  id: string;
  name: string;
  code: string;
}

// Updated Lecturer interface with facultyId
interface Lecturer {
  id: string;
  name: string;
  nameTitle?: string;
  email: string;
  phoneNumber?: string;
  employeeId?: string;
  facultyId?: string; // Add this property
  departmentId?: string;
  specialization?: string;
}

const departmentValidationSchema = Yup.object({
  name: Yup.string()
    .required("Department name is required")
    .min(3, "Name must be at least 3 characters"),
  code: Yup.string()
    .required("Department code is required")
    .matches(/^[A-Z]{2,5}$/, "Code must be 2-5 uppercase letters"),
  facultyId: Yup.string().required("Faculty is required"),
  departmentHeadId: Yup.string().nullable(),
});

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFaculty, setFilterFaculty] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(
    null,
  );

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [departmentsRes, facultiesRes, lecturersRes] = await Promise.all([
        apiClient.getAllDepartments(),
        apiClient.getAllFaculties(),
        apiClient.getAllLecturers(),
      ]);

      setDepartments(departmentsRes.data || []);
      setFaculties(facultiesRes.data || []);

      // Ensure lecturers have facultyId property (might come from backend or need mapping)
      const lecturersData = lecturersRes.data || [];
      setLecturers(lecturersData);
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
      facultyId: "",
      departmentHeadId: "",
    },
    validationSchema: departmentValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingDepartment) {
          await apiClient.updateDepartment(editingDepartment.id, values);
          toast.success("Department updated successfully!");
        } else {
          await apiClient.createDepartment(values);
          toast.success("Department created successfully!");
        }
        resetForm();
        setIsModalOpen(false);
        setEditingDepartment(null);
        fetchAllData();
      } catch (error: any) {
        toast.error(error.message || "Operation failed");
      }
    },
  });

  const handleEdit = (dept: Department) => {
    setEditingDepartment(dept);
    formik.setValues({
      name: dept.name,
      code: dept.code,
      facultyId: dept.facultyId,
      departmentHeadId: dept.departmentHeadId || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this department? This will also delete all associated courses.",
      )
    ) {
      try {
        await apiClient.deleteDepartment(id);
        toast.success("Department deleted successfully!");
        fetchAllData();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete department");
      }
    }
  };

  const handleView = async (id: string) => {
    try {
      const response = await apiClient.getDepartmentById(id);
      setViewingDepartment(response.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load department details");
    }
  };

  // Filter lecturers based on selected faculty
  const getFilteredLecturers = () => {
    if (!formik.values.facultyId) return lecturers;
    return lecturers.filter(
      (lect) => lect.facultyId === formik.values.facultyId,
    );
  };

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty = !filterFaculty || dept.facultyId === filterFaculty;
    return matchesSearch && matchesFaculty;
  });

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
            Department Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all departments across faculties
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingDepartment(null);
            formik.resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add New Department
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search departments by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          value={filterFaculty}
          onChange={(e) => setFilterFaculty(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Faculties</option>
          {faculties.map((faculty) => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.name}
            </option>
          ))}
        </select>
      </div>

      {/* Departments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Faculty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Head of Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Courses
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDepartments.map((dept) => (
                <tr
                  key={dept.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {dept.name?.charAt(0) || "D"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {dept.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                      {dept.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {dept.faculty?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {dept.departmentHead ? (
                      <div>
                        <p className="text-sm font-medium">
                          {dept.departmentHead.nameTitle
                            ? `${dept.departmentHead.nameTitle} `
                            : ""}
                          {dept.departmentHead.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {dept.departmentHead.email}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Not Assigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{dept.courses?.length || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleView(dept.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleEdit(dept)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition ml-2"
                      title="Edit Department"
                    >
                      <Edit className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition ml-2"
                      title="Delete Department"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <School className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No departments found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Click "Add New Department" to create one.
          </p>
        </div>
      )}

      {/* Department Modal (Create/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingDepartment
                  ? "Edit Department"
                  : "Create New Department"}
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
                label="Department Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.name && formik.errors.name
                    ? formik.errors.name
                    : undefined
                }
                placeholder="e.g., Computer Science"
              />
              <Input
                label="Department Code"
                name="code"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.code && formik.errors.code
                    ? formik.errors.code
                    : undefined
                }
                placeholder="e.g., CSC"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Faculty
                </label>
                <select
                  name="facultyId"
                  value={formik.values.facultyId}
                  onChange={(e) => {
                    formik.handleChange(e);
                    // Reset department head when faculty changes
                    formik.setFieldValue("departmentHeadId", "");
                  }}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Faculty</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name} ({faculty.code})
                    </option>
                  ))}
                </select>
                {formik.touched.facultyId && formik.errors.facultyId && (
                  <p className="text-sm text-red-600 mt-1">
                    {formik.errors.facultyId}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department Head (Optional)
                </label>
                <select
                  name="departmentHeadId"
                  value={formik.values.departmentHeadId}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Department Head</option>
                  {getFilteredLecturers().map((lecturer) => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.nameTitle ? `${lecturer.nameTitle} ` : ""}
                      {lecturer.name} ({lecturer.employeeId || lecturer.email})
                    </option>
                  ))}
                </select>
                {formik.values.facultyId &&
                  getFilteredLecturers().length === 0 && (
                    <p className="text-sm text-yellow-600 mt-1">
                      No lecturers found in this faculty. Please add lecturers
                      first.
                    </p>
                  )}
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" loading={formik.isSubmitting}>
                  {editingDepartment
                    ? "Update Department"
                    : "Create Department"}
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

      {/* View Department Modal */}
      {viewingDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Department Details
              </h2>
              <button
                onClick={() => setViewingDepartment(null)}
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
                      Department Name
                    </p>
                    <p className="font-medium">{viewingDepartment.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Department Code
                    </p>
                    <p>{viewingDepartment.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Faculty
                    </p>
                    <p>{viewingDepartment.faculty?.name || "N/A"}</p>
                    {viewingDepartment.faculty?.code && (
                      <p className="text-xs text-gray-400">
                        {viewingDepartment.faculty.code}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Department Head
                    </p>
                    <p className="font-medium">
                      {viewingDepartment.departmentHead
                        ? `${viewingDepartment.departmentHead.nameTitle || ""} ${viewingDepartment.departmentHead.name}`.trim()
                        : "Not Assigned"}
                    </p>
                    {viewingDepartment.departmentHead?.email && (
                      <p className="text-xs text-gray-400">
                        {viewingDepartment.departmentHead.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Created Date
                    </p>
                    <p>
                      {new Date(
                        viewingDepartment.createdAt,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              {viewingDepartment.statistics && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {viewingDepartment.statistics.totalStudents}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Students
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {viewingDepartment.statistics.activeStudents}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Active Students
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {viewingDepartment.statistics.totalCourses}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Courses
                      </p>
                    </div>
                  </div>

                  {/* Students by Level */}
                  {viewingDepartment.statistics.studentsByLevel &&
                    Object.keys(viewingDepartment.statistics.studentsByLevel)
                      .length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">
                          Students by Level
                        </p>
                        <div className="flex gap-4 flex-wrap">
                          {Object.entries(
                            viewingDepartment.statistics.studentsByLevel,
                          ).map(([level, count]) => (
                            <div key={level} className="text-center">
                              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                {count as number}
                              </div>
                              <p className="text-xs text-gray-500">
                                Level {level}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Courses */}
              {viewingDepartment.courses &&
                viewingDepartment.courses.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                      Courses
                    </h3>
                    <div className="space-y-2">
                      {viewingDepartment.courses.map((course) => (
                        <div
                          key={course.id}
                          className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="text-sm text-gray-500">
                              {course.code}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {course.unit} Unit(s)
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
