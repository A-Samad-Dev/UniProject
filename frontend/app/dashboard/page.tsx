"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardResolver() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
        return;
      }

      const normalizedRole = String(user.role).toLowerCase().trim();
      console.log("DashboardResolver Debug - Incoming User Object:", user);
      console.log(
        "DashboardResolver Debug - Normalized Role String:",
        normalizedRole,
      );

      const roleRoutes: Record<string, string> = {
        super_admin: "/admin/dashboard",
        admin: "/admin/dashboard",
        faculty_head: "/faculty-head/dashboard",
        department_head: "/department-head/dashboard",
        lecturer: "/lecturer/dashboard",
        student: "/student/dashboard",
        applicant: "/applicant/dashboard",
      };

      const redirectPath = roleRoutes[normalizedRole];

      if (redirectPath) {
        console.log(
          "DashboardResolver Debug - Match found! Redirecting to:",
          redirectPath,
        );
        router.replace(redirectPath);
      } else {
        console.error(
          "DashboardResolver Debug - UNMAPPED ROLE:",
          normalizedRole,
        );
        // Fallback to a safe error landing page instead of a looping 404 block
        router.replace("/login");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}
