const { editScore } = require("../controllers/lecturerController");
const {
  getStudentResults,
  getCourseResults,
  getPendingResults,
  approveResult,
  bulkApproveResults,
  getResultById,
} = require("../controllers/resultController");
const { verifyToken } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");
const router = require("express").Router();

router.use(verifyToken);

router.get("/my-results", authorize("student"), getStudentResults);
router.get(
  "/course/:courseId",
  authorize("lecturer", "department_head", "faculty_head", "admin"),
  getCourseResults,
);
router.get(
  "/pending",
  authorize("department_head", "faculty_head", "admin"),
  getPendingResults,
);
router.get(
  "/:id",
  authorize("department_head", "faculty_head", "admin"),
  getResultById,
);

router.put(
  "/:id/approve",
  authorize("department_head", "faculty_head", "admin"),
  approveResult,
);
router.post(
  "/bulk-approve",
  authorize("department_head", "faculty_head", "admin"),
  bulkApproveResults,
);

module.exports = router;
