"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardResolver() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
        return;
      }

      const roleRoutes: Record<string, string> = {
        super_admin: "/admin/dashboard",
        admin: "/admin/dashboard",
        faculty_head: "/faculty-head/dashboard",
        department_head: "/department-head/dashboard",
        lecturer: "/lecturer/dashboard",
        student: "/student/dashboard",
        applicant: "/application",
      };

      const redirectPath = roleRoutes[user.role] || "/login";
      router.replace(redirectPath);
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}
