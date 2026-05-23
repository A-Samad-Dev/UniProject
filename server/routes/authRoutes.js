// routes/authRoutes.js
const router = require("express").Router();
const {
  login,
  register,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  logout,
  getPublicCourses,
  getPublicDepartmentsWithPrograms,
} = require("../controllers/authController");
const { verifyToken } = require("../middlewares/auth");

// public routes
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// protected routes
router.get("/me", verifyToken, getMe);
router.post("/change-password", verifyToken, changePassword);
router.post("/logout", verifyToken, logout);

router.get("/public/courses", getPublicCourses);
router.get("/public/departments", getPublicDepartmentsWithPrograms);

module.exports = router;
