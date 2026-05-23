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
    const { title, code, unit, level, semester, departmentId, headLecturerId } =
      req.body;
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
        headLecturerId,
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
    const { name, code, facultyId, departmentHeadId } = req.body;
    if (!name || !code || !facultyId) {
      return res.status(400).json({
        success: false,
        message: "Name, code, and facultyId are required fields.",
      });
    }

    let assignedHeadId = null;
    if (departmentHeadId && departmentHeadId.trim() !== "") {
      // Confirm this user actually exists in your User database
      const existingUser = await prisma.user.findUnique({
        where: { id: departmentHeadId },
      });

      if (!existingUser) {
        return res.status(400).json({
          success: false,
          message:
            "The selected Department Head user does not exist in the system.",
        });
      }
      assignedHeadId = departmentHeadId;
    }

    const department = await prisma.department.create({
      data: {
        name,
        code: code.toUpperCase(),
        facultyId,
        departmentHeadId: assignedHeadId,
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

// ========== GET ALL FACULTIES ==========
exports.getAllFaculties = async (req, res) => {
  try {
    const faculties = await prisma.faculty.findMany({
      include: {
        facultyHead: {
          select: {
            id: true,
            name: true,
            nameTitle: true,
            email: true,
            phoneNumber: true,
          },
        },
        departments: {
          select: {
            id: true,
            name: true,
            code: true,
            departmentHeadId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get statistics for each faculty
    const facultiesWithStats = faculties.map((faculty) => ({
      ...faculty,
      statistics: {
        totalDepartments: faculty.departments.length,
        totalStudents: 0, // You can add a separate query to count students if needed
      },
    }));

    res.status(200).json({
      success: true,
      count: faculties.length,
      data: facultiesWithStats,
    });
  } catch (error) {
    console.error("Get all faculties error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== GET ALL DEPARTMENTS ==========
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        departmentHead: {
          select: {
            id: true,
            name: true,
            nameTitle: true,
            email: true,
            phoneNumber: true,
          },
        },
        courses: {
          select: {
            id: true,
            code: true,
            title: true,
            unit: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get statistics for each department
    const departmentsWithStats = departments.map((department) => ({
      ...department,
      statistics: {
        totalCourses: department.courses.length,
        totalStudents: 0, // You can add a separate query to count students if needed
      },
    }));

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departmentsWithStats,
    });
  } catch (error) {
    console.error("Get all departments error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== GET FACULTY BY ID ==========
exports.getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await prisma.faculty.findUnique({
      where: { id },
      include: {
        facultyHead: {
          select: {
            id: true,
            name: true,
            nameTitle: true,
            email: true,
            phoneNumber: true,
          },
        },
        departments: {
          include: {
            departmentHead: {
              select: {
                id: true,
                name: true,
                nameTitle: true,
                email: true,
              },
            },
            courses: {
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

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    // Get student count for this faculty
    const studentCount = await prisma.user.count({
      where: {
        role: "student",
        facultyId: id,
      },
    });

    const facultyWithStats = {
      ...faculty,
      statistics: {
        totalDepartments: faculty.departments.length,
        totalStudents: studentCount,
        totalCourses: faculty.departments.reduce(
          (total, dept) => total + dept.courses.length,
          0,
        ),
      },
    };

    res.status(200).json({
      success: true,
      data: facultyWithStats,
    });
  } catch (error) {
    console.error("Get faculty by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== GET DEPARTMENT BY ID ==========
exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            code: true,
            facultyHeadId: true,
          },
        },
        departmentHead: {
          select: {
            id: true,
            name: true,
            nameTitle: true,
            email: true,
            phoneNumber: true,
          },
        },
        courses: {
          orderBy: {
            code: "asc",
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

    // Get student count and statistics for this department
    const students = await prisma.user.findMany({
      where: {
        role: "student",
        departmentId: id,
      },
      select: {
        level: true,
        accountStatus: true,
      },
    });

    const studentCount = students.length;
    const activeStudents = students.filter(
      (s) => s.accountStatus === "active",
    ).length;
    const studentsByLevel = {};

    students.forEach((student) => {
      if (student.level) {
        studentsByLevel[student.level] =
          (studentsByLevel[student.level] || 0) + 1;
      }
    });

    const departmentWithStats = {
      ...department,
      statistics: {
        totalStudents: studentCount,
        activeStudents,
        inactiveStudents: studentCount - activeStudents,
        totalCourses: department.courses.length,
        studentsByLevel,
      },
    };

    res.status(200).json({
      success: true,
      data: departmentWithStats,
    });
  } catch (error) {
    console.error("Get department by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== USER MANAGEMENT CONTROLLERS ==========

// GET ALL USERS (with filtering)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 50 } = req.query;

    // Build filter
    const filter = {};
    if (role && role !== "all") filter.role = role;
    if (status) filter.accountStatus = status;
    if (search) {
      filter.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { matricNumber: { contains: search, mode: "insensitive" } },
        { employeeId: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: filter,
        include: {
          faculty: { select: { id: true, name: true, code: true } },
          department: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.user.count({ where: filter }),
    ]);

    // Remove passwords
    const usersWithoutPassword = users.map(({ password, ...user }) => user);

    res.status(200).json({
      success: true,
      data: usersWithoutPassword,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        faculty: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
        // For students, include registrations and results
        registrations: {
          include: {
            courses: {
              include: { course: true },
            },
          },
        },
        results: {
          include: {
            course: true,
            scores: true,
          },
        },
        // For lecturers, include courses they teach
        teachingCourses: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nameTitle,
      name,
      email,
      phoneNumber,
      role,
      facultyId,
      departmentId,
      level,
      specialization,
      accountStatus,
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check email uniqueness if changing
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        nameTitle: nameTitle || existingUser.nameTitle,
        name: name || existingUser.name,
        email: email ? email.toLowerCase() : existingUser.email,
        phoneNumber: phoneNumber || existingUser.phoneNumber,
        role: role || existingUser.role,
        facultyId: facultyId || existingUser.facultyId,
        departmentId:
          departmentId !== undefined ? departmentId : existingUser.departmentId,
        level: level !== undefined ? level : existingUser.level,
        specialization:
          specialization !== undefined
            ? specialization
            : existingUser.specialization,
        accountStatus: accountStatus || existingUser.accountStatus,
      },
      include: {
        faculty: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting super admin
    if (user.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete super admin user",
      });
    }

    // If deleting department head, remove reference from department
    if (user.role === "department_head") {
      await prisma.department.updateMany({
        where: { departmentHeadId: id },
        data: { departmentHeadId: null },
      });
    }

    // If deleting faculty head, remove reference from faculty
    if (user.role === "faculty_head") {
      await prisma.faculty.updateMany({
        where: { facultyHeadId: id },
        data: { facultyHeadId: null },
      });
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE USER STATUS (activate/deactivate)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      !status ||
      !["active", "inactive", "graduated", "blocked"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be active, inactive, blocked or graduated",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { accountStatus: status },
      include: {
        faculty: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    // 1. Add 'program' to the accepted query parameters
    const { departmentId, level, semester, search, program } = req.query;

    const filter = {};
    if (departmentId) filter.departmentId = departmentId;
    if (level) filter.level = parseInt(level);
    if (semester) filter.semester = semester;

    if (program) filter.program = program;

    if (search) {
      filter.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const courses = await prisma.course.findMany({
      where: filter,
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        headLecturer: {
          select: {
            id: true,
            name: true,
            nameTitle: true,
            email: true,
          },
        },
        registrations: {
          select: {
            studentId: true,
          },
        },
      },
      orderBy: { code: "asc" },
    });

    const coursesWithStats = courses.map((course) => ({
      ...course,
      studentCount: course.registrations?.length || 0,
    }));

    res.status(200).json({
      success: true,
      count: courses.length,
      data: coursesWithStats,
    });
  } catch (error) {
    console.error("Get all courses error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET COURSE BY ID
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        headLecturer: {
          select: {
            id: true,
            name: true,
            nameTitle: true,
            email: true,
            phoneNumber: true,
          },
        },
        registrations: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                nameTitle: true,
                matricNumber: true,
                level: true,
              },
            },
          },
        },
        results: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                matricNumber: true,
              },
            },
            scores: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...course,
        registeredStudents: course.registrations?.length || 0,
      },
    });
  } catch (error) {
    console.error("Get course by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE DEPARTMENT
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, facultyId, departmentHeadId } = req.body;

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id },
    });

    if (!existingDepartment) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Check if faculty exists if being changed
    if (facultyId && facultyId !== existingDepartment.facultyId) {
      const faculty = await prisma.faculty.findUnique({
        where: { id: facultyId },
      });
      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: "Faculty not found",
        });
      }
    }

    // Check if department head exists if being set
    if (departmentHeadId) {
      const head = await prisma.user.findFirst({
        where: {
          id: departmentHeadId,
          role: { in: ["department_head", "lecturer"] },
        },
      });
      if (!head) {
        return res.status(404).json({
          success: false,
          message:
            "Department head not found (must be lecturer or department_head)",
        });
      }
    }

    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        name: name || existingDepartment.name,
        code: code || existingDepartment.code,
        facultyId: facultyId || existingDepartment.facultyId,
        departmentHeadId:
          departmentHeadId !== undefined
            ? departmentHeadId
            : existingDepartment.departmentHeadId,
      },
      include: {
        faculty: true,
        departmentHead: {
          select: { id: true, name: true, email: true, nameTitle: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: updatedDepartment,
    });
  } catch (error) {
    console.error("Update department error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE DEPARTMENT
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        courses: true,
        users: {
          where: { role: "student" },
          select: { id: true },
        },
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Check if department has students
    if (department.users.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${department.users.length} students. Transfer or delete students first.`,
      });
    }

    // Check if department has courses
    if (department.courses.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${department.courses.length} courses. Delete or transfer courses first.`,
      });
    }

    // Remove department head reference
    if (department.departmentHeadId) {
      await prisma.department.update({
        where: { id },
        data: { departmentHeadId: null },
      });
    }

    // Delete department
    await prisma.department.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Delete department error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== FACULTY MANAGEMENT CONTROLLERS (additional) ==========

// UPDATE FACULTY
exports.updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, facultyHeadId } = req.body;

    // Check if faculty exists
    const existingFaculty = await prisma.faculty.findUnique({
      where: { id },
    });

    if (!existingFaculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    // Check if faculty head exists if being set
    if (facultyHeadId) {
      const head = await prisma.user.findFirst({
        where: {
          id: facultyHeadId,
          role: { in: ["faculty_head", "lecturer"] },
        },
      });
      if (!head) {
        return res.status(404).json({
          success: false,
          message: "Faculty head not found (must be lecturer or faculty_head)",
        });
      }
    }

    const updatedFaculty = await prisma.faculty.update({
      where: { id },
      data: {
        name: name || existingFaculty.name,
        code: code || existingFaculty.code,
        facultyHeadId:
          facultyHeadId !== undefined
            ? facultyHeadId
            : existingFaculty.facultyHeadId,
      },
      include: {
        facultyHead: {
          select: { id: true, name: true, email: true, nameTitle: true },
        },
        departments: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Faculty updated successfully",
      data: updatedFaculty,
    });
  } catch (error) {
    console.error("Update faculty error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE FACULTY
exports.deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if faculty exists
    const faculty = await prisma.faculty.findUnique({
      where: { id },
      include: {
        departments: {
          include: {
            users: {
              where: { role: "student" },
              select: { id: true },
            },
            courses: true,
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

    // Check if faculty has departments with students or courses
    let hasStudents = false;
    let hasCourses = false;
    let departmentCount = 0;

    for (const dept of faculty.departments) {
      departmentCount++;
      if (dept.users.length > 0) hasStudents = true;
      if (dept.courses.length > 0) hasCourses = true;
    }

    if (hasStudents) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete faculty with students. Transfer or delete students first.",
      });
    }

    if (hasCourses) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete faculty with courses. Delete or transfer courses first.",
      });
    }

    if (departmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete faculty with ${departmentCount} departments. Delete departments first.`,
      });
    }

    // Remove faculty head reference
    if (faculty.facultyHeadId) {
      await prisma.faculty.update({
        where: { id },
        data: { facultyHeadId: null },
      });
    }

    // Delete faculty
    await prisma.faculty.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Faculty deleted successfully",
    });
  } catch (error) {
    console.error("Delete faculty error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET DEPARTMENT COURSES (for department head)
exports.getDepartmentCourses = async (req, res) => {
  try {
    const user = req.user;

    let departmentId;

    if (user.role === "department_head") {
      departmentId = user.departmentId;
    } else if (user.role === "admin" || user.role === "super_admin") {
      departmentId = req.query.departmentId;
      if (!departmentId) {
        return res.status(400).json({
          success: false,
          message: "departmentId query parameter is required for admin",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const courses = await prisma.course.findMany({
      where: { departmentId },
      include: {
        headLecturer: {
          select: {
            id: true,
            name: true,
            nameTitle: true,
            email: true,
          },
        },
        registrations: {
          select: {
            studentId: true,
          },
        },
      },
      orderBy: { code: "asc" },
    });

    const coursesWithStats = courses.map((course) => ({
      ...course,
      studentCount: course.registrations?.length || 0,
      registrations: undefined,
    }));

    res.status(200).json({
      success: true,
      data: coursesWithStats,
    });
  } catch (error) {
    console.error("Get department courses error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET FACULTY DEPARTMENTS (for faculty head)
exports.getFacultyDepartments = async (req, res) => {
  try {
    const user = req.user;

    let facultyId;

    if (user.role === "faculty_head") {
      facultyId = user.facultyId;
    } else if (user.role === "admin" || user.role === "super_admin") {
      facultyId = req.query.facultyId;
      if (!facultyId) {
        return res.status(400).json({
          success: false,
          message: "facultyId query parameter is required for admin",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const departments = await prisma.department.findMany({
      where: { facultyId },
      include: {
        departmentHead: {
          select: {
            id: true,
            name: true,
            nameTitle: true,
            email: true,
          },
        },
        courses: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
        _count: {
          select: {
            users: {
              where: { role: "student" },
            },
            courses: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const departmentsWithStats = departments.map((dept) => ({
      ...dept,
      studentCount: dept._count.users,
      courseCount: dept._count.courses,
      _count: undefined,
    }));

    res.status(200).json({
      success: true,
      data: departmentsWithStats,
    });
  } catch (error) {
    console.error("Get faculty departments error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== GET ALL ADMINS (INCLUDING SUPER ADMINS) ==========
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ["admin", "super_admin"],
        },
      },
      select: {
        id: true,
        name: true,
        nameTitle: true,
        email: true,
        phoneNumber: true,
        role: true,
        permissions: true,
        accountStatus: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    console.error("Get all admins error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== GET ADMIN BY ID ==========
exports.getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await prisma.user.findFirst({
      where: {
        id: id,
        role: {
          in: ["admin", "super_admin"],
        },
      },
      select: {
        id: true,
        name: true,
        nameTitle: true,
        email: true,
        phoneNumber: true,
        role: true,
        permissions: true,
        accountStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error("Get admin by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
