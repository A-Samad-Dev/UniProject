"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiClient } from "@/lib/api/client";

export type UserRole =
  | "super_admin"
  | "admin"
  | "faculty_head"
  | "department_head"
  | "lecturer"
  | "student"
  | "applicant";

export interface User {
  id: string;
  name: string;
  nameTitle?: string;
  email: string;
  role: UserRole;
  matricNumber?: string;
  employeeId?: string;
  phoneNumber?: string;
  level?: number;
  facultyId?: string;
  departmentId?: string;
  faculty?: {
    id: string;
    name: string;
    code: string;
  };
  department?: {
    id: string;
    name: string;
    code: string;
  };
  accountStatus?: string;
}

export interface ApplicantRegistrationData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  entryMode: "UTME" | "DIRECT_ENTRY";

  jambRegistrationNumber?: string;
  jambScore?: number;
  previousInstitution?: string;
  qualification?: string;
  yearOfGraduation?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  register: (data: ApplicantRegistrationData) => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isFacultyHead: boolean;
  isDepartmentHead: boolean;
  isLecturer: boolean;
  isStudent: boolean;
  isApplicant: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          const response = await apiClient.getMe();
          if (response.success && response.user) {
            setUser(response.user);
          } else {
            apiClient.clearToken();
            setUser(null);
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          apiClient.clearToken();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.login(email, password);
      console.log("Full login response:", response);
      const user = response.user;
      if (response.success && user) {
        setUser(user);
        const dashboardRoute = getDashboardRoute(user.role);
        window.location.href = dashboardRoute;
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      apiClient.clearToken();
      window.location.href = "/login";
    }
  };

  const register = async (userData: ApplicantRegistrationData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.registerApplicant(userData);
      if (response.success) {
        if (response.data?.id) {
          localStorage.setItem("applicantId", response.data.id);
        }
        console.log("Registration successful! Please login.");
        window.location.href = "/login";
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  };

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isFacultyHead = user?.role === "faculty_head";
  const isDepartmentHead = user?.role === "department_head";
  const isLecturer = user?.role === "lecturer";
  const isStudent = user?.role === "student";
  const isApplicant = user?.role === "applicant";

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isFacultyHead,
    isDepartmentHead,
    isLecturer,
    isStudent,
    isApplicant,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

function getDashboardRoute(role: UserRole): string {
  const routes: Record<UserRole, string> = {
    super_admin: "/admin/dashboard",
    admin: "/admin/dashboard",
    faculty_head: "/faculty-head/dashboard",
    department_head: "/department-head/dashboard",
    lecturer: "/lecturer/dashboard",
    student: "/student/dashboard",
    applicant: "/application",
  };
  return routes[role];
}
