// routes/studentRoutes.js
const router = require("express").Router();
const {
  registerCourses,
  getMyRegisteredCourses,
  dropCourse,
  getAvailableCourses,
  getRegistrationHistory,
  getStudentDashboard,
} = require("../controllers/studentController");
const { verifyToken } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");


router.use(verifyToken);
router.use(authorize("student"));


router.post("/register-courses", registerCourses);


router.get("/my-courses", getMyRegisteredCourses);


router.delete("/drop-course/:courseId", dropCourse);


router.get("/available-courses", getAvailableCourses);


router.get("/registration-history", getRegistrationHistory);


router.get("/dashboard", getStudentDashboard);

module.exports = router;