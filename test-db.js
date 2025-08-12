require('dotenv').config({ path: '.env.local' });

const { neon } = require('@neondatabase/serverless');

async function testConnection() {
  try {
    const url = process.env.NEON_DATABASE_URL;
    console.log('Using URL:', url ? 'URL found' : 'URL missing');
    
    if (!url) {
      console.log('❌ NEON_DATABASE_URL not found in environment');
      return false;
    }
    
    const sql = neon(url);
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful!');
    console.log('Test result:', result);
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

testConnection().then(success => {
  console.log('DB Connection:', success ? '✅ Success' : '❌ Failed');
  process.exit(success ? 0 : 1);
});