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
router.post(
  "/course",
  authorize("super_admin", "admin", "department_head"),
  createCourse,
);  // tested ✅
router.put(
  "/course/:id",
  authorize("super_admin", "admin", "department_head"),
  updateCourse,
);
router.delete("/course/:id", authorize("super_admin", "admin"), deleteCourse);

module.exports = router;
