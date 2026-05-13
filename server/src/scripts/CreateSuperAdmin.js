require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PERMISSIONS } = require("../config/permissions");
const prisma = require("../../lib/prisma");
const { logger } = require("../config/logger");

async function createSuperAdmin() {
  try {
    console.log("🚀 Starting Super Admin creation...");

    const superAdminData = {
      nameTitle: "Mr.",
      name: "OLOKO SAMAD",
      email: "olokoadesola1@gmail.com",
      phoneNumber: "07051443210",
      password: "SuperAdmin@123456",
      role: "super_admin",
      accountStatus: "active",
      permissions: [PERMISSIONS.ALL],
      employeeId: `SUPERADMIN${Date.now()}`,
    };

    console.log("📝 Password to hash:", superAdminData.password);

    // Check if super admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: superAdminData.email },
          { permissions: { has: PERMISSIONS.ALL } },
        ],
      },
    });

    if (existingAdmin) {
      console.log("⚠️  Super Admin already exists!");
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      console.log(`Permissions: ${existingAdmin.permissions}`);

      // Ask if they want to update
      // Replace the readline section with:
      const answer = await new Promise((resolve) => {
        const readline = require("readline").createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        readline.question(
          "Do you want to update the super admin password? (y/n): ",
          (answer) => {
            readline.close();
            resolve(answer);
          },
        );
      });

      if (answer.toLowerCase() === "y") {
        try {
          const hashedPassword = await bcrypt.hash(superAdminData.password, 10);
          await prisma.user.update({
            where: { id: existingAdmin.id },
            data: { password: hashedPassword },
          });
          console.log("✅ Super Admin password updated!");
        } catch (error) {
          console.error("❌ Error updating password:", error.message);
        }
      }

      return;
    }

    // Hash password
    console.log("🔄 Hashing password...");
    const hashedPassword = await bcrypt.hash(superAdminData.password, 10);
    console.log("✅ Password hashed successfully");

    // Create super admin
    const superAdmin = await prisma.user.create({
      data: {
        ...superAdminData,
        password: hashedPassword,
      },
    });

    // Remove password from output
    const { password, ...superAdminWithoutPassword } = superAdmin;

    console.log("✅ Super Admin created successfully!");
    console.log("📋 Super Admin Details:");
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Name: ${superAdmin.name}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Phone: ${superAdmin.phoneNumber}`);
    console.log(`   Role: ${superAdmin.role}`);
    console.log(`   Permissions: ${superAdmin.permissions.join(", ")}`);
    console.log("\n⚠️  IMPORTANT: Save these credentials:");
    console.log(`   Email: ${superAdminData.email}`);
    console.log(`   Password: ${superAdminData.password}`);
    console.log("\n💡 You can now login with these credentials");

    // Log to file
    logger.info("Super Admin created", {
      adminId: superAdmin.id,
      email: superAdmin.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error creating Super Admin:", error.message);
    logger.error("Failed to create Super Admin", { error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  createSuperAdmin();
}

module.exports = { createSuperAdmin };
