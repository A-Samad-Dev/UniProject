// test-v7.js
require("dotenv").config();
const prisma = require("./lib/prisma");

async function test() {
  try {
    console.log("Testing Prisma v7 connection...");

    // Test connection
    await prisma.$connect();
    console.log("✅ Prisma connected successfully!");

    // Simple query
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log("📅 Database time:", result[0].current_time);

    // Check users table
    const userCount = await prisma.user.count();
    console.log(`👥 Number of users: ${userCount}`);

    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("adapter")) {
      console.log("Make sure @prisma/adapter-pg is installed");
    }
  } finally {
    await prisma.$disconnect();
  }
}

test();
