// routes/lecturerRoutes.js
const router = require("express").Router();
const {
  bulkUploadScores,
  uploadScore,
  getEditableScores,
  getMyCourses,
  getCourseStudents,
  getDashboardStats,
  editScore,
} = require("../controllers/lecturerController");
const { verifyToken } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

router.use(verifyToken);
router.use(authorize("lecturer"));

router.post("/scores", uploadScore);
router.post("/scores/bulk", bulkUploadScores);
router.get("/scores/editable/:courseId", getEditableScores);
router.patch("/:id", authorize("lecturer"), editScore);


router.get("/courses", getMyCourses);
router.get("/courses/:courseId/students", getCourseStudents);
router.get("/dashboard/stats", getDashboardStats);

module.exports = router;
