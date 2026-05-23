"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  Upload,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  Bell,
  GraduationCap,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { href: "/applicant/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applicant/application", label: "My Application", icon: FileText },
  { href: "/applicant/status", label: "Application Status", icon: CheckCircle },
  { href: "/applicant/documents", label: "Documents", icon: Upload },
];

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Visible on Desktop, toggleable on Mobile */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-72 bg-white dark:bg-gray-800 shadow-xl lg:shadow-sm border-r dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b dark:border-gray-700">
          <Link href="/applicant/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                UniSystem
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Applicant Portal
              </p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
              <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs mt-1">
                Applicant
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-6 bg-indigo-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Links */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Help & Support</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area - Shifted left to make room for desktop sidebar */}
      <div className="lg:pl-72 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            {/* Mobile menu toggle button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Empty space placeholder for desktop to push actions right */}
            <div className="hidden lg:block" />

            {/* Profile Action Bars */}
            <div className="flex items-center gap-3 ml-auto lg:ml-0">
              <ThemeToggle />
              <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 relative text-gray-600 dark:text-gray-300">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-2 border-l pl-3 dark:border-gray-700">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0) || "A"}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name?.split(" ")[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
