// controllers/applicantController.js
const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const { generateMatric } = require("../services/matricServices");
const { logger } = require("../src/config/logger");

exports.registerApplicant = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      password,
      entryMode,
      program,
      firstChoiceId,
    } = req.body;

    if (
      !name ||
      !email ||
      !phoneNumber ||
      !password ||
      !entryMode ||
      !program ||
      !firstChoiceId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, email, phoneNumber, password, entryMode, program, firstChoiceId",
      });
    }
    const chosenCourse = await prisma.course.findUnique({
      where: { id: firstChoiceId },
      select: { departmentId: true, facultyId: true },
    });
    if (!chosenCourse) {
      return res
        .status(400)
        .json({ success: false, message: "Selected course does not exist." });
    }

    // Validate entry mode
    if (!["utme", "direct_entry"].includes(entryMode.toLowerCase())) {
      logger.warn("invalid entryMode");

      return res.status(400).json({
        success: false,
        message: "Invalid entry mode. Must be UTME or DIRECT_ENTRY",
      });
    }

    const existingApplicant = await prisma.applicant.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }],
      },
    });
    console.log("this is the info from applicant: ", req.body);

    if (existingApplicant) {
      return res.status(400).json({
        message: "Applicant with this email or phone number already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const applicant = await prisma.applicant.create({
      data: {
        name,
        email,
        phoneNumber,
        entryMode: entryMode.toLowerCase(),
        program,
        firstChoice: { connect: { id: firstChoiceId } },
        password: hashedPassword,
        status: "draft",
        department: chosenCourse.departmentId
          ? { connect: { id: chosenCourse.departmentId } }
          : undefined,
        faculty: chosenCourse.facultyId
          ? { connect: { id: chosenCourse.facultyId } }
          : undefined,
        emergencyContacts: {
          create: req.body.emergencyContacts,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please complete your application.",
      data: {
        id: applicant.id,
        name: applicant.name,
        email: applicant.email,
        status: applicant.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit application (O'Level, JAMB, Course choices)
exports.submitApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { secondarySchool, oLevelResults, jamb, firstChoice, secondChoice } =
      req.body;
    if (
      !firstChoice ||
      typeof firstChoice !== "string" ||
      firstChoice.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid first choice course ID is required.",
      });
    }

    // Check if applicant exists
    const applicant = await prisma.applicant.findUnique({
      where: { id },
      include: {
        firstChoice: true,
        secondChoice: true,
      },
    });

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    // Validate course choices exist
    const firstChoiceCourse = await prisma.course.findUnique({
      where: { id: firstChoice },
      include: {
        department: true,
        faculty: true,
      },
    });

    if (!firstChoiceCourse) {
      return res.status(400).json({ message: "Invalid first choice course" });
    }
    let verifiedSecondChoiceId = null;
    if (
      secondChoice &&
      typeof secondChoice === "string" &&
      secondChoice.trim() !== ""
    ) {
      const secondChoiceCourse = await prisma.course.findUnique({
        where: { id: secondChoice },
      });
      if (!secondChoiceCourse) {
        return res.status(400).json({
          success: false,
          message: "The selected second choice course does not exist.",
        });
      }
      verifiedSecondChoiceId = secondChoice;
    }

    // Create O-Level results with subjects
    const oLevelResultsCreateData = (oLevelResults || []).map((result) => ({
      examType: result.examType,
      examNumber: result.examNumber || "",
      examYear: Number(result.examYear) || new Date().getFullYear(),
      uploadUrl: result.uploadUrl || null,
      subjects: {
        create: (result.subjects || []).map((subject) => ({
          name: subject.name,
          grade: subject.grade,
        })),
      },
    }));

    // Update applicant with application details
    const updatedApplicant = await prisma.applicant.update({
      where: { id },
      data: {
        secondarySchoolName: secondarySchool?.name,
        secondarySchoolYear: secondarySchool?.yearOfGraduation,
        secondarySchoolAddress: secondarySchool?.schoolAddress,

        jambRegistrationNumber: jamb?.registrationNumber,
        jambScore: jamb?.score,
        jambSubjectCombination: jamb?.subjectCombination || [],
        jambUploadUrl: jamb?.uploadUrl,

        firstChoiceId: firstChoice,
        secondChoiceId: verifiedSecondChoiceId || null,
        facultyId: firstChoiceCourse.facultyId,
        departmentId: firstChoiceCourse.departmentId,

        status: "submitted",
        submissionDate: new Date(),

        oLevelResults: {
          create: oLevelResultsCreateData,
        },
      },
      include: {
        firstChoice: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        faculty: true,
        department: true,
      },
    });

    res.json({
      success: true,
      message: "Application submitted successfully",
      data: {
        id: updatedApplicant.id,
        name: applicant.name,
        firstChoice: updatedApplicant.firstChoice?.title,
        status: updatedApplicant.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get applicant's application status
exports.getApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const applicant = await prisma.applicant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        status: true,
        program: true,
        submissionDate: true,
        rejectionReason: true,
        entryMode: true,
        firstChoice: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        secondChoice: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
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

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    res.json({
      success: true,
      data: {
        name: applicant.name,
        email: applicant.email,
        phoneNumber: applicant.phoneNumber,
        status: applicant.status,
        entryMode: applicant.entryMode,
        department: applicant.department,
        program: applicant.program,
        submissionDate: applicant.submissionDate,
        firstChoice: applicant.firstChoice,
        secondChoice: applicant.secondChoice,
        rejectionReason: applicant.rejectionReason,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all applicants
exports.getAllApplicants = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const applicants = await prisma.applicant.findMany({
      where,
      include: {
        firstChoice: {
          select: {
            department: true,
            id: true,
            title: true,
            code: true,
          },
        },
        secondChoice: {
          select: {
            department: true,
            id: true,
            title: true,
            code: true,
          },
        },
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

      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      count: applicants.length,
      data: applicants,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get single applicant with full details
exports.getSingleApplicant = async (req, res) => {
  try {
    const applicant = await prisma.applicant.findUnique({
      where: { id: req.params.id },
      include: {
        firstChoice: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        secondChoice: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
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
        oLevelResults: {
          include: {
            subjects: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            matricNumber: true,
          },
        },
      },
    });

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    res.json({
      success: true,
      data: applicant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, status, rejectionReason, remarks } = req.body;

    const applicant = await prisma.applicant.findUnique({
      where: { id },
      include: {
        faculty: true,
        department: true,
        firstChoice: {
          include: {
            department: true,
          },
        },
        secondChoice: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    let updatedApplicant;

    if (decision === "accept" && status === "accepted") {
      // Generate matric number
      const targetFacultyId =
        applicant.facultyId ||
        applicant.firstChoice?.facultyId ||
        applicant.firstChoice?.department?.facultyId;
      let finalFacultyId = targetFacultyId;
      if (!finalFacultyId) {
        const fallbackFaculty = await prisma.faculty.findFirst();
        if (!fallbackFaculty) {
          return res.status(400).json({
            success: false,
            message:
              "Admission failed: No faculties exist in the system database. Please seed your Faculty table.",
          });
        }
        finalFacultyId = fallbackFaculty.id;
      }
      const matricNumber = await generateMatric(finalFacultyId);

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Create student user account
      const student = await prisma.user.create({
        data: {
          name: applicant.name,
          email: applicant.email,
          phoneNumber: applicant.phoneNumber,
          password: hashedPassword,
          role: "student",
          facultyId: applicant.facultyId,
          departmentId: applicant.departmentId,
          level: 100,
          matricNumber: matricNumber,
          accountStatus: "active",
        },
      });

      updatedApplicant = await prisma.applicant.update({
        where: { id },
        data: {
          status: "admitted",
          reviewDate: new Date(),
          studentId: student.id,
        },
      });

      res.json({
        success: true,
        message: "Applicant accepted and promoted to student",
        data: {
          student: {
            id: student.id,
            name: student.name,
            email: student.email,
            matricNumber: student.matricNumber,
            tempPassword: tempPassword,
          },
          applicant: updatedApplicant,
        },
      });
    } else if (decision === "reject") {
      updatedApplicant = await prisma.applicant.update({
        where: { id },
        data: {
          status: "rejected",
          rejectionReason: rejectionReason,
          reviewDate: new Date(),
        },
      });

      res.json({
        success: true,
        message: "Application rejected",
        data: updatedApplicant,
      });
    } else if (decision === "under_review") {
      updatedApplicant = await prisma.applicant.update({
        where: { id },
        data: {
          status: "under_review",
          reviewDate: new Date(),
        },
      });

      res.json({
        success: true,
        message: "Application marked as under review",
        data: updatedApplicant,
      });
    } else if (decision === "reset") {
      updatedApplicant = await prisma.applicant.update({
        where: { id },
        data: {
          status: "submitted",
          rejectionReason: null,
          reviewDate: null,
        },
      });

      res.json({
        success: true,
        message: "Application reset to submitted",
        data: updatedApplicant,
      });
    } else {
      res.status(400).json({ message: "Invalid decision" });
    }
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get admission statistics
exports.getAdmissionStats = async (req, res) => {
  try {
    const stats = await prisma.applicant.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const total = await prisma.applicant.count();
    const formattedStats = stats.map((stat) => ({
      _id: stat.status,
      count: stat._count.status,
    }));

    res.json({
      success: true,
      data: {
        total,
        stats: formattedStats,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Additional helpful function: Get applicant by email
exports.getApplicantByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const applicant = await prisma.applicant.findUnique({
      where: { email },
      include: {
        firstChoice: true,
        secondChoice: true,
        oLevelResults: {
          include: {
            subjects: true,
          },
        },
      },
    });

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    res.json({
      success: true,
      data: applicant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update application (for draft status)
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const applicant = await prisma.applicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    if (applicant.status !== "draft") {
      return res.status(400).json({
        message: `Cannot update application with status: ${applicant.status}`,
      });
    }

    const updatedApplicant = await prisma.applicant.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    res.json({
      success: true,
      message: "Application updated successfully",
      data: updatedApplicant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
