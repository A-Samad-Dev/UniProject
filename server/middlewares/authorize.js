const {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} = require("../src/config/permissions");
const { logger } = require("../src/config/logger");

// Role-based authorization
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        logger.warn("Authorization failed: No user in request", {
          ip: req.ip,
          url: req.url,
        });

        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }
      if (user.role === "super_admin") {
        return next();
      }

      // Check if user's role is allowed
      if (!allowedRoles.includes(user.role)) {
        logger.warn(`Authorization failed: ${user.role} not allowed`, {
          userId: user.id,
          userRole: user.role,
          allowedRoles: allowedRoles,
          url: req.url,
        });

        return res.status(403).json({
          success: false,
          message: `Access denied. ${user.role} role not authorized`,
        });
      }

      logger.debug(`Authorization successful: ${user.role}`, {
        userId: user.id,
        userRole: user.role,
        url: req.url,
      });

      next();
    } catch (error) {
      logger.error("Authorization error", {
        error: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
};

// Permission-based authorization
const authorizeWithPermissions = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        logger.warn("Permission check failed: No user in request", {
          ip: req.ip,
          url: req.url,
        });

        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Get full user with permissions from database
      const fullUser = await req.prisma.user.findUnique({
        where: { id: user.id },
        select: { permissions: true },
      });

      const userPermissions = fullUser?.permissions || [];

      // Check if user has all required permissions
      const hasAccess = requiredPermissions.every(
        (permission) =>
          userPermissions.includes(permission) ||
          userPermissions.includes("all"),
      );

      if (!hasAccess) {
        logger.warn(`Permission denied for user ${user.id}`, {
          userId: user.id,
          userRole: user.role,
          requiredPermissions: requiredPermissions,
          userPermissions: userPermissions,
          url: req.url,
        });

        return res.status(403).json({
          success: false,
          message: `Missing required permissions: ${requiredPermissions.join(", ")}`,
        });
      }

      logger.debug(`Permission granted for user ${user.id}`, {
        userId: user.id,
        permissions: requiredPermissions,
        url: req.url,
      });

      next();
    } catch (error) {
      logger.error("Permission authorization error", {
        error: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
};

// Combined role and permission authorization
const authorizeWithRolesAndPermissions = (
  allowedRoles,
  requiredPermissions = [],
) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        logger.warn("Authorization failed: No user in request");
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Check role
      if (!allowedRoles.includes(user.role)) {
        logger.warn(`Role check failed for user ${user.id}`, {
          userId: user.id,
          userRole: user.role,
          allowedRoles: allowedRoles,
        });

        return res.status(403).json({
          success: false,
          message: `Access denied. ${user.role} role not authorized`,
        });
      }

      // If no permissions required, just check role
      if (requiredPermissions.length === 0) {
        return next();
      }

      // Check permissions
      const fullUser = await req.prisma.user.findUnique({
        where: { id: user.id },
        select: { permissions: true },
      });

      const userPermissions = fullUser?.permissions || [];
      const hasAllPerms = requiredPermissions.every(
        (permission) =>
          userPermissions.includes(permission) ||
          userPermissions.includes("all"),
      );

      if (!hasAllPerms) {
        logger.warn(`Permission check failed for user ${user.id}`, {
          userId: user.id,
          requiredPermissions: requiredPermissions,
          userPermissions: userPermissions,
        });

        return res.status(403).json({
          success: false,
          message: `Missing required permissions: ${requiredPermissions.join(", ")}`,
        });
      }

      logger.debug(`Authorization successful for user ${user.id}`, {
        userId: user.id,
        role: user.role,
        permissions: requiredPermissions,
      });

      next();
    } catch (error) {
      logger.error("Authorization error", { error: error.message });
      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
};

const canCreateAdmin = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // Only super_admin can create other admins
  if (user.role !== "super_admin") {
    logger.warn(`Unauthorized admin creation attempt by user ${user.id}`, {
      userId: user.id,
      userRole: user.role,
      url: req.url,
    });
    return res.status(403).json({
      success: false,
      message: "Only Super Admin can create new admin users",
    });
  }

  next();
};

module.exports = {
  authorize,
  authorizeWithPermissions,
  authorizeWithRolesAndPermissions,
  canCreateAdmin,
};
