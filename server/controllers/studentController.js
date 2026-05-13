// controllers/studentController.js
const prisma = require("../lib/prisma");

// Register courses for a student
exports.registerCourses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courses } = req.body; // Array of course IDs

    // Validate input
    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of course IDs to register",
      });
    }

    // Remove duplicates
    const uniqueCourseIds = [...new Set(courses)];

    // Check if student exists and is active
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        role: "student",
        accountStatus: "active",
      },
      select: {
        id: true,
        name: true,
        matricNumber: true,
        level: true,
        departmentId: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found or account is not active",
      });
    }

    // Verify all courses exist and are valid for student's level
    const validCourses = await prisma.course.findMany({
      where: {
        id: { in: uniqueCourseIds },
        level: { lte: student.level || 100 }, // Can't register for courses above current level
      },
      select: {
        id: true,
        code: true,
        title: true,
        unit: true,
        level: true,
        semester: true,
      },
    });

    if (validCourses.length !== uniqueCourseIds.length) {
      const foundIds = validCourses.map((c) => c.id);
      const invalidIds = uniqueCourseIds.filter((id) => !foundIds.includes(id));
      return res.status(400).json({
        success: false,
        message: `Invalid courses: ${invalidIds.join(", ")}. Courses may not exist or are above your current level.`,
      });
    }

    // Calculate total units
    const totalUnits = validCourses.reduce(
      (sum, course) => sum + course.unit,
      0,
    );

    // Check maximum units (e.g., max 24 units per semester)
    const MAX_UNITS = 24;
    if (totalUnits > MAX_UNITS) {
      return res.status(400).json({
        success: false,
        message: `Cannot register for ${totalUnits} units. Maximum allowed is ${MAX_UNITS} units.`,
      });
    }

    // Get current session and semester
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentSemester = currentMonth < 6 ? "first" : "second";
    const academicSession = `${currentYear}/${currentYear + 1}`;

    // Check if registration already exists for this session/semester
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        studentId: studentId,
        session: academicSession,
        semester: currentSemester,
      },
      include: {
        courses: {
          include: {
            course: true,
          },
        },
      },
    });

    let registration;

    if (existingRegistration) {
      // Update existing registration
      // First, disconnect all existing courses
      await prisma.registeredCourse.deleteMany({
        where: {
          registrationId: existingRegistration.id,
        },
      });

      // Then connect new courses
      registration = await prisma.registration.update({
        where: { id: existingRegistration.id },
        data: {
          courses: {
            create: uniqueCourseIds.map((courseId) => ({
              courseId: courseId,
            })),
          },
          status: "pending", // Reset to pending for approval
          updatedAt: new Date(),
        },
        include: {
          courses: {
            include: {
              course: {
                select: {
                  id: true,
                  code: true,
                  title: true,
                  unit: true,
                },
              },
            },
          },
        },
      });
    } else {
      // Create new registration
      registration = await prisma.registration.create({
        data: {
          studentId: studentId,
          session: academicSession,
          semester: currentSemester,
          status: "pending",
          courses: {
            create: uniqueCourseIds.map((courseId) => ({
              courseId: courseId,
            })),
          },
        },
        include: {
          courses: {
            include: {
              course: {
                select: {
                  id: true,
                  code: true,
                  title: true,
                  unit: true,
                },
              },
            },
          },
        },
      });
    }

    console.log(
      `Student ${student.matricNumber} registered for ${uniqueCourseIds.length} courses`,
    );

    res.json({
      success: true,
      message: existingRegistration
        ? "Courses updated successfully"
        : "Courses registered successfully",
      data: {
        registrationId: registration.id,
        session: registration.session,
        semester: registration.semester,
        status: registration.status,
        totalUnits: totalUnits,
        courses: registration.courses.map((rc) => ({
          id: rc.course.id,
          code: rc.course.code,
          title: rc.course.title,
          units: rc.course.unit,
        })),
      },
    });
  } catch (error) {
    console.error("Course registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get student's registered courses for current session
exports.getMyRegisteredCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentSemester = currentMonth < 6 ? "first" : "second";
    const academicSession = `${currentYear}/${currentYear + 1}`;

    const registration = await prisma.registration.findFirst({
      where: {
        studentId: studentId,
        session: academicSession,
        semester: currentSemester,
      },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                title: true,
                unit: true,
                level: true,
                semester: true,
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
        },
      },
    });

    if (!registration) {
      return res.json({
        success: true,
        data: {
          registered: false,
          message: "No course registration found for current session",
          courses: [],
        },
      });
    }

    const totalUnits = registration.courses.reduce(
      (sum, rc) => sum + rc.course.unit,
      0,
    );

    res.json({
      success: true,
      data: {
        registered: true,
        registrationId: registration.id,
        session: registration.session,
        semester: registration.semester,
        status: registration.status,
        totalUnits: totalUnits,
        courses: registration.courses.map((rc) => ({
          id: rc.course.id,
          code: rc.course.code,
          title: rc.course.title,
          units: rc.course.unit,
          level: rc.course.level,
          department: rc.course.department,
        })),
      },
    });
  } catch (error) {
    console.error("Get registered courses error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Drop/withdraw from a course
exports.dropCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentSemester = currentMonth < 6 ? "first" : "second";
    const academicSession = `${currentYear}/${currentYear + 1}`;

    // Find current registration
    const registration = await prisma.registration.findFirst({
      where: {
        studentId: studentId,
        session: academicSession,
        semester: currentSemester,
      },
      include: {
        courses: true,
      },
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "No registration found for current session",
      });
    }

    // Check if course is registered
    const registeredCourse = registration.courses.find(
      (rc) => rc.courseId === courseId,
    );
    if (!registeredCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found in your registration",
      });
    }

    // Remove the course
    await prisma.registeredCourse.delete({
      where: {
        id: registeredCourse.id,
      },
    });

    // Get updated registration
    const updatedRegistration = await prisma.registration.findUnique({
      where: { id: registration.id },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                title: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    const totalUnits = updatedRegistration.courses.reduce(
      (sum, rc) => sum + rc.course.unit,
      0,
    );

    res.json({
      success: true,
      message: "Course dropped successfully",
      data: {
        registrationId: updatedRegistration.id,
        totalUnits: totalUnits,
        remainingCourses: updatedRegistration.courses.map((rc) => ({
          id: rc.course.id,
          code: rc.course.code,
          title: rc.course.title,
          units: rc.course.unit,
        })),
      },
    });
  } catch (error) {
    console.error("Drop course error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get available courses for registration based on student's level
exports.getAvailableCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get student details
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        level: true,
        departmentId: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentSemester = currentMonth < 6 ? "first" : "second";
    const studentLevel = student.level || 100;

    // Get courses available for student's level and department
    const availableCourses = await prisma.course.findMany({
      where: {
        level: { lte: studentLevel },
        semester: currentSemester,
        OR: [
          { departmentId: student.departmentId },
          { departmentId: null }, // University-wide courses
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
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: [{ level: "asc" }, { code: "asc" }],
    });

    // Get already registered courses
    const registration = await prisma.registration.findFirst({
      where: {
        studentId: studentId,
        session: `${currentYear}/${currentYear + 1}`,
        semester: currentSemester,
      },
      include: {
        courses: {
          include: {
            course: true,
          },
        },
      },
    });

    const registeredCourseIds =
      registration?.courses.map((rc) => rc.courseId) || [];

    // Mark which courses are already registered
    const coursesWithStatus = availableCourses.map((course) => ({
      ...course,
      isRegistered: registeredCourseIds.includes(course.id),
    }));

    res.json({
      success: true,
      data: {
        studentLevel: studentLevel,
        semester: currentSemester,
        session: `${currentYear}/${currentYear + 1}`,
        totalAvailable: availableCourses.length,
        totalRegistered: registeredCourseIds.length,
        courses: coursesWithStatus,
      },
    });
  } catch (error) {
    console.error("Get available courses error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get registration history for student
exports.getRegistrationHistory = async (req, res) => {
  try {
    const studentId = req.user.id;

    const registrations = await prisma.registration.findMany({
      where: {
        studentId: studentId,
      },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                title: true,
                unit: true,
              },
            },
          },
        },
      },
      orderBy: [{ session: "desc" }, { semester: "desc" }],
    });

    const history = registrations.map((reg) => ({
      id: reg.id,
      session: reg.session,
      semester: reg.semester,
      status: reg.status,
      createdAt: reg.createdAt,
      totalUnits: reg.courses.reduce((sum, rc) => sum + rc.course.unit, 0),
      totalCourses: reg.courses.length,
      courses: reg.courses.map((rc) => ({
        code: rc.course.code,
        title: rc.course.title,
        units: rc.course.unit,
      })),
    }));

    res.json({
      success: true,
      data: {
        totalRegistrations: registrations.length,
        history: history,
      },
    });
  } catch (error) {
    console.error("Get registration history error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: Get all registrations for a course
exports.getCourseRegistrations = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { session, semester, status } = req.query;

    const where = {
      courses: {
        some: {
          courseId: courseId,
        },
      },
    };

    if (session) where.session = session;
    if (semester) where.semester = semester;
    if (status) where.status = status;

    const registrations = await prisma.registration.findMany({
      where: where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            matricNumber: true,
            email: true,
            level: true,
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        courses: {
          where: {
            courseId: courseId,
          },
          include: {
            course: {
              select: {
                id: true,
                code: true,
                title: true,
                unit: true,
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

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        code: true,
        title: true,
        unit: true,
      },
    });

    res.json({
      success: true,
      data: {
        course: course,
        totalRegistrations: registrations.length,
        registrations: registrations.map((reg) => ({
          id: reg.id,
          student: reg.student,
          session: reg.session,
          semester: reg.semester,
          status: reg.status,
          registeredAt: reg.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Get course registrations error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: Approve or reject course registration
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { status, remarks } = req.body; // status: "approved" or "pending"

    if (!status || !["approved", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid status (approved or pending)",
      });
    }

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            matricNumber: true,
          },
        },
        courses: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    const updatedRegistration = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: status,
        updatedAt: new Date(),
      },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                title: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      message: `Registration ${status} successfully`,
      data: {
        registrationId: updatedRegistration.id,
        student: registration.student,
        status: updatedRegistration.status,
        session: updatedRegistration.session,
        semester: updatedRegistration.semester,
        totalCourses: updatedRegistration.courses.length,
        courses: updatedRegistration.courses.map((rc) => ({
          code: rc.course.code,
          title: rc.course.title,
        })),
      },
    });
  } catch (error) {
    console.error("Update registration status error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get student's dashboard summary
exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get current registration
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentSemester = currentMonth < 6 ? "first" : "second";
    const academicSession = `${currentYear}/${currentYear + 1}`;

    const [currentRegistration, results, totalCoursesTaken] = await Promise.all(
      [
        prisma.registration.findFirst({
          where: {
            studentId: studentId,
            session: academicSession,
            semester: currentSemester,
          },
          include: {
            courses: {
              include: {
                course: {
                  select: {
                    unit: true,
                  },
                },
              },
            },
          },
        }),
        prisma.result.findMany({
          where: {
            studentId: studentId,
            approved: true,
          },
          include: {
            course: {
              select: {
                unit: true,
              },
            },
          },
        }),
        prisma.result.count({
          where: {
            studentId: studentId,
            approved: true,
          },
        }),
      ],
    );

    // Calculate current GPA
    let currentGPA = 0;
    const gradePoints = { A: 5.0, B: 4.0, C: 3.0, D: 2.0, E: 1.0, F: 0.0 };
    let totalPoints = 0;
    let totalUnits = 0;

    results.forEach((result) => {
      if (result.grade && result.course.unit) {
        totalPoints += (gradePoints[result.grade] || 0) * result.course.unit;
        totalUnits += result.course.unit;
      }
    });
    currentGPA = totalUnits > 0 ? totalPoints / totalUnits : 0;

    const registeredUnits =
      currentRegistration?.courses.reduce(
        (sum, rc) => sum + rc.course.unit,
        0,
      ) || 0;

    res.json({
      success: true,
      data: {
        currentSession: academicSession,
        currentSemester: currentSemester,
        registration: currentRegistration
          ? {
              status: currentRegistration.status,
              registeredUnits: registeredUnits,
              totalCourses: currentRegistration.courses.length,
            }
          : null,
        academics: {
          totalCoursesTaken: totalCoursesTaken,
          currentGPA: parseFloat(currentGPA.toFixed(2)),
          totalUnits: totalUnits,
        },
      },
    });
  } catch (error) {
    console.error("Get student dashboard error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
