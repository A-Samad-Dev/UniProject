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

router.post("/register", registerApplicant);
router.post("/submit-application/:id", submitApplication);
router.get("/status/:id", getApplicationStatus);

//  Admin Routes

router.get("/admin/all", verifyToken, authorize("admin"), getAllApplicants);
router.get("/admin/:id", verifyToken, authorize("admin"), getSingleApplicant);
router.post(
  "/admin/review/:id",
  verifyToken,
  authorize("admin"),
  reviewApplication,
);

router.get("/admin/stats", verifyToken, authorize("admin"), getAdmissionStats);

router.get(
  "/admin/email/:email",
  verifyToken,
  authorize("admin"),
  getApplicantByEmail,
);
router.put(
  "/admin/update/:id",
  verifyToken,
  authorize("admin"),
  updateApplication,
);

module.exports = router;
