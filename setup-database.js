#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const { neon } = require('@neondatabase/serverless');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Neon Database Setup for Prophet Growth Analysis');
console.log('==================================================');
console.log('');
console.log('Please get your connection string from:');
console.log('https://console.neon.tech/app/projects/holy-fog-47054548/branches');
console.log('');
console.log('1. Click on the DEVELOPMENT branch (br-frosty-lab-aemw8lf7)');
console.log('2. Click the "Connect" button');
console.log('3. Copy the connection string');
console.log('');

rl.question('📋 Paste your Neon connection string here: ', async (connectionString) => {
  if (!connectionString || !connectionString.startsWith('postgresql://')) {
    console.log('❌ Invalid connection string. Please try again.');
    rl.close();
    return;
  }

  console.log('');
  console.log('✅ Connection string received');
  console.log('🔄 Testing connection...');

  try {
    // Test the connection
    const sql = neon(connectionString);
    const result = await sql`SELECT 1 as test, NOW() as timestamp`;
    
    console.log('✅ Database connection successful!');
    console.log('📊 Test result:', result[0]);

    // Update .env.local file
    const envContent = `# Neon Database Connection - Development Branch
NEON_DATABASE_URL="${connectionString}"

# Authentication & Security  
JWT_SECRET=super-secret-jwt-key-for-development-minimum-32-characters-long
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
SESSION_SECRET=super-secret-session-key-for-development-minimum-32-chars
BCRYPT_ROUNDS=10

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Feature Flags
ENABLE_REGISTRATION=true
ENABLE_MOCK_DATA=true

# Optional Services (for future use)
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
`;

    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Updated .env.local file');

    console.log('');
    console.log('🔄 Running database migrations...');
    
    // Run migrations using the migration script
    const { execSync } = require('child_process');
    try {
      execSync('npm run migrate', { stdio: 'inherit' });
      console.log('');
      console.log('🎉 Database setup complete!');
      console.log('');
      console.log('Your database is now ready with all tables created:');
      console.log('- ✅ Organizations (multi-tenant support)');
      console.log('- ✅ Users (authentication & profiles)');
      console.log('- ✅ Projects (client work tracking)');
      console.log('- ✅ Payroll Data (raw import data)');
      console.log('- ✅ Employee Costs (aggregated metrics)');
      console.log('- ✅ Project Costs (cost summaries)');
      console.log('- ✅ Activity Logs (audit trail)');
      console.log('');
      console.log('🚀 You can now start development:');
      console.log('   npm run dev');
    } catch (error) {
      console.log('❌ Migration failed:', error.message);
      console.log('');
      console.log('You can try running migrations manually:');
      console.log('   npm run migrate');
    }

  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('');
    console.log('Please check your connection string and try again.');
  }

  rl.close();
});