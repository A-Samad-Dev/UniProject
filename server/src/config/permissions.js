// Central permissions definition - Single source of truth

const PERMISSIONS = {
  // Super Admin (everything)
  ALL: "all",

  // User Management
  CREATE_USER: "create_user",
  EDIT_USER: "edit_user",
  DELETE_USER: "delete_user",
  VIEW_USERS: "view_users",
  MANAGE_USER_ROLES: "manage_user_roles",

  // Faculty Management
  CREATE_FACULTY: "create_faculty",
  EDIT_FACULTY: "edit_faculty",
  DELETE_FACULTY: "delete_faculty",
  VIEW_FACULTIES: "view_faculties",
  MANAGE_FACULTY_HEADS: "manage_faculty_heads",

  // Department Management
  CREATE_DEPARTMENT: "create_department",
  EDIT_DEPARTMENT: "edit_department",
  DELETE_DEPARTMENT: "delete_department",
  VIEW_DEPARTMENTS: "view_departments",
  MANAGE_DEPARTMENT_HEADS: "manage_department_heads",

  // Course Management
  CREATE_COURSE: "create_course",
  EDIT_COURSE: "edit_course",
  DELETE_COURSE: "delete_course",
  VIEW_COURSES: "view_courses",
  ASSIGN_COURSE_LECTURERS: "assign_course_lecturers",

  // Result Management
  UPLOAD_RESULTS: "upload_results",
  EDIT_RESULTS: "edit_results",
  APPROVE_RESULTS: "approve_results",
  VIEW_RESULTS: "view_results",
  PUBLISH_RESULTS: "publish_results",

  // Student Management
  REGISTER_STUDENTS: "register_students",
  EDIT_STUDENT_RECORDS: "edit_student_records",
  VIEW_STUDENTS: "view_students",
  GRADUATE_STUDENTS: "graduate_students",

  // Registration Management
  APPROVE_REGISTRATIONS: "approve_registrations",
  VIEW_REGISTRATIONS: "view_registrations",

  // System Management
  VIEW_LOGS: "view_logs",
  SYSTEM_SETTINGS: "system_settings",
  BACKUP_DATA: "backup_data",
  RESTORE_DATA: "restore_data",
};

// Role-based permission mappings
const ROLE_DEFAULT_PERMISSIONS = {
  admin: [PERMISSIONS.ALL],

  faculty_head: [
    PERMISSIONS.VIEW_FACULTIES,
    PERMISSIONS.VIEW_DEPARTMENTS,
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.VIEW_RESULTS,
    PERMISSIONS.APPROVE_RESULTS,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_REGISTRATIONS,
  ],

  department_head: [
    PERMISSIONS.VIEW_DEPARTMENTS,
    PERMISSIONS.CREATE_COURSE,
    PERMISSIONS.EDIT_COURSE,
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.UPLOAD_RESULTS,
    PERMISSIONS.VIEW_RESULTS,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.APPROVE_REGISTRATIONS,
  ],

  lecturer: [
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.UPLOAD_RESULTS,
    PERMISSIONS.VIEW_RESULTS,
    PERMISSIONS.VIEW_STUDENTS,
  ],

  student: [
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.VIEW_RESULTS,
    PERMISSIONS.VIEW_REGISTRATIONS,
  ],

  applicant: [],
};

// Helper function to check if user has permission
const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions) return false;
  if (userPermissions.includes(PERMISSIONS.ALL)) return true;
  return userPermissions.includes(requiredPermission);
};

// Helper function to check if user has any of the required permissions
const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions) return false;
  if (userPermissions.includes(PERMISSIONS.ALL)) return true;
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission),
  );
};

// Helper function to check if user has all required permissions
const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!userPermissions) return false;
  if (userPermissions.includes(PERMISSIONS.ALL)) return true;
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission),
  );
};

module.exports = {
  PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
};
