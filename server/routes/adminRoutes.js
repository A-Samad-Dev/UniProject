// routes/adminRoutes.js
const router = require("express").Router();

const {
  createLecturer,
  createDepartmentHead,
  createFacultyHead,
  createAdmin,
  createCourse,
  createFaculty,
  createDepartment,
  getAllStudents,
  getStudentById,
  getAllLecturers,
  getAllDepartmentHeads,
  getAllFacultyHeads,
  updateCourse,
  deleteCourse,
  getStudentsByFaculty,
  getStudentsByDepartment,
  getAllFaculties,
  getFacultyById,
  getAllDepartments,
  getDepartmentById,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
  getAllCourses,
  getCourseById,
  updateDepartment,
  deleteDepartment,
  updateFaculty,
  deleteFaculty,
  getDepartmentCourses,
  getFacultyDepartments,
  getAdminById,
  getAllAdmins,
} = require("../controllers/adminController");

const { verifyToken } = require("../middlewares/auth");
const { authorize, canCreateAdmin } = require("../middlewares/authorize");

// Admin routes
router.use(verifyToken);

router.post("/faculty", authorize("super_admin", "admin"), createFaculty); // tested ✅
router.post("/department", authorize("super_admin", "admin"), createDepartment); // tested ✅
router.post(
  "/department-head",
  authorize("super_admin", "admin"),
  createDepartmentHead,
); // tested ✅
router.post(
  "/faculty-head",
  authorize("super_admin", "admin"),
  createFacultyHead,
); // tested ✅
router.post("/admin-user", canCreateAdmin, createAdmin); // tested ✅
router.post("/lecturer", authorize("super_admin", "admin"), createLecturer); // tested ✅

router.get(
  "/students",
  authorize("super_admin", "admin", "faculty_head", "department_head"),
  getAllStudents,
);

router.get("/users", authorize("super_admin", "admin"), getAllUsers);

router.get("/users/:id", authorize("super_admin", "admin"), getUserById);

router.get("/admins/:id", authorize("super_admin"), getAdminById);
router.get("/all-admins", authorize("super_admin"), getAllAdmins);

router.get(
  "/lecturers",
  authorize("super_admin", "admin", "faculty_head"),
  getAllLecturers,
); // tested ✅
router.get(
  "/department-heads",
  authorize("super_admin", "admin", "faculty_head"),
  getAllDepartmentHeads,
); // tested ✅
router.get(
  "/faculty-heads",
  authorize("super_admin", "admin"),
  getAllFacultyHeads,
); // tested ✅
router.get(
  "/students/:id",
  authorize(
    "super_admin",
    "admin",
    "faculty_head",
    "department_head",
    "lecturer",
  ),
  getStudentById,
);
router.get(
  "/faculties/:facultyId/students",
  authorize("super_admin", "admin", "faculty_head"),
  getStudentsByFaculty,
);

router.get(
  "/departments/:departmentId/students",
  authorize("super_admin", "admin", "faculty_head", "department_head"),
  getStudentsByDepartment,
);

router.post("/course", authorize("super_admin", "admin"), createCourse); // tested ✅

router.get(
  "/faculties",
  authorize("super_admin", "admin", "faculty_head"),
  getAllFaculties,
);

// Get single faculty by ID
router.get(
  "/faculties/:id",
  authorize("super_admin", "admin", "faculty_head"),
  getFacultyById,
);

// Get all departments
router.get(
  "/departments",
  authorize("super_admin", "admin", "faculty_head", "department_head"),
  getAllDepartments,
);

// Get single department by ID
router.get(
  "/departments/:id",
  authorize("super_admin", "admin", "faculty_head", "department_head"),
  getDepartmentById,
);
router.get(
  "/courses",
  authorize("super_admin", "admin", "faculty_head", "department_head"),
  getAllCourses,
);

router.get(
  "/courses/:id",
  authorize(
    "super_admin",
    "admin",
    "faculty_head",
    "department_head",
    "lecturer",
  ),
  getCourseById,
);

router.get(
  "/department-courses",
  authorize("super_admin", "admin", "department_head"),
  getDepartmentCourses,
);

router.get(
  "/faculty-departments",
  authorize("super_admin", "admin", "faculty_head"),
  getFacultyDepartments,
);

router.put(
  "/course/:id",
  authorize("super_admin", "admin", "department_head"),
  updateCourse,
);
router.put("/users/:id", authorize("super_admin", "admin"), updateUser);

router.put(
  "/departments/:id",
  authorize("super_admin", "admin"),
  updateDepartment,
);
router.put("/faculties/:id", authorize("super_admin", "admin"), updateFaculty);

router.delete(
  "/faculties/:id",
  authorize("super_admin", "admin"),
  deleteFaculty,
);

router.delete(
  "/departments/:id",
  authorize("super_admin", "admin"),
  deleteDepartment,
);

router.delete("/users/:id", authorize("super_admin", "admin"), deleteUser);

router.patch(
  "/users/:id/status",
  authorize("super_admin", "admin"),
  updateUserStatus,
);

router.delete("/course/:id", authorize("super_admin", "admin"), deleteCourse);

module.exports = router;
