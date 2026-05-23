"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Loader2,
  BookOpen,
  Clock,
  Users,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Course {
  id: string;
  code: string;
  title: string;
  unit: number;
  level: number;
  semester: string;
  departmentId: string;
  department?: { name: string; code: string };
  facultyId: string;
  faculty?: { name: string; code: string };
  headLecturerId?: string;
  headLecturer?: { name: string };
  lecturers?: { id: string; name: string }[];
  schedule: string;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  facultyId: string;
}

interface Faculty {
  id: string;
  name: string;
  code: string;
}

interface Lecturer {
  id: string;
  name: string;
  email: string;
  employeeId: string;
}

const courseValidationSchema = Yup.object({
  code: Yup.string()
    .required("Course code is required")
    .matches(
      /^[A-Z]{3}[0-9]{3}$/,
      "Course code must be 3 letters followed by 3 numbers (e.g., CSC101)",
    ),
  title: Yup.string()
    .required("Course title is required")
    .min(3, "Title must be at least 3 characters"),
  unit: Yup.number()
    .required("Course unit is required")
    .min(1, "Minimum unit is 1")
    .max(6, "Maximum unit is 6"),
  level: Yup.number()
    .required("Level is required")
    .min(100, "Level must be at least 100")
    .max(500, "Level cannot exceed 500"),
  semester: Yup.string()
    .required("Semester is required")
    .oneOf(["first", "second"], "Invalid semester"),
  departmentId: Yup.string().required("Department is required"),
  facultyId: Yup.string().required("Faculty is required"),
  headLecturerId: Yup.string().nullable(),
  schedule: Yup.string().required("Schedule is required"),
});

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [coursesRes, departmentsRes, facultiesRes, lecturersRes] =
        await Promise.all([
          apiClient.getAllCourses(),
          apiClient.getAllDepartments(),
          apiClient.getAllFaculties(),
          apiClient.getAllLecturers(),
        ]);

      setCourses(coursesRes.data || []);
      setDepartments(departmentsRes.data || []);
      setFaculties(facultiesRes.data || []);
      setLecturers(lecturersRes.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      code: "",
      title: "",
      unit: 3,
      level: 100,
      semester: "first",
      departmentId: "",
      facultyId: "",
      headLecturerId: "",
      schedule: "",
    },
    validationSchema: courseValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingCourse) {
          await apiClient.updateCourse(editingCourse.id, values);
          toast.success("Course updated successfully!");
        } else {
          await apiClient.createCourse(values);
          toast.success("Course created successfully!");
        }
        resetForm();
        setIsModalOpen(false);
        setEditingCourse(null);
        fetchAllData();
      } catch (error: any) {
        toast.error(error.message || "Operation failed");
      }
    },
  });

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    formik.setValues({
      code: course.code,
      title: course.title,
      unit: course.unit,
      level: course.level,
      semester: course.semester,
      departmentId: course.departmentId,
      facultyId: course.facultyId,
      headLecturerId: course.headLecturerId || "",
      schedule: course.schedule,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await apiClient.deleteCourse(id);
        toast.success("Course deleted successfully!");
        fetchAllData();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete course");
      }
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel =
      !filterLevel || course.level.toString() === filterLevel;
    const matchesSemester =
      !filterSemester || course.semester === filterSemester;
    return matchesSearch && matchesLevel && matchesSemester;
  });

  const getSemesterBadge = (semester: string) => {
    return semester === "first"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Course Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create, edit, and manage all courses
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCourse(null);
            formik.resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add New Course
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Levels</option>
          <option value="100">100 Level</option>
          <option value="200">200 Level</option>
          <option value="300">300 Level</option>
          <option value="400">400 Level</option>
          <option value="500">500 Level</option>
        </select>
        <select
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Semesters</option>
          <option value="first">First Semester</option>
          <option value="second">Second Semester</option>
        </select>
      </div>

      {/* Courses Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department/Faculty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCourses.map((course) => (
                <tr
                  key={course.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {course.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {course.code}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <span>{course.unit} Units</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Level {course.level}</span>
                      </div>
                      <div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${getSemesterBadge(course.semester)}`}
                        >
                          {course.semester === "first"
                            ? "First Semester"
                            : "Second Semester"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm">
                        {course.department?.name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {course.faculty?.name || "N/A"}
                      </p>
                      {course.headLecturer && (
                        <p className="text-xs text-gray-400 mt-1">
                          Head: {course.headLecturer.name}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {course.schedule}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setViewingCourse(course)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleEdit(course)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition ml-2"
                    >
                      <Edit className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition ml-2"
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

      {/* Course Modal (Create/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCourse ? "Edit Course" : "Create New Course"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Course Code"
                  name="code"
                  value={formik.values.code}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.code && formik.errors.code
                      ? formik.errors.code
                      : undefined
                  }
                  placeholder="e.g., CSC101"
                />
                <Input
                  label="Course Title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.title && formik.errors.title
                      ? formik.errors.title
                      : undefined
                  }
                  placeholder="Introduction to Computer Science"
                />
                <Input
                  label="Course Unit"
                  name="unit"
                  type="number"
                  value={formik.values.unit}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.unit && formik.errors.unit
                      ? formik.errors.unit
                      : undefined
                  }
                />
                <Input
                  label="Level"
                  name="level"
                  type="number"
                  value={formik.values.level}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.level && formik.errors.level
                      ? formik.errors.level
                      : undefined
                  }
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Semester
                  </label>
                  <select
                    name="semester"
                    value={formik.values.semester}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="first">First Semester</option>
                    <option value="second">Second Semester</option>
                  </select>
                  {formik.touched.semester && formik.errors.semester && (
                    <p className="text-sm text-red-600 mt-1">
                      {formik.errors.semester}
                    </p>
                  )}
                </div>
                <Input
                  label="Schedule"
                  name="schedule"
                  value={formik.values.schedule}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.schedule && formik.errors.schedule
                      ? formik.errors.schedule
                      : undefined
                  }
                  placeholder="Mon/Wed 10:00 AM - 12:00 PM"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Faculty
                  </label>
                  <select
                    name="facultyId"
                    value={formik.values.facultyId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Faculty</option>
                    {faculties.map((faculty) => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name}
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
                    Department
                  </label>
                  <select
                    name="departmentId"
                    value={formik.values.departmentId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Department</option>
                    {departments
                      .filter(
                        (dept) => dept.facultyId === formik.values.facultyId,
                      )
                      .map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                  </select>
                  {formik.touched.departmentId &&
                    formik.errors.departmentId && (
                      <p className="text-sm text-red-600 mt-1">
                        {formik.errors.departmentId}
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Head Lecturer (Optional)
                  </label>
                  <select
                    name="headLecturerId"
                    value={formik.values.headLecturerId}
                    onChange={formik.handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Head Lecturer</option>
                    {lecturers.map((lecturer) => (
                      <option key={lecturer.id} value={lecturer.id}>
                        {lecturer.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" loading={formik.isSubmitting}>
                  {editingCourse ? "Update Course" : "Create Course"}
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

      {/* View Course Modal */}
      {viewingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Course Details
              </h2>
              <button
                onClick={() => setViewingCourse(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Course Code
                  </p>
                  <p className="font-medium">{viewingCourse.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Course Title
                  </p>
                  <p className="font-medium">{viewingCourse.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Units
                  </p>
                  <p>{viewingCourse.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Level
                  </p>
                  <p>{viewingCourse.level}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Semester
                  </p>
                  <p className="capitalize">{viewingCourse.semester}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Schedule
                  </p>
                  <p>{viewingCourse.schedule}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Department
                  </p>
                  <p>{viewingCourse.department?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Faculty
                  </p>
                  <p>{viewingCourse.faculty?.name || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
