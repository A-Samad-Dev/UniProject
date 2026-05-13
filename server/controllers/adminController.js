// controllers/adminController.js
const prisma = require("../lib/prisma");
const { generateMatric } = require("../services/matricServices");
const bcrypt = require("bcryptjs");
const { generateStaffId } = require("../services/staffIdServices");

exports.createLecturer = async (req, res) => {
  try {
    const {
      nameTitle,
      name,
      email,
      phoneNumber,
      password,
      facultyId,
      departmentId,
      specialization,
      employeeId,
    } = req.body;

    if (
      !name ||
      !nameTitle ||
      !email ||
      !phoneNumber ||
      !password ||
      !departmentId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, nameTitle, email, phoneNumber, password, departmentId",
      });
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: { faculty: true },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Generate employee ID if not provided
    const employeeIdNumber = await generateStaffId("lecturer", department.code);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create lecturer
    const lecturer = await prisma.user.create({
      data: {
        nameTitle,
        name,
        email: email.toLowerCase(),
        phoneNumber,
        password: hashedPassword,
        role: "lecturer",
        facultyId: department.facultyId,
        departmentId: departmentId,
        accountStatus: "active",
        employeeId: employeeIdNumber,
        specialization: specialization || null,
        hireDate: new Date(),
      },
      include: {
        faculty: {
          select: { id: true, name: true, code: true },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    const { password: _, ...lecturerWithoutPassword } = lecturer;

    res.status(201).json({
      success: true,
      message: "Lecturer created successfully",
      data: lecturerWithoutPassword,
    });
  } catch (error) {
    console.error("Create lecturer error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== CREATE DEPARTMENT HEAD ==========
exports.createDepartmentHead = async (req, res) => {
  try {
    const { nameTitle, name, email, phoneNumber, password, departmentId } =
      req.body;

    // Validate
    if (
      !name ||
      !nameTitle ||
      !email ||
      !phoneNumber ||
      !password ||
      !departmentId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: { faculty: true },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Check if department already has a head
    if (department.departmentHeadId) {
      return res.status(400).json({
        success: false,
        message: "Department already has a head. Remove current head first.",
      });
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create department head
    const deptHead = await prisma.user.create({
      data: {
        nameTitle,
        name,
        email: email.toLowerCase(),
        phoneNumber,
        password: hashedPassword,
        role: "department_head",
        facultyId: department.facultyId,
        departmentId: departmentId,
        accountStatus: "active",
      },
      include: {
        faculty: true,
        department: true,
      },
    });

    // Update department with head
    await prisma.department.update({
      where: { id: departmentId },
      data: { departmentHeadId: deptHead.id },
    });

    const { password: _, ...deptHeadWithoutPassword } = deptHead;

    res.status(201).json({
      success: true,
      message: "Department head created successfully",
      data: deptHeadWithoutPassword,
    });
  } catch (error) {
    console.error("Create department head error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== CREATE FACULTY HEAD ==========
exports.createFacultyHead = async (req, res) => {
  try {
    const { name, nameTitle, email, phoneNumber, password, facultyId } =
      req.body;

    if (
      !name ||
      !nameTitle ||
      !email ||
      !phoneNumber ||
      !password ||
      !facultyId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if faculty exists
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    // Check if faculty already has a head
    if (faculty.facultyHeadId) {
      return res.status(400).json({
        success: false,
        message: "Faculty already has a head. Remove current head first.",
      });
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create faculty head
    const facultyHead = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phoneNumber,
        password: hashedPassword,
        role: "faculty_head",
        facultyId: facultyId,
        accountStatus: "active",
      },
      include: {
        faculty: true,
      },
    });

    // Update faculty with head
    await prisma.faculty.update({
      where: { id: facultyId },
      data: { facultyHeadId: facultyHead.id },
    });

    const { password: _, ...facultyHeadWithoutPassword } = facultyHead;

    res.status(201).json({
      success: true,
      message: "Faculty head created successfully",
      data: facultyHeadWithoutPassword,
    });
  } catch (error) {
    console.error("Create faculty head error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== CREATE ADMIN USER ==========
exports.createAdmin = async (req, res) => {
  console.log("Received Request from client: ", req.body);

  try {
    const { name, email, phoneNumber, password } = req.body;

    // Validate
    if (!name || !email || !phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if email exists

    // const existingUser = await prisma.user.findUnique({
    //   where: { email: email.toLowerCase() },
    // });
    // console.log("No user with that email found");

    // if (existingUser) {
    //   console.log("This is existing user: ", existingUser);
    //   return res.status(400).json({
    //     success: false,
    //     message: "Email already exists",
    //   });
    // }

    // console.log("No user with that email found")
    // console.log()

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // console.log("The hashedpassword: ", hashedPassword)
    // Create admin
    const admin = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phoneNumber,
        password: hashedPassword,
        role: "admin",
        permissions: ["all"],
        accountStatus: "active",
      },
    });

    const { password: _, ...adminWithoutPassword } = admin;

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      data: adminWithoutPassword,
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== GET ALL LECTURERS ==========
exports.getAllLecturers = async (req, res) => {
  try {
    const lecturers = await prisma.user.findMany({
      where: { role: "lecturer" },
      include: {
        faculty: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: lecturers.length,
      data: lecturers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== GET ALL DEPARTMENT HEADS ==========
exports.getAllDepartmentHeads = async (req, res) => {
  try {
    const deptHeads = await prisma.user.findMany({
      where: { role: "department_head" },
      include: {
        faculty: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    });

    res.json({
      success: true,
      count: deptHeads.length,
      data: deptHeads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== GET ALL FACULTY HEADS ==========
exports.getAllFacultyHeads = async (req, res) => {
  try {
    const facultyHeads = await prisma.user.findMany({
      where: { role: "faculty_head" },
      include: {
        faculty: { select: { id: true, name: true, code: true } },
      },
    });

    res.json({
      success: true,
      count: facultyHeads.length,
      data: facultyHeads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createCourse = async (req, res) => {
  try {
     const { title, code, unit, level, semester, departmentId, headLecturerId } = req.body
     if (!title || !code || !unit || !level || !semester || !departmentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    const course = await prisma.course.create({
      data: {
        title, 
        code,
        unit,
        level,
        semester,
        departmentId,
        headLecturerId
      },
      include: {
        department: true,
        headLecturer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(course);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createFaculty = async (req, res) => {
  try {
    const faculty = await prisma.faculty.create({
      data: {
        name: req.body.name,
        code: req.body.code,
        facultyHeadId: req.body.facultyHeadId,
      },
      include: {
        facultyHead: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(faculty);

    res.status(201).json({
      success: true,
      message: "Faculty created successfully",
      data: faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const department = await prisma.department.create({
      data: {
        name: req.body.name,
        code: req.body.code,
        facultyId: req.body.facultyId,
        departmentHeadId: req.body.departmentHeadId,
      },
      include: {
        faculty: true,
        departmentHead: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: {
        role: "student",
      },
      include: {
        faculty: true,
        department: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        role: "student",
      },
      include: {
        faculty: true,
        department: true,
        registrations: {
          include: {
            courses: {
              include: {
                course: true,
              },
            },
          },
        },
        results: {
          include: {
            course: true,
            scores: true,
          },
        },
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
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await prisma.course.update({
      where: {
        id: req.params.id,
      },
      data: {
        title: req.body.title,
        code: req.body.code,
        unit: req.body.unit,
        level: req.body.level,
        semester: req.body.semester,
        departmentId: req.body.departmentId,
        headLecturerId: req.body.headLecturerId,
      },
      include: {
        department: true,
        headLecturer: true,
      },
    });

    res.json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await prisma.course.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== GET ALL STUDENTS IN A FACULTY ==========
exports.getStudentsByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const requestingUser = req.user;

    // Verify faculty exists
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: {
        departments: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    // AUTHORIZATION CHECK
    let isAuthorized = false;

    // Super admin and admin have full access
    if (
      requestingUser.role === "super_admin" ||
      requestingUser.role === "admin"
    ) {
      isAuthorized = true;
    }
    // Faculty head can only access their own faculty
    else if (requestingUser.role === "faculty_head") {
      if (requestingUser.facultyId === facultyId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You don't have permission to view students in this faculty.",
      });
    }

    // Get all students in the faculty
    const students = await prisma.user.findMany({
      where: {
        role: "student",
        facultyId: facultyId,
      },
      select: {
        id: true,
        nameTitle: true,
        name: true,
        email: true,
        phoneNumber: true,
        matricNumber: true,
        level: true,
        accountStatus: true,
        createdAt: true,
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

    // Get statistics
    const totalStudents = students.length;
    const studentsByLevel = {};
    const studentsByDepartment = {};

    students.forEach((student) => {
      // Count by level
      if (student.level) {
        studentsByLevel[student.level] =
          (studentsByLevel[student.level] || 0) + 1;
      }

      // Count by department
      if (student.department) {
        const deptName = student.department.name;
        studentsByDepartment[deptName] =
          (studentsByDepartment[deptName] || 0) + 1;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        faculty: {
          id: faculty.id,
          name: faculty.name,
          code: faculty.code,
          departments: faculty.departments,
        },
        statistics: {
          totalStudents,
          studentsByLevel,
          studentsByDepartment,
        },
        students,
      },
    });
  } catch (error) {
    console.error("Get students by faculty error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== GET ALL STUDENTS IN A DEPARTMENT ==========
exports.getStudentsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const requestingUser = req.user;

    // Verify department exists with faculty info
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // AUTHORIZATION CHECK
    let isAuthorized = false;

    // Super admin and admin have full access
    if (
      requestingUser.role === "super_admin" ||
      requestingUser.role === "admin"
    ) {
      isAuthorized = true;
    }
    // Faculty head can access departments in their faculty
    else if (requestingUser.role === "faculty_head") {
      if (requestingUser.facultyId === department.facultyId) {
        isAuthorized = true;
      }
    }
    // Department head can only access their own department
    else if (requestingUser.role === "department_head") {
      if (requestingUser.departmentId === departmentId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You don't have permission to view students in this department.",
      });
    }

    // Get all students in the department
    const students = await prisma.user.findMany({
      where: {
        role: "student",
        departmentId: departmentId,
      },
      select: {
        id: true,
        nameTitle: true,
        name: true,
        email: true,
        phoneNumber: true,
        matricNumber: true,
        level: true,
        accountStatus: true,
        createdAt: true,
        faculty: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        level: "asc",
        name: "asc",
      },
    });

    // Get statistics
    const totalStudents = students.length;
    const studentsByLevel = {};
    const activeStudents = students.filter(
      (s) => s.accountStatus === "active",
    ).length;
    const inactiveStudents = students.filter(
      (s) => s.accountStatus !== "active",
    ).length;

    students.forEach((student) => {
      if (student.level) {
        studentsByLevel[student.level] =
          (studentsByLevel[student.level] || 0) + 1;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        department: {
          id: department.id,
          name: department.name,
          code: department.code,
          faculty: department.faculty,
        },
        statistics: {
          totalStudents,
          activeStudents,
          inactiveStudents,
          studentsByLevel,
        },
        students,
      },
    });
  } catch (error) {
    console.error("Get students by department error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
