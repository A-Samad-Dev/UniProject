"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  Calendar,
  FileText,
  Settings,
  HelpCircle,
  X,
  Building2,
  UserPlus,
  Award,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, isFacultyHead, isDepartmentHead, isLecturer, isStudent } = useAuth();

  const getMenuItems = () => {
    if (isAdmin) {
      return [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/users", label: "User Management", icon: Users },
        { href: "/admin/faculties", label: "Faculties", icon: Building2 },
        { href: "/admin/departments", label: "Departments", icon: GraduationCap },
        { href: "/admin/courses", label: "Courses", icon: BookOpen },
      ];
    }
    
    if (isFacultyHead) {
      return [
        { href: "/faculty-head/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/faculty-head/departments", label: "Departments", icon: Building2 },
        { href: "/faculty-head/lecturers", label: "Lecturers", icon: Users },
        { href: "/faculty-head/students", label: "Students", icon: GraduationCap },
      ];
    }
    
    if (isDepartmentHead) {
      return [
        { href: "/department-head/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/department-head/courses", label: "Courses", icon: BookOpen },
        { href: "/department-head/lecturers", label: "Lecturers", icon: Users },
        { href: "/department-head/students", label: "Students", icon: GraduationCap },
        { href: "/department-head/results", label: "Results", icon: Award },
      ];
    }
    
    if (isLecturer) {
      return [
        { href: "/lecturer/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/lecturer/courses", label: "My Courses", icon: BookOpen },
        { href: "/lecturer/grading", label: "Grading", icon: FileText },
      ];
    }
    
    if (isStudent) {
      return [
        { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/student/courses", label: "My Courses", icon: BookOpen },
        { href: "/student/registration", label: "Registration", icon: Calendar },
        { href: "/student/results", label: "Results", icon: Award },
      ];
    }
    
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={onClose} />}
      
      <aside className={`fixed top-0 left-0 z-30 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">UniSystem</span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Logged in as</p>
          <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 capitalize">{user?.role?.replace("_", " ")}</p>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 mb-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Links */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700">
          <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <Link href="/help" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <HelpCircle className="w-5 h-5" />
            <span>Help</span>
          </Link>
        </div>
      </aside>
    </>
  );
}