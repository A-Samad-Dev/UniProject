// routes/applicantRoute.js
const {
  registerApplicant,
  submitApplication,
  getApplicationStatus,
  getAllApplicants,
  getSingleApplicant,
  reviewApplication,
  getAdmissionStats,
  getApplicantByEmail,
  updateApplication,
} = require("../controllers/applicantController");
const { verifyToken } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

const router = require("express").Router();

router.get(
  "/admin/stats",
  verifyToken,
  authorize("admin", "super_admin"),
  getAdmissionStats,
);
router.post("/register", registerApplicant);
router.get("/status/:id", getApplicationStatus);
router.post("/submit-application/:id", submitApplication);

//  Admin Routes

router.get(
  "/admin/all",
  verifyToken,
  authorize("admin", "super_admin"),
  getAllApplicants,
);
router.get(
  "/admin/:id",
  verifyToken,
  authorize("admin", "super_admin"),
  getSingleApplicant,
);
router.post(
  "/admin/review/:id",
  verifyToken,
  authorize("admin", "super_admin"),
  reviewApplication,
);

router.get(
  "/admin/email/:email",
  verifyToken,
  authorize("admin", "super_admin"),
  getApplicantByEmail,
);
router.put(
  "/admin/update/:id",
  verifyToken,
  authorize("admin", "super_admin"),
  updateApplication,
);

module.exports = router;
