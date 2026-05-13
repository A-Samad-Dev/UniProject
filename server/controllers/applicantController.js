// controllers/applicantController.js
const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const { generateMatric } = require("../services/matricServices");

exports.registerApplicant = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, entryMode } = req.body;

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
        entryMode,
        password: hashedPassword,
        role: "applicant",
        status: "draft",
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

    // Create O-Level results with subjects
    const oLevelResultsData = [];
    if (oLevelResults && oLevelResults.length > 0) {
      for (const result of oLevelResults) {
        const oLevelResult = await prisma.oLevelResult.create({
          data: {
            examType: result.examType,
            examNumber: result.examNumber,
            examYear: result.examYear,
            uploadUrl: result.uploadUrl,
            subjects: {
              create: result.subjects.map((subject) => ({
                name: subject.name,
                grade: subject.grade,
              })),
            },
          },
        });
        oLevelResultsData.push({ id: oLevelResult.id });
      }
    }

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
        secondChoiceId: secondChoice || null,
        facultyId: firstChoiceCourse.facultyId,
        departmentId: firstChoiceCourse.departmentId,

        status: "submitted",
        submissionDate: new Date(),

        oLevelResults: {
          connect: oLevelResultsData,
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
        name: updatedApplicant.name,
        firstChoice: updatedApplicant.firstChoice?.title,
        status: updatedApplicant.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
        status: true,
        submissionDate: true,
        rejectionReason: true,
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
          },
        },
        department: {
          select: {
            id: true,
            name: true,
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
        applicationStatus: applicant.status,
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
    const { status } = req.query; // Filter by status (submitted, under_review, etc.)

    const where = {};
    if (status) where.status = status;

    const applicants = await prisma.applicant.findMany({
      where,
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
    res.status(500).json({ message: error.message });
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

// Admin: Review and decide on application
exports.reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, rejectionReason, remarks } = req.body;

    const applicant = await prisma.applicant.findUnique({
      where: { id },
      include: {
        faculty: true,
        department: true,
        firstChoice: true,
      },
    });

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    if (applicant.status !== "submitted") {
      return res.status(400).json({
        message: `Cannot review application with status: ${applicant.status}`,
      });
    }

    if (decision === "accept") {
      // Generate matric number
      const facultyCode = applicant.faculty?.code || "GEN";
      const matricNumber = await generateMatric(facultyCode);

      // Generate temporary password (they can reset later)
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
          level: 100, // Fresh students start at 100 level
          matricNumber: matricNumber,
          accountStatus: "active",
        },
      });

      // Update applicant
      const updatedApplicant = await prisma.applicant.update({
        where: { id },
        data: {
          status: "admitted",
          reviewDate: new Date(),
          remarks: remarks,
          studentId: student.id,
        },
      });

      // TODO: Send email to applicant with admission letter and login details

      res.json({
        success: true,
        message: "Applicant accepted and promoted to student",
        data: {
          student: {
            id: student.id,
            name: student.name,
            email: student.email,
            matricNumber: student.matricNumber,
            tempPassword: tempPassword, // Only shown once
          },
          applicant: {
            id: updatedApplicant.id,
            status: "admitted",
          },
        },
      });
    } else if (decision === "reject") {
      // Reject application
      const updatedApplicant = await prisma.applicant.update({
        where: { id },
        data: {
          status: "rejected",
          rejectionReason: rejectionReason,
          reviewDate: new Date(),
        },
      });

      // TODO: Send rejection email to applicant

      res.json({
        success: true,
        message: "Application rejected",
        data: {
          id: updatedApplicant.id,
          status: "rejected",
          reason: rejectionReason,
        },
      });
    } else {
      // Mark as under review
      const updatedApplicant = await prisma.applicant.update({
        where: { id },
        data: {
          status: "under_review",
        },
      });

      res.json({
        success: true,
        message: "Application marked as under review",
      });
    }
  } catch (error) {
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

    // Format stats to match original structure
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
