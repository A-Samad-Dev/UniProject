// test-simple.js
const { PrismaClient } = require('@prisma/client');

// Create instance with empty options (this should work)
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected successfully!');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT NOW() as now`;
    console.log('Database time:', result[0].now);
    
    // Count users
    const count = await prisma.user.count();
    console.log('User count:', count);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
