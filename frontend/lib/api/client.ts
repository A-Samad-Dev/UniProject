import toast from "react-hot-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const setCookie = (name: string, value: string, days = 1) => {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: any;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      console.log(typeof window);
      this.token = getCookie("accessToken");
      if (!this.token) {
        // Fallback to localStorage if no cookiei is found
        this.token = localStorage.getItem("accessToken");
      }
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      setCookie("accessToken", token);
      localStorage.setItem("accessToken", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      deleteCookie("accessToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      console.log("Fetching URL:", url);
      const response = await fetch(url, config);

      if (response.status === 401) {
        this.clearToken();
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          toast.error("Your session has expired. Please login again.", {
            id: "session-expired",
            duration: 4000,
            icon: "🔒",
          });

          setTimeout(() => {
            window.location.href = "/login?redirected=true";
          }, 2000);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Session expired");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`,
        );
      }
      const data = await response.json();

      return data;
    } catch (error: any) {
      console.error(`API Error ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    console.log("Raw API login response:", response);
    const user = response.user || response.data?.user;
    const token = response.token || response.data?.token;

    if (token) {
      this.setToken(token);
      localStorage.setItem("user", JSON.stringify(user));
    }
    return {
      success: response.success,
      user: user,
      token: token,
      message: response.message,
    };
  }

  async getMe() {
    const response = await this.request("/auth/me");
    const user = response.user || response.data?.user;
    return {
      success: response.success,
      user: user,
      message: response.message,
    };
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  async forgotPassword(email: string) {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request(`/auth/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    });
  }

  async logout() {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } finally {
      this.clearToken();
    }
  }

  // Student endpoints
  async getStudentDashboard() {
    return this.request("/student/dashboard");
  }

  async getMyCourses() {
    return this.request("/student/my-courses");
  }

  async getAvailableCourses() {
    return this.request("/student/available-courses");
  }

  async registerCourses(courseIds: string[]) {
    return this.request("/student/register-courses", {
      method: "POST",
      body: JSON.stringify({ courseIds }),
    });
  }

  async dropCourse(courseId: string) {
    return this.request(`/student/drop-course/${courseId}`, {
      method: "DELETE",
    });
  }

  async getRegistrationHistory() {
    return this.request("/student/registration-history");
  }

  async getMyResults() {
    return this.request("/results/my-results");
  }

  // Lecturer endpoints
  async getLecturerDashboard() {
    return this.request("/lecturer/dashboard/stats");
  }

  async getLecturerCourses() {
    return this.request("/lecturer/courses");
  }

  async getCourseStudents(courseId: string) {
    return this.request(`/lecturer/courses/${courseId}/students`);
  }

  async uploadScores(
    courseId: string,
    scores: Array<{ studentId: string; score: number }>,
  ) {
    return this.request("/lecturer/scores/bulk", {
      method: "POST",
      body: JSON.stringify({ courseId, scores }),
    });
  }

  async uploadSingleScore(courseId: string, studentId: string, score: number) {
    return this.request("/lecturer/scores", {
      method: "POST",
      body: JSON.stringify({ courseId, studentId, score }),
    });
  }

  async getEditableScores(courseId: string) {
    return this.request(`/lecturer/scores/editable/${courseId}`);
  }

  async editScore(scoreId: string, score: number) {
    return this.request(`/lecturer/${scoreId}`, {
      method: "PATCH",
      body: JSON.stringify({ score }),
    });
  }

  // Department Head endpoints
  async getDepartmentStudents(departmentId?: string) {
    const endpoint = departmentId
      ? `/admin/departments/${departmentId}/students`
      : "/admin/students";
    return this.request(endpoint);
  }

  async getDepartmentCourses() {
    return this.request("/admin/department-courses");
  }

  async createCourse(courseData: any) {
    return this.request("/admin/course", {
      method: "POST",
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(courseId: string, courseData: any) {
    return this.request(`/admin/course/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(courseId: string) {
    return this.request(`/admin/course/${courseId}`, {
      method: "DELETE",
    });
  }

  async getPendingResults() {
    return this.request("/results/pending");
  }

  async approveResult(resultId: string) {
    return this.request(`/results/${resultId}/approve`, {
      method: "PUT",
    });
  }

  async bulkApproveResults(resultIds: string[]) {
    return this.request("/results/bulk-approve", {
      method: "POST",
      body: JSON.stringify({ resultIds }),
    });
  }

  async getCourseResults(courseId: string) {
    return this.request(`/results/course/${courseId}`);
  }

  // Faculty Head endpoints
  async getFacultyDepartments() {
    return this.request("/admin/faculty-departments");
  }

  async getFacultyLecturers() {
    return this.request("/admin/lecturers");
  }

  async getFacultyStudents(facultyId?: string) {
    const endpoint = facultyId
      ? `/admin/faculties/${facultyId}/students`
      : "/admin/students";
    return this.request(endpoint);
  }

  async createFaculty(facultyData: {
    name: string;
    code: string;
    facultyHeadId?: string;
  }) {
    return this.request("/admin/faculty", {
      method: "POST",
      body: JSON.stringify(facultyData),
    });
  }

  async createDepartment(departmentData: {
    name: string;
    code: string;
    facultyId: string;
    departmentHeadId?: string;
  }) {
    return this.request("/admin/department", {
      method: "POST",
      body: JSON.stringify(departmentData),
    });
  }

  // Admin endpoints
  async getAllStudents() {
    return this.request("/admin/students");
  }
  async getAllUsers() {
    return this.request("/admin/users");
  }

  async getUserById(id: string) {
    return this.request(`/users/${id}`);
  }
  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: "DELETE",
    });
  }

  async updateUserStatus(id: string, status: string) {
    return this.request(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async getAllLecturers() {
    return this.request("/admin/lecturers");
  }
  async getAllDepartments() {
    return this.request("/admin/departments");
  }

  async getDepartmentById(id: string) {
    return this.request(`/admin/departments/${id}`);
  }

  async updateDepartment(
    id: string,
    data: {
      name: string;
      code: string;
      facultyId: string;
      departmentHeadId?: string;
    },
  ) {
    return this.request(`/admin/departments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteDepartment(id: string) {
    return this.request(`/admin/departments/${id}`, {
      method: "DELETE",
    });
  }

  async getAllDepartmentHeads() {
    return this.request("/admin/department-heads");
  }
  async getAllFaculties() {
    return this.request("/admin/faculties");
  }

  async getFacultyById(id: string) {
    return this.request(`/admin/faculties/${id}`);
  }

  async updateFaculty(
    id: string,
    data: { name: string; code: string; facultyHeadId?: string },
  ) {
    return this.request(`/faculties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteFaculty(id: string) {
    return this.request(`/faculties/${id}`, {
      method: "DELETE",
    });
  }

  async getAllFacultyHeads() {
    return this.request("/admin/faculty-heads");
  }

  async getStudentById(studentId: string) {
    return this.request(`/admin/students/${studentId}`);
  }

  async createLecturer(lecturerData: any) {
    return this.request("/admin/lecturer", {
      method: "POST",
      body: JSON.stringify(lecturerData),
    });
  }

  async createDepartmentHead(headData: any) {
    return this.request("/admin/department-head", {
      method: "POST",
      body: JSON.stringify(headData),
    });
  }

  async createFacultyHead(headData: any) {
    return this.request("/admin/faculty-head", {
      method: "POST",
      body: JSON.stringify(headData),
    });
  }

  async createAdmin(adminData: any) {
    return this.request("/admin/admin-user", {
      method: "POST",
      body: JSON.stringify(adminData),
    });
  }
  async getAllCourses(filters?: {
    departmentId?: string;
    level?: string;
    semester?: string;
    search?: string;
    program?: string;
  }) {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return this.request(`/admin/courses${queryString}`);
  }
  async getCourseById(id: string) {
    return this.request(`/admin/courses/${id}`);
  }

  async getPublicCourses(filters?: { program?: string }) {
    const params = new URLSearchParams();

    if (filters?.program) {
      params.set("program", filters.program);
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return this.request(`/auth/public/courses${queryString}`);
  }
  // Applicant endpoints
  async registerApplicant(applicantData: any) {
    return this.request("/applicants/register", {
      method: "POST",
      body: JSON.stringify(applicantData),
    });
  }

  async getPublicDepartments(program?: string) {
    const query = program ? `?program=${program}` : "";
    return this.request(`/auth/public/departments${query}`);
  }

  async submitApplication(applicantId: string, applicationData: any) {
    return this.request(`/applicants/submit-application/${applicantId}`, {
      method: "POST",
      body: JSON.stringify(applicationData),
    });
  }

  async getApplicationStatus(applicantId: string) {
    return this.request(`/applicants/status/${applicantId}`);
  }

  async getAllApplicants(status?: string) {
    const params = new URLSearchParams();
    if (status) {
      params.set("status", status);
    }
    return this.request(`/applicants/admin/all?${params.toString()}`);
  }

  async getAdmissionStats() {
    return this.request("/applicants/admin/stats");
  }
  async getApplicantById(id: string) {
    return this.request(`/applicants/admin/${id}`);
  }
  async getApplicantByEmail(email: string) {
    return this.request(`/applicants/admin/email/${email}`);
  }
  async reviewApplication(
    applicantId: string,
    reviewData: {
      status: string;
      rejectionReason?: string;
      decision: string;
      remarks?: string;
    },
  ) {
    return this.request(`/applicants/admin/review/${applicantId}`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  }
  async updateApplication(applicantId: string, updateData: any) {
    return this.request(`/applicants/admin/update/${applicantId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  async getAllAdmins() {
    return this.request("/admin/all-admins");
  }

  async getAdminById(id: string) {
    return this.request(`/admin/admins/${id}`);
  }

  async get(endpoint: string) {
    return this.request(endpoint);
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
