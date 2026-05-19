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
  email: string;
  role: UserRole;
  department?: string;
  studentId?: string;
  facultyId?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface RolePermissions {
  [key: string]: Permission[];
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

export interface Department {
  id: string;
  name: string;
  code: string;
  headId: string;
  faculty: string[];
  students: string[];
  budget: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  department: string;
  instructor: string;
  students: string[];
  schedule: string;
  semester: string;
}