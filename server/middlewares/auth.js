// middlewares/auth.js
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { logger, logAction } = require("../src/config/logger");

exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader);

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format. Use Bearer token.",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log(token);
    if (!token) {
      logger.warn("No token provided", {
        ip: req.ip,
        url: req.url,
      });

      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // const JWT_SECRET = process.env.JWT_SECRET;
    // if (!JWT_SECRET) {
    //   console.log("JWT_SECRET is not defined in environment variables")
    //   throw new Error("JWT_SECRET is not defined in environment variables");
    // }
    // remember to uncomment from line 32

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // remember to remove the default later on !

    // Find user by ID and exclude password field
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        nameTitle: true,
        email: true,
        role: true,
        matricNumber: true,
        phoneNumber: true,
        level: true,
        facultyId: true,
        departmentId: true,
        accountStatus: true,
        lastLoginIP: true,
        createdAt: true,
        updatedAt: true,
        faculty: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      logger.warn("User not found for token", {
        userId: decoded.userId,
        ip: req.ip,
      });

      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if account is active (using accountStatus field)
    if (user.accountStatus !== "active") {
      logger.warn("Inactive account attempted access", {
        userId: user.id,
        status: user.accountStatus,
        ip: req.ip,
      });
      return res.status(401).json({
        success: false,
        message: "Account inactive!. Please contact administration.",
      });
    }

    // Attach user to request object
    req.user = user;
    req.prisma = prisma;
    logAction(
      user.id,
      "AUTH_SUCCESS",
      { method: req.method, url: req.url },
      req,
    );
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      logger.warn("Invalid token", { error: error.message, ip: req.ip });
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      logger.warn("Expired token", { ip: req.ip });
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    logger.error("Authentication error", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: "Authentication error.",
    });
  }
};

// Optional: Faculty-based authorization (for faculty-specific resources)
exports.authorizeFaculty = (req, res, next) => {
  try {
    const { facultyId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Admin can access any faculty
    if (req.user.role === "admin") {
      return next();
    }

    // Faculty head can only access their own faculty
    if (req.user.role === "faculty_head") {
      if (req.user.facultyId === facultyId) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: "You can only access resources for your faculty",
        });
      }
    }

    // Other roles need additional checks
    if (req.user.role === "department_head" || req.user.role === "lecturer") {
      // Check if user's department belongs to this faculty
      // This would require fetching department info
      return next(); // Simplified for now
    }

    return res.status(403).json({
      success: false,
      message: "Not authorized to access this faculty",
    });
  } catch (error) {
    console.error("Faculty authorization error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

// Optional: Department-based authorization
exports.authorizeDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Admin can access any department
    if (req.user.role === "admin") {
      return next();
    }

    // Faculty head can access departments in their faculty
    if (req.user.role === "faculty_head") {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
        select: { facultyId: true },
      });

      if (department && department.facultyId === req.user.facultyId) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: "You can only access departments in your faculty",
        });
      }
    }

    // Department head can access their own department
    if (req.user.role === "department_head") {
      if (req.user.departmentId === departmentId) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: "You can only access your own department",
        });
      }
    }

    // Lecturer can access their department
    if (req.user.role === "lecturer") {
      if (req.user.departmentId === departmentId) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: "You can only access your own department",
        });
      }
    }

    // Student can access their department
    if (req.user.role === "student") {
      if (req.user.departmentId === departmentId) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: "You can only access your own department",
        });
      }
    }

    return res.status(403).json({
      success: false,
      message: "Not authorized to access this department",
    });
  } catch (error) {
    console.error("Department authorization error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

// Optional: Check if user is head of department
exports.isDepartmentHead = async (req, res, next) => {
  try {
    const { departmentId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (req.user.role === "admin") {
      return next();
    }

    if (
      req.user.role === "department_head" &&
      req.user.departmentId === departmentId
    ) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Only the department head can perform this action",
    });
  } catch (error) {
    console.error("Department head check error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

// Optional: Check if user is head of faculty
exports.isFacultyHead = async (req, res, next) => {
  try {
    const { facultyId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (req.user.role === "admin") {
      return next();
    }

    if (req.user.role === "faculty_head" && req.user.facultyId === facultyId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Only the faculty head can perform this action",
    });
  } catch (error) {
    console.error("Faculty head check error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

// Optional: Check if user is course lecturer
exports.isCourseLecturer = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Admin can access any course
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user is head lecturer or teaches the course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        OR: [
          { headLecturerId: userId },
          { lecturers: { some: { id: userId } } },
        ],
      },
    });

    if (course) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message:
        "Only the course lecturer or head lecturer can perform this action",
    });
  } catch (error) {
    console.error("Course lecturer check error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};
