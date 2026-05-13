// controllers/resultController.js
const prisma = require("../lib/prisma");

// Approve result (head lecturer only)
exports.approveResult = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the result with necessary relations
    const result = await prisma.result.findUnique({
      where: { id: id },
      include: {
        course: {
          select: {
            id: true,
            headLecturerId: true,
            title: true,
            code: true,
          },
        },
        scores: {
          include: {
            lecturer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            matricNumber: true,
          },
        },
      },
    });

    // Check if result exists
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    // Check if user is the head lecturer of the course
    if (result.course.headLecturerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the head lecturer can approve results for this course",
      });
    }

    // Check if result is already approved
    if (result.approved) {
      return res.status(400).json({
        success: false,
        message: "Result has already been approved",
      });
    }

    // Calculate total score (sum of all scores)
    const totalScore = result.scores.reduce(
      (sum, score) => sum + score.score,
      0,
    );

    // Calculate grade based on total score
    let grade = "";
    if (totalScore >= 70) grade = "A";
    else if (totalScore >= 60) grade = "B";
    else if (totalScore >= 50) grade = "C";
    else if (totalScore >= 45) grade = "D";
    else if (totalScore >= 40) grade = "E";
    else grade = "F";

    // Update result with total score, grade, and approval status
    const updatedResult = await prisma.result.update({
      where: { id: id },
      data: {
        totalScore: totalScore,
        grade: grade,
        approved: true,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true,
            unit: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            matricNumber: true,
          },
        },
        scores: {
          include: {
            lecturer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Result approved successfully",
      data: {
        id: updatedResult.id,
        student: updatedResult.student,
        course: updatedResult.course,
        totalScore: updatedResult.totalScore,
        grade: updatedResult.grade,
        approved: updatedResult.approved,
        scores: updatedResult.scores,
      },
    });
  } catch (error) {
    console.error("Approve result error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all results for a course (head lecturer or teaching lecturer)
exports.getCourseResults = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if user is authorized (head lecturer or teaches the course)
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        OR: [
          { headLecturerId: userId },
          { lecturers: { some: { id: userId } } },
        ],
      },
      select: {
        id: true,
        title: true,
        code: true,
        headLecturerId: true,
      },
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view results for this course",
      });
    }

    // Get all results for the course
    const results = await prisma.result.findMany({
      where: {
        courseId: courseId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            matricNumber: true,
            email: true,
          },
        },
        scores: {
          include: {
            lecturer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        student: {
          matricNumber: "asc",
        },
      },
    });

    res.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          code: course.code,
        },
        results: results,
        total: results.length,
      },
    });
  } catch (error) {
    console.error("Get course results error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get student's results (for student portal)
exports.getStudentResults = async (req, res) => {
  try {
    const studentId = req.user.id; // From auth middleware

    // Get all results for the student
    const results = await prisma.result.findMany({
      where: {
        studentId: studentId,
        approved: true, // Only show approved results
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true,
            unit: true,
            semester: true,
            level: true,
          },
        },
        scores: {
          include: {
            lecturer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          course: {
            level: "asc",
          },
        },
        {
          course: {
            semester: "asc",
          },
        },
      ],
    });

    // Calculate GPA and other statistics
    let totalUnits = 0;
    let totalGradePoints = 0;

    const gradePoints = {
      A: 5.0,
      B: 4.0,
      C: 3.0,
      D: 2.0,
      E: 1.0,
      F: 0.0,
    };

    results.forEach((result) => {
      if (result.grade && result.course.unit) {
        const points = gradePoints[result.grade] || 0;
        totalGradePoints += points * result.course.unit;
        totalUnits += result.course.unit;
      }
    });

    const gpa = totalUnits > 0 ? (totalGradePoints / totalUnits).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        student: {
          id: req.user.id,
          name: req.user.name,
          matricNumber: req.user.matricNumber,
        },
        summary: {
          totalCourses: results.length,
          totalUnits: totalUnits,
          gpa: parseFloat(gpa),
        },
        results: results,
      },
    });
  } catch (error) {
    console.error("Get student results error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all pending results for head lecturer's courses
exports.getPendingResults = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all courses where user is head lecturer
    const courses = await prisma.course.findMany({
      where: {
        headLecturerId: userId,
      },
      select: {
        id: true,
        title: true,
        code: true,
      },
    });

    const courseIds = courses.map((c) => c.id);

    // Get all unapproved results for these courses
    const pendingResults = await prisma.result.findMany({
      where: {
        courseId: { in: courseIds },
        approved: false,
        totalScore: { not: null }, // Only results that have scores
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            matricNumber: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        scores: {
          include: {
            lecturer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.json({
      success: true,
      count: pendingResults.length,
      data: pendingResults,
    });
  } catch (error) {
    console.error("Get pending results error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get result by ID with full details
exports.getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const result = await prisma.result.findUnique({
      where: { id: id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            matricNumber: true,
            email: true,
            phoneNumber: true,
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        course: {
          include: {
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            headLecturer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        scores: {
          include: {
            lecturer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    // Check authorization
    const isStudent = userRole === "student" && result.studentId === userId;
    const isHeadLecturer = result.course.headLecturerId === userId;
    const isAdmin = userRole === "admin";
    const isFacultyHead = userRole === "faculty_head";
    const isDepartmentHead = userRole === "department_head";

    if (
      !isStudent &&
      !isHeadLecturer &&
      !isAdmin &&
      !isFacultyHead &&
      !isDepartmentHead
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this result",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get result by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Bulk approve results
exports.bulkApproveResults = async (req, res) => {
  try {
    const { resultIds } = req.body;
    const userId = req.user.id;

    if (!resultIds || !Array.isArray(resultIds)) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of result IDs",
      });
    }

    // Get all results with their courses
    const results = await prisma.result.findMany({
      where: {
        id: { in: resultIds },
      },
      include: {
        course: {
          select: {
            id: true,
            headLecturerId: true,
          },
        },
        scores: true,
      },
    });

    // Verify user is head lecturer for all courses
    const unauthorizedResults = results.filter(
      (r) => r.course.headLecturerId !== userId,
    );

    if (unauthorizedResults.length > 0) {
      return res.status(403).json({
        success: false,
        message: `You are not authorized to approve ${unauthorizedResults.length} of the selected results`,
        unauthorizedResultIds: unauthorizedResults.map((r) => r.id),
      });
    }

    // Approve all results
    const updatedResults = [];
    for (const result of results) {
      // Calculate total score
      const totalScore = result.scores.reduce(
        (sum, score) => sum + score.score,
        0,
      );

      // Calculate grade
      let grade = "";
      if (totalScore >= 70) grade = "A";
      else if (totalScore >= 60) grade = "B";
      else if (totalScore >= 50) grade = "C";
      else if (totalScore >= 45) grade = "D";
      else if (totalScore >= 40) grade = "E";
      else grade = "F";

      const updated = await prisma.result.update({
        where: { id: result.id },
        data: {
          totalScore: totalScore,
          grade: grade,
          approved: true,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              matricNumber: true,
            },
          },
          course: {
            select: {
              title: true,
              code: true,
            },
          },
        },
      });
      updatedResults.push(updated);
    }

    res.json({
      success: true,
      message: `Successfully approved ${updatedResults.length} results`,
      data: updatedResults,
    });
  } catch (error) {
    console.error("Bulk approve results error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
