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

export interface Faculty {
  id: string;
  name: string;
  code: string;
  facultyHeadId?: string;
  facultyHead?: User;
  departments?: Department[];
  createdAt: string;
}


export interface Department {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  faculty?: Faculty;
  departmentHeadId?: string;
  departmentHead?: User;
  courses?: Course[];
  createdAt: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  unit: number;
  level: number;
  semester: string;
  departmentId: string;
  facultyId: string;
  headLecturerId?: string;
  schedule?: string;
  department?: Department;
  faculty?: Faculty;
  headLecturer?: User;
  createdAt: string;
}