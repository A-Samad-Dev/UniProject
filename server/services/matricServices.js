const prisma = require("../lib/prisma");

exports.generateMatric = async (facultyId) => {
  const year = new Date().getFullYear();

  // 1. Fetch faculty from Prisma using findUnique or findFirst
  const faculty = await prisma.faculty.findUnique({
    where: { id: facultyId },
  });

  if (!faculty) {
    throw new Error("Faculty not found");
  }
  
  let facultyCode = faculty.code.toUpperCase();

  const validFaculties = ["SCI", "ENG", "ART", "MGT", "EDU", "LAW", "MED", "SOS"];
  if (!validFaculties.includes(facultyCode)) {
    throw new Error(`Invalid faculty code: ${facultyCode}`);
  }

  // 2. Manage counter table atomically using Prisma's upsert method
  // This increments safely and avoids duplicate number collisions
  const counter = await prisma.counter.upsert({
    where: {
      // Assumes your schema has a unique composite index @@unique([facultyCode, year])
      facultyCode_year: { 
        facultyCode,
        year
      }
    },
    update: {
      count: { increment: 1 }
    },
    create: {
      facultyCode,
      year,
      count: 1
    }
  });

  // 3. Extract the updated sequential position tracker
  const serialNumber = String(counter.count).padStart(5, "0");

  return `${facultyCode}/${year}/${serialNumber}`;
};
