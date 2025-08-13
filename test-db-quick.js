require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function test() {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL);
    const result = await sql`SELECT 1 as test, NOW() as timestamp`;
    console.log('✅ Database connection successful!');
    console.log('📊 Test result:', result[0]);
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return false;
  }
}

test();