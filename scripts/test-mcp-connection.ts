#!/usr/bin/env tsx
import { McpClient } from '../lib/agents/mcp/client';

async function testConnection() {
  console.log('Testing MCP Server Connection...\n');
  
  const client = new McpClient({
    name: 'test-client',
    version: '1.0.0',
    serverUrl: process.env['NEXT_PUBLIC_MCP_SERVER_URL'] || 'http://localhost:3001/mcp',
  });

  try {
    // Test connection
    console.log('1. Connecting to MCP server...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // List available tools
    console.log('2. Listing available tools...');
    const tools = await client.listTools();
    console.log(`✅ Found ${tools.length} tools:`);
    tools.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });
    console.log();

    // Test a simple question
    console.log('3. Testing question answering...');
    const answer = await client.answerQuestion({
      question: 'What is the typical benefits multiplier for tech companies?',
    });
    console.log('✅ Response received:');
    console.log(answer);
    console.log();

    // Disconnect
    console.log('4. Disconnecting...');
    await client.disconnect();
    console.log('✅ Disconnected successfully!');
    
    console.log('\n🎉 All tests passed! MCP server is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testConnection().catch(console.error);