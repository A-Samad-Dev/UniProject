
// middlewares/scope.js

/**
 * Scope middleware to filter queries by faculty
 * Sets req.filter with faculty ID filter for Prisma queries
 */
exports.facultyScope = (req, res, next) => {
  // Check if user has faculty assigned
  if (!req.user || !req.user.facultyId) {
    return res.status(403).json({
      success: false,
      message: "User has no faculty assigned"
    });
  }
  
  // Set filter for Prisma queries
  req.filter = {
    facultyId: req.user.facultyId
  };
  
  next();
};

/**
 * Scope middleware to filter queries by department
 * Sets req.filter with department ID filter for Prisma queries
 */
exports.departmentScope = (req, res, next) => {
  // Check if user has department assigned
  if (!req.user || !req.user.departmentId) {
    return res.status(403).json({
      success: false,
      message: "User has no department assigned"
    });
  }
  
  // Set filter for Prisma queries
  req.filter = {
    departmentId: req.user.departmentId
  };
  
  next();
};

/**
 * Combined scope middleware for nested faculty-department access
 * For users who need to scope by both faculty and department
 */
exports.facultyAndDepartmentScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }
  
  const filter = {};
  
  if (req.user.facultyId) {
    filter.facultyId = req.user.facultyId;
  }
  
  if (req.user.departmentId) {
    filter.departmentId = req.user.departmentId;
  }
  
  req.filter = filter;
  next();
};

/**
 * Conditional scope - applies only if user has the field
 * Useful for lecturers who might belong to a department but not necessarily a faculty
 */
exports.conditionalScope = (fields = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    
    const filter = {};
    
    fields.forEach(field => {
      if (field === 'faculty' && req.user.facultyId) {
        filter.facultyId = req.user.facultyId;
      }
      if (field === 'department' && req.user.departmentId) {
        filter.departmentId = req.user.departmentId;
      }
    });
    
    req.filter = filter;
    next();
  };
};

/**
 * Helper function to apply scope filters to Prisma queries
 * Use this in your controllers to apply the scope
 */
exports.applyScope = (prismaQuery, scopeFilter) => {
  if (scopeFilter && Object.keys(scopeFilter).length > 0) {
    return {
      ...prismaQuery,
      where: {
        ...prismaQuery.where,
        ...scopeFilter
      }
    };
  }
  return prismaQuery;
};