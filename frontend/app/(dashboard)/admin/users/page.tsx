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
  Filter,
  UserPlus,
  GraduationCap,
  Briefcase,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface User {
  id: string;
  name: string;
  nameTitle: string;
  email: string;
  role: string;
  phoneNumber: string;
  matricNumber?: string;
  employeeId?: string;
  level?: number;
  facultyId?: string;
  departmentId?: string;
  faculty?: { id: string; name: string; code: string };
  department?: { id: string; name: string; code: string };
  specialization?: string;
  gender: string;
  dateOfBirth?: string;
  address?: string;
  accountStatus: string;
  createdAt: string;
}

interface Faculty {
  id: string;
  name: string;
  code: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  facultyId: string;
}

const userValidationSchema = Yup.object({
  name: Yup.string()
    .required("Full name is required")
    .min(3, "Name must be at least 3 characters"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9]{11}$/, "Phone number must be 11 digits"),
  role: Yup.string().required("Role is required"),
  facultyId: Yup.string().when("role", {
    is: (role: string) => role !== "admin" && role !== "super_admin",
    then: () => Yup.string().required("Faculty is required"),
    otherwise: () => Yup.string().nullable(),
  }),
  departmentId: Yup.string().when("role", {
    is: (role: string) =>
      role === "lecturer" || role === "department_head" || role === "student",
    then: () => Yup.string().required("Department is required"),
    otherwise: () => Yup.string().nullable(),
  }),
  level: Yup.number().when("role", {
    is: "student",
    then: () =>
      Yup.number()
        .required("Level is required")
        .min(100, "Level must be at least 100")
        .max(500, "Level cannot exceed 500"),
    otherwise: () => Yup.number().nullable(),
  }),
  gender: Yup.string()
    .oneOf(["male", "female", "other"], "Invalid gender")
    .required("Gender is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .when("isNew", {
      is: true,
      then: () => Yup.string().required("Password is required for new users"),
    }),
});

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole, filterStatus]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [
        studentsRes,
        lecturersRes,
        departmentsRes,
        facultiesRes,
        adminsRes,
      ] = await Promise.all([
        apiClient.getAllStudents(),
        apiClient.getAllLecturers(),
        apiClient.getAllDepartments(),
        apiClient.getAllFaculties(),
        apiClient.getAllAdmins(),
      ]);

      const allUsers = [
        ...(studentsRes.data || []).map((u: any) => ({
          ...u,
          role: "student",
        })),
        ...(lecturersRes.data || []).map((u: any) => ({
          ...u,
          role: "lecturer",
        })),
        ...(adminsRes.data || []).map((u: any) => ({
          ...u,
          role: u.isSuperAdmin ? "super_admin" : "admin",
        })),
      ];

      setUsers(allUsers);
      setDepartments(departmentsRes.data || []);
      setFaculties(facultiesRes.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.matricNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterRole !== "all") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((user) => user.accountStatus === filterStatus);
    }

    setFilteredUsers(filtered);
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      nameTitle: "",
      email: "",
      phoneNumber: "",
      role: "student",
      facultyId: "",
      departmentId: "",
      specialization: "",
      level: 100,
      gender: "",
      password: "",
      isNew: true,
    },
    validationSchema: userValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const userData = {
          name: values.name,
          nameTitle: values.nameTitle,
          email: values.email,
          phoneNumber: values.phoneNumber,
          role: values.role,
          facultyId: values.facultyId || undefined,
          departmentId: values.departmentId || undefined,
          specialization: values.specialization || "",
          level: values.level || undefined,
          gender: values.gender,
          password: values.password,
        };

        if (editingUser) {
          // Update user logic
          await apiClient.put(`/users/${editingUser.id}`, userData);
          toast.success("User updated successfully!");
        } else {
          // Create user based on role
          if (values.role === "lecturer") {
            await apiClient.createLecturer(userData);
          } else if (values.role === "admin") {
            await apiClient.createAdmin(userData);
          }
          toast.success("User created successfully!");
        }
        resetForm();
        setIsModalOpen(false);
        setEditingUser(null);
        fetchAllData();
      } catch (error: any) {
        toast.error(error.message || "Operation failed");
      }
    },
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    formik.setValues({
      nameTitle: user.nameTitle,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      facultyId: user.facultyId || "",
      departmentId: user.departmentId || "",
      specialization: user.specialization || "",
      level: user.level || 100,
      gender: user.gender || "",
      password: "",
      isNew: false,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      try {
        await apiClient.delete(`/users/${id}`);
        toast.success("User deleted successfully!");
        fetchAllData();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete user");
      }
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.accountStatus === "active" ? "blocked" : "active";
    if (
      window.confirm(
        `Are you sure you want to ${newStatus === "active" ? "activate" : "block"} this user?`,
      )
    ) {
      try {
        await apiClient.put(`/users/${user.id}/status`, { status: newStatus });
        toast.success(
          `User ${newStatus === "active" ? "activated" : "blocked"} successfully!`,
        );
        fetchAllData();
      } catch (error: any) {
        toast.error(error.message || "Failed to update user status");
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "super_admin":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "faculty_head":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "department_head":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "lecturer":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "student":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "student":
        return GraduationCap;
      case "lecturer":
        return Briefcase;
      case "admin":
        return Shield;
      default:
        return UserPlus;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all users in the system
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingUser(null);
            formik.resetForm();
            formik.setFieldValue("isNew", true);
            setIsModalOpen(true);
          }}
        >
          <UserPlus className="w-4 h-4" />
          Add New User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Users
              </p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Students
              </p>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === "student").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lecturers
              </p>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === "lecturer").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Active Users
              </p>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.accountStatus === "active").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, matric number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="lecturer">Lecturers</option>
          <option value="faculty_head">Faculty Heads</option>
          <option value="department_head">Department Heads</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID/Matric No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <RoleIcon className="w-4 h-4" />
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                        >
                          {user.role.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {user.matricNumber || user.employeeId || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        {user.department?.name && <p>{user.department.name}</p>}
                        {user.faculty?.name && (
                          <p className="text-xs text-gray-500">
                            {user.faculty.name}
                          </p>
                        )}
                        {user.level && (
                          <p className="text-xs text-gray-400">
                            Level {user.level}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3" />
                          <span className="text-xs">{user.phoneNumber}</span>
                        </div>
                        {user.gender && (
                          <div className="flex items-center gap-1 text-sm">
                            <span className="text-xs capitalize">
                              {user.gender}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                          user.accountStatus === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200"
                        }`}
                      >
                        {user.accountStatus}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setViewingUser(user)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition ml-2"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition ml-2"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal (Create/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full my-8">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingUser ? "Edit User" : "Create New User"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={formik.handleSubmit}
              className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.name && formik.errors.name
                      ? formik.errors.name
                      : undefined
                  }
                  placeholder="John Doe"
                />
                <Input
                  label="Name Title"
                  name="nameTitle"
                  value={formik.values.nameTitle}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.nameTitle && formik.errors.nameTitle
                      ? formik.errors.nameTitle
                      : undefined
                  }
                  placeholder="Mr., Ms., Dr., etc."
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.email && formik.errors.email
                      ? formik.errors.email
                      : undefined
                  }
                  placeholder="john@university.edu"
                />
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.phoneNumber && formik.errors.phoneNumber
                      ? formik.errors.phoneNumber
                      : undefined
                  }
                  placeholder="08012345678"
                />
                
                <Input
                  label="specialization (for lecturers)"
                  name="specialization"
                  value={formik.values.specialization}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.specialization && formik.errors.specialization
                      ? formik.errors.specialization
                      : undefined
                  }
                  placeholder="Computer Science, Electrical Engineering, etc."
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="department_head">Department Head</option>
                    <option value="faculty_head">Faculty Head</option>
                    <option value="admin">Admin</option>
                  </select>
                  {formik.touched.role && formik.errors.role && (
                    <p className="text-sm text-red-600 mt-1">
                      {formik.errors.role}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {formik.touched.gender && formik.errors.gender && (
                    <p className="text-sm text-red-600 mt-1">
                      {formik.errors.gender}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Faculty
                  </label>
                  <select
                    name="facultyId"
                    value={formik.values.facultyId}
                    onChange={(e) => {
                      formik.handleChange(e);
                      formik.setFieldValue("departmentId", "");
                    }}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    disabled={
                      formik.values.role === "admin" ||
                      formik.values.role === "super_admin"
                    }
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
                    disabled={
                      formik.values.role === "admin" ||
                      formik.values.role === "super_admin" ||
                      !formik.values.facultyId
                    }
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
                {formik.values.role === "student" && (
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
                )}
                {formik.values.isNew && (
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.password && formik.errors.password
                        ? formik.errors.password
                        : undefined
                    }
                    placeholder="Enter password"
                  />
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" loading={formik.isSubmitting}>
                  {editingUser ? "Update User" : "Create User"}
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

      {/* View User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                User Details
              </h2>
              <button
                onClick={() => setViewingUser(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {viewingUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{viewingUser.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {viewingUser.email}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getRoleBadgeColor(viewingUser.role)}`}
                  >
                    {viewingUser.role.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Phone Number
                  </p>
                  <p>{viewingUser.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ID/Matric Number
                  </p>
                  <p>
                    {viewingUser.matricNumber ||
                      viewingUser.employeeId ||
                      "N/A"}
                  </p>
                </div>
                {viewingUser.gender && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Gender
                    </p>
                    <p className="capitalize">{viewingUser.gender}</p>
                  </div>
                )}
                {viewingUser.level && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Level
                    </p>
                    <p>{viewingUser.level}</p>
                  </div>
                )}
                {viewingUser.department && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Department
                    </p>
                    <p>{viewingUser.department.name}</p>
                  </div>
                )}
                {viewingUser.faculty && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Faculty
                    </p>
                    <p>{viewingUser.faculty.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Account Status
                  </p>
                  <p
                    className={`font-medium ${viewingUser.accountStatus === "active" ? "text-green-600" : "text-red-600"}`}
                  >
                    {viewingUser.accountStatus.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Joined Date
                  </p>
                  <p>{new Date(viewingUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
