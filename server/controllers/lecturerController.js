// controllers/lecturerController.js
const prisma = require("../lib/prisma");

exports.getMyCourses = async (req, res) => {
  try {
    const lecturerId = req.user.id;

    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { headLecturerId: lecturerId },
          { lecturers: { some: { id: lecturerId } } },
        ],
      },
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
        _count: {
          select: {
            registrations: true,
            results: true,
          },
        },
      },
      orderBy: {
        code: "asc",
      },
    });

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Get my courses error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get students enrolled in a specific course
exports.getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lecturerId = req.user.id;

    // Verify lecturer teaches this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        OR: [
          { headLecturerId: lecturerId },
          { lecturers: { some: { id: lecturerId } } },
        ],
      },
      select: { id: true, title: true, code: true },
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view students for this course",
      });
    }

    // Get all registered students for this course
    const registrations = await prisma.registration.findMany({
      where: {
        courses: {
          some: {
            courseId: courseId,
          },
        },
        status: "approved",
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            matricNumber: true,
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    // Get results for these students
    const studentsWithResults = await Promise.all(
      registrations.map(async (reg) => {
        const result = await prisma.result.findFirst({
          where: {
            studentId: reg.studentId,
            courseId: courseId,
          },
          include: {
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

        return {
          ...reg.student,
          registrationStatus: reg.status,
          result: result || null,
        };
      }),
    );

    res.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          code: course.code,
        },
        students: studentsWithResults,
        totalStudents: studentsWithResults.length,
      },
    });
  } catch (error) {
    console.error("Get course students error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all scores for a specific student in lecturer's courses
exports.getStudentScores = async (req, res) => {
  try {
    const { studentId } = req.params;
    const lecturerId = req.user.id;

    // Get all results for this student in courses taught by the lecturer
    const results = await prisma.result.findMany({
      where: {
        studentId: studentId,
        course: {
          OR: [
            { headLecturerId: lecturerId },
            { lecturers: { some: { id: lecturerId } } },
          ],
        },
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
        scores: {
          where: {
            lecturerId: lecturerId,
          },
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
        course: {
          code: "asc",
        },
      },
    });

    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        role: "student",
      },
      select: {
        id: true,
        name: true,
        matricNumber: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      data: {
        student: student,
        results: results,
      },
    });
  } catch (error) {
    console.error("Get student scores error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve/verify results (if department head/faculty head)
exports.approveResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const { approved } = req.body;

    const result = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        course: {
          include: {
            department: {
              include: {
                faculty: true,
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

    // Check if user has approval authority (department head or faculty head)
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        department: true,
        faculty: true,
      },
    });

    let isAuthorized = false;
    if (user.role === "admin") {
      isAuthorized = true;
    } else if (
      user.role === "faculty_head" &&
      user.facultyId === result.course.department.facultyId
    ) {
      isAuthorized = true;
    } else if (
      user.role === "department_head" &&
      user.departmentId === result.course.departmentId
    ) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to approve results",
      });
    }

    const updatedResult = await prisma.result.update({
      where: { id: resultId },
      data: { approved: approved },
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
      },
    });

    res.json({
      success: true,
      message: `Result ${approved ? "approved" : "unapproved"} successfully`,
      data: updatedResult,
    });
  } catch (error) {
    console.error("Approve result error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get lecturer's dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const lecturerId = req.user.id;

    // Get courses taught by lecturer
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { headLecturerId: lecturerId },
          { lecturers: { some: { id: lecturerId } } },
        ],
      },
      select: { id: true },
    });

    const courseIds = courses.map((c) => c.id);

    // Get statistics
    const [totalCourses, totalStudents, totalResults, pendingApprovals] =
      await Promise.all([
        prisma.course.count({
          where: {
            OR: [
              { headLecturerId: lecturerId },
              { lecturers: { some: { id: lecturerId } } },
            ],
          },
        }),
        prisma.registration.count({
          where: {
            courseId: { in: courseIds },
            status: "approved",
          },
        }),
        prisma.result.count({
          where: {
            courseId: { in: courseIds },
          },
        }),
        prisma.result.count({
          where: {
            courseId: { in: courseIds },
            approved: false,
            totalScore: { not: null },
          },
        }),
      ]);

    res.json({
      success: true,
      data: {
        totalCourses,
        totalStudents,
        totalResults,
        pendingApprovals,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update multiple scores at once (bulk upload)
exports.bulkUploadScores = async (req, res) => {
  try {
    const { courseId, scores } = req.body; // scores: array of {studentId, score}
    const lecturerId = req.user.id;

    if (!courseId || !scores || !Array.isArray(scores)) {
      return res.status(400).json({
        success: false,
        message: "Please provide courseId and scores array",
      });
    }

    // Verify lecturer teaches this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        OR: [
          { headLecturerId: lecturerId },
          { lecturers: { some: { id: lecturerId } } },
        ],
      },
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to upload scores for this course",
      });
    }

    const results = [];
    for (const item of scores) {
      const { studentId, score } = item;

      // Check if result exists
      const existingResult = await prisma.result.findFirst({
        where: {
          studentId: studentId,
          courseId: courseId,
        },
      });

      if (existingResult) {
        // Update existing result
        const updatedResult = await prisma.result.update({
          where: { id: existingResult.id },
          data: {
            totalScore: score,
            grade: calculateGrade(score),
          },
        });
        results.push(updatedResult);
      } else {
        // Create new result
        const newResult = await prisma.result.create({
          data: {
            studentId: studentId,
            courseId: courseId,
            totalScore: score,
            grade: calculateGrade(score),
            scores: {
              create: {
                lecturerId: lecturerId,
                score: score,
              },
            },
          },
        });
        results.push(newResult);
      }
    }

    res.json({
      success: true,
      message: `Successfully uploaded ${results.length} scores`,
      data: results,
    });
  } catch (error) {
    console.error("Bulk upload scores error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const calculateGrade = (score) => {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
};

exports.addScore = async (req, res) => {
  try {
    const { studentId, courseId, score } = req.body;
    const lecturerId = req.user.id;

    // Validate input
    if (!studentId || !courseId || score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide studentId, courseId, and score",
      });
    }

    if (score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: "Score must be between 0 and 100",
      });
    }

    // Check if lecturer is authorized for this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        OR: [
          { headLecturerId: lecturerId },
          { lecturers: { some: { id: lecturerId } } },
        ],
      },
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this course",
      });
    }

    // Check if student exists
    const student = await prisma.user.findFirst({
      where: { id: studentId, role: "student" },
      select: { id: true, name: true, matricNumber: true },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if result already exists (to prevent duplicate)
    const existingResult = await prisma.result.findFirst({
      where: {
        studentId: studentId,
        courseId: courseId,
      },
    });

    // If result exists, use editScore function instead
    if (existingResult) {
      return res.status(400).json({
        success: false,
        message:
          "Score already exists for this student-course. Use edit endpoint instead.",
      });
    }

    // CREATE new result
    const result = await prisma.result.create({
      data: {
        studentId: studentId,
        courseId: courseId,
        totalScore: score,
        grade: calculateGrade(score),
        approved: false,
        scores: {
          create: {
            lecturerId: lecturerId,
            score: score,
          },
        },
      },
      include: {
        student: {
          select: { id: true, name: true, matricNumber: true },
        },
        course: {
          select: { id: true, title: true, code: true },
        },
      },
    });

    console.log(
      `✅ Score ADDED for student ${student.name} in course ${course.code}`,
    );

    res.json({
      success: true,
      message: "Score added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Add score error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. EDIT EXISTING SCORE (for existing student-course pair)
exports.editScore = async (req, res) => {
  try {
    const { studentId, courseId, score } = req.body;
    const lecturerId = req.user.id;

    // Validate input
    if (!studentId || !courseId || score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide studentId, courseId, and score",
      });
    }

    if (score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: "Score must be between 0 and 100",
      });
    }

    // Check if lecturer is authorized for this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        OR: [
          { headLecturerId: lecturerId },
          { lecturers: { some: { id: lecturerId } } },
        ],
      },
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this course",
      });
    }

    // Check if result exists and is NOT approved
    const existingResult = await prisma.result.findFirst({
      where: {
        studentId: studentId,
        courseId: courseId,
      },
      include: { scores: true },
    });

    if (!existingResult) {
      return res.status(404).json({
        success: false,
        message: "No existing score found. Use add endpoint instead.",
      });
    }

    // 🔒 CRITICAL: Check if result is already approved
    if (existingResult.approved === true) {
      return res.status(403).json({
        success: false,
        message:
          "Cannot edit score. Result has already been approved by department head.",
      });
    }

    // Check if this lecturer already submitted a score
    const existingScore = existingResult.scores.find(
      (s) => s.lecturerId === lecturerId,
    );

    if (existingScore) {
      // UPDATE existing score
      await prisma.score.update({
        where: { id: existingScore.id },
        data: { score: score },
      });
    } else {
      // ADD new score from this lecturer
      await prisma.score.create({
        data: {
          resultId: existingResult.id,
          lecturerId: lecturerId,
          score: score,
        },
      });
    }

    // Recalculate total score (average of all lecturer scores)
    const updatedResult = await prisma.result.findUnique({
      where: { id: existingResult.id },
      include: { scores: true },
    });

    const totalScore =
      updatedResult.scores.reduce((sum, s) => sum + s.score, 0) /
      updatedResult.scores.length;

    const grade = calculateGrade(totalScore);

    // Update result with new total and grade, and reset approval
    const finalResult = await prisma.result.update({
      where: { id: existingResult.id },
      data: {
        totalScore: totalScore,
        grade: grade,
        approved: false, // Reset approval status when edited
      },
      include: {
        student: {
          select: { id: true, name: true, matricNumber: true },
        },
        course: {
          select: { id: true, title: true, code: true },
        },
        scores: {
          include: {
            lecturer: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    console.log(
      `✏️ Score EDITED for student ${existingResult.studentId} in course ${course.code}`,
    );

    res.json({
      success: true,
      message: "Score edited successfully",
      data: finalResult,
    });
  } catch (error) {
    console.error("Edit score error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. SINGLE FUNCTION THAT HANDLES BOTH
exports.uploadScore = async (req, res) => {
  try {
    const { studentId, courseId, score } = req.body;
    const lecturerId = req.user.id;

    // Validate input
    if (!studentId || !courseId || score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide studentId, courseId, and score",
      });
    }

    if (score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: "Score must be between 0 and 100",
      });
    }

    // Check if lecturer is authorized
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        OR: [
          { headLecturerId: lecturerId },
          { lecturers: { some: { id: lecturerId } } },
        ],
      },
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this course",
      });
    }

    // Check if student exists
    const student = await prisma.user.findFirst({
      where: { id: studentId, role: "student" },
      select: { id: true, name: true, matricNumber: true },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if result already exists
    const existingResult = await prisma.result.findFirst({
      where: { studentId: studentId, courseId: courseId },
      include: { scores: true },
    });

    // 🔒 Check if approved (prevents editing approved results)
    if (existingResult && existingResult.approved === true) {
      return res.status(403).json({
        success: false,
        message: "Cannot edit score. Result has already been approved.",
      });
    }

    let result;

    if (existingResult) {
      // ========== EDIT MODE ==========
      const existingScore = existingResult.scores.find(
        (s) => s.lecturerId === lecturerId,
      );

      if (existingScore) {
        await prisma.score.update({
          where: { id: existingScore.id },
          data: { score: score },
        });
      } else {
        await prisma.score.create({
          data: {
            resultId: existingResult.id,
            lecturerId: lecturerId,
            score: score,
          },
        });
      }

      // Recalculate total
      const updatedScores = await prisma.result.findUnique({
        where: { id: existingResult.id },
        include: { scores: true },
      });

      const totalScore =
        updatedScores.scores.reduce((sum, s) => sum + s.score, 0) /
        updatedScores.scores.length;

      const grade = calculateGrade(totalScore);

      result = await prisma.result.update({
        where: { id: existingResult.id },
        data: {
          totalScore: totalScore,
          grade: grade,
          approved: false,
        },
        include: {
          student: { select: { id: true, name: true, matricNumber: true } },
          course: { select: { id: true, title: true, code: true } },
          scores: {
            include: { lecturer: { select: { id: true, name: true } } },
          },
        },
      });

      console.log(
        `✏️ Score EDITED for student ${student.name} in course ${course.code}`,
      );
    } else {
      // ========== ADD MODE ==========
      result = await prisma.result.create({
        data: {
          studentId: studentId,
          courseId: courseId,
          totalScore: score,
          grade: calculateGrade(score),
          approved: false,
          scores: {
            create: { lecturerId: lecturerId, score: score },
          },
        },
        include: {
          student: { select: { id: true, name: true, matricNumber: true } },
          course: { select: { id: true, title: true, code: true } },
          scores: {
            include: { lecturer: { select: { id: true, name: true } } },
          },
        },
      });

      console.log(
        `✅ Score ADDED for student ${student.name} in course ${course.code}`,
      );
    }

    res.json({
      success: true,
      message: existingResult
        ? "Score updated successfully"
        : "Score added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Upload score error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. GET EDITABLE SCORES ( only unapproved results)
exports.getEditableScores = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lecturerId = req.user.id;

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        OR: [
          { headLecturerId: lecturerId },
          { lecturers: { some: { id: lecturerId } } },
        ],
      },
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view scores for this course",
      });
    }

    const editableResults = await prisma.result.findMany({
      where: {
        courseId: courseId,
        approved: false, // Only unapproved results can be edited
      },
      include: {
        student: {
          select: { id: true, name: true, matricNumber: true },
        },
        scores: {
          include: {
            lecturer: { select: { id: true, name: true } },
          },
        },
      },
    });

    res.json({
      success: true,
      data: editableResults,
    });
  } catch (error) {
    console.error("Get editable scores error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
