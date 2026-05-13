// services/staffIdServices.js
const prisma = require("../lib/prisma");

const generateStaffId = async (role, departmentCode = null) => {
  const year = new Date().getFullYear();
  let prefix = "";

  // Set prefix based on role
  switch (role) {
    case "lecturer":
      prefix = "LEC";
      break;
    case "department_head":
      prefix = "HOD";
      break;
    case "faculty_head":
      prefix = "DEAN";
      break;
    case "admin":
      prefix = "ADM";
      break;
    default:
      prefix = "STAFF";
  }

  // Add department code if provided
  const deptCode = departmentCode ? `-${departmentCode}` : "";

  // Get counter for this staff type and year
  const counter = await prisma.counter.upsert({
    where: {
      facultyCode_year: {
        facultyCode: `${prefix}${deptCode}`,
        year: year,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      facultyCode: `${prefix}${deptCode}`,
      year: year,
      count: 1,
    },
  });

  // Format: LEC-CSC/2026/0042
  const staffId = `${prefix}${deptCode}/${year}/${counter.count.toString().padStart(4, "0")}`;
  return staffId;
};

module.exports = { generateStaffId };
