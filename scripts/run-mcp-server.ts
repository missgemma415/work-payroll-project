#!/usr/bin/env node
import { createMcpServer } from '../lib/agents/mcp/server';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Validate required environment variables
const requiredEnvVars = ['GOOGLE_GEMINI_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Start the server
const PORT = process.env['MCP_SERVER_PORT'] || 3001;
const server = createMcpServer();

server.listen(PORT, () => {
  console.log('\n🚀 MCP Financial Brain Server Started!');
  console.log('=====================================');
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log(`MCP Endpoint: http://localhost:${PORT}/mcp`);
  console.log('=====================================');
  console.log('\nAvailable MCP Tools:');
  console.log('- analyze_costs: Deep analysis of employee costs');
  console.log('- generate_insights: Generate financial insights');
  console.log('- answer_questions: Natural language Q&A');
  console.log('\nPress Ctrl+C to stop the server\n');
});