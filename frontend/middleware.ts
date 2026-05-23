import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/register", "/forgot-password", "/"];

// Role-based route protection
const roleBasedRoutes = {
  "/admin": ["super_admin", "admin"],
  "/faculty-head": ["super_admin", "admin", "faculty_head"],
  "/department-head": [
    "super_admin",
    "admin",
    "faculty_head",
    "department_head",
  ],
  "/lecturer": [
    "super_admin",
    "admin",
    "faculty_head",
    "department_head",
    "lecturer",
  ],
  "/student": ["super_admin", "admin", "student"],
  "/applicant": ["applicant"], // Add applicant route
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const userRole = request.cookies.get("userRole")?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  if (publicPaths.includes(pathname)) {
    if (token && userRole) {
      const dashboardRoute = getDashboardRoute(userRole);
      return NextResponse.redirect(new URL(dashboardRoute, request.url));
    }
    return NextResponse.next();
  }

  // Check authentication
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  for (const [routePrefix, allowedRoles] of Object.entries(roleBasedRoutes)) {
    if (pathname.startsWith(routePrefix)) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  return NextResponse.next();
}

function getDashboardRoute(role: string): string {
  const routes: Record<string, string> = {
    super_admin: "/admin/dashboard",
    admin: "/admin/dashboard",
    faculty_head: "/faculty-head/dashboard",
    department_head: "/department-head/dashboard",
    lecturer: "/lecturer/dashboard",
    student: "/student/dashboard",
    applicant: "/applicant/dashboard",
  };
  return routes[role] || "/login";
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/faculty-head/:path*",
    "/department-head/:path*",
    "/lecturer/:path*",
    "/student/:path*",
    "/applicant/:path*",
    "/login",
  ],
};
