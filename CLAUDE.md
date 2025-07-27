# CLAUDE.md - Project Guidelines and Instructions

## Core Principles

- **Zero-tolerance policy for TypeScript and ESLint errors going forward!**
- Enterprise-grade code quality standards
- Security-first approach
- Clean, maintainable code
- AI-first architecture with Cloudflare Agents

## Project Overview

**Prophet Growth Analysis** is an AI-powered financial intelligence platform that leverages Cloudflare Agents and Google Gemini to provide autonomous financial operations, real-time cost analysis, and predictive forecasting for employee costs and workforce planning.

## Project Workflow Guidelines

- Always start with claude.md file then read projectcontextengineering.md next and the next is projecttasks.md in that order every time asked to review project or opens the project for first time

## Architecture Overview

### Cloudflare Agents Architecture

We use Cloudflare's cutting-edge Agent technology for:

- **Stateful AI Microservices**: Autonomous agents that maintain context across sessions
- **Real-time Communication**: WebSocket support for live updates
- **Persistent Memory**: SQL database built into each agent
- **Multi-Agent Coordination**: Agents work together for complex analyses

### Key Technologies

1. **Cloudflare Agents SDK**
   - McpAgent base class for stateful agents
   - Durable Objects for persistence
   - WebSocket hibernation for efficiency

2. **Model Context Protocol (MCP)**
   - Standardized AI-to-service communication
   - OAuth-based security
   - Tool discovery and execution

3. **Google Gemini API**
   - Natural language processing
   - Financial insights generation
   - Conversational AI interface

4. **Prophet/Neural Prophet**
   - Time series forecasting
   - Seasonal pattern detection
   - Cost prediction modeling

## Agent Network

### Core Agents

1. **Financial Brain Agent**
   - Gemini-powered analysis
   - Cost optimization suggestions
   - Context-aware conversations

2. **Forecast Engine Agent**
   - Prophet integration
   - Historical trend analysis
   - Predictive modeling

3. **Scenario Planner Agent**
   - What-if simulations
   - Multi-variable analysis
   - Collaborative planning

4. **Alert Monitor Agent**
   - Threshold monitoring
   - Proactive notifications
   - Escalation workflows

## Development Guidelines

### Agent Development

```typescript
// Example MCP Agent structure
export class FinancialAgent extends McpAgent {
  server = new McpServer({
    name: "Financial Brain",
    version: "1.0.0"
  });

  initialState = {
    conversations: [],
    insights: [],
    alerts: []
  };

  async init() {
    // Register tools
    this.server.tool("analyze_cost", {...}, async (params) => {
      // Tool implementation
    });
  }
}
```

### MCP Tools

- Define clear input/output schemas with Zod
- Implement proper error handling
- Use descriptive tool names and descriptions
- Follow single-responsibility principle

### Security

- OAuth authentication for all agents
- Rate limiting per user/organization
- Input validation on all tools
- Audit logging for compliance
- Encrypted state storage

### Real-time Features

- Use WebSocket for live updates
- Implement proper connection handling
- Add reconnection logic
- Handle state synchronization

## Environment Configuration

```bash
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

# Google Gemini
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
GOOGLE_GEMINI_MODEL=gemini-2.0-flash-exp-01-18

# Agent Configuration
ENABLE_AI_AGENTS=true
AGENT_MAX_ITERATIONS=10
AGENT_TIMEOUT_MS=30000

# OAuth
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
```

## Deployment

### Cloudflare Pages

```bash
# Build and deploy
npm run build
npx wrangler pages deploy out --project-name=prophet-growth-analysis

# Deploy agents
npx wrangler deploy --name financial-brain-agent
```

### Agent Deployment

Each agent is deployed as a separate Cloudflare Worker:

1. Financial Brain: `financial-brain.prophet-growth.workers.dev`
2. Forecast Engine: `forecast-engine.prophet-growth.workers.dev`
3. Scenario Planner: `scenario-planner.prophet-growth.workers.dev`

## Testing

### Agent Testing

```bash
# Test individual agents
npm run test:agents

# Test agent coordination
npm run test:integration

# Test WebSocket connections
npm run test:realtime
```

## Monitoring

- Use Cloudflare Analytics for agent performance
- Monitor Gemini API usage and costs
- Track agent response times
- Set up alerts for failures

## Commands

```bash
# Development
npm run dev          # Start dev server
npm run dev:agents   # Start agent development server
npm run lint         # Check for ESLint errors
npm run type-check   # Run TypeScript checks

# Deployment
npm run deploy       # Deploy to Cloudflare Pages
npm run deploy:agents # Deploy all agents

# Testing
npm run test         # Run all tests
npm run test:agents  # Test agents only
```

## Best Practices

1. **Agent Design**
   - Keep agents focused on specific domains
   - Use clear naming conventions
   - Document all tools thoroughly
   - Implement proper state management

2. **Performance**
   - Use agent hibernation for inactive connections
   - Implement caching for common queries
   - Optimize Gemini prompts for efficiency
   - Monitor API usage and costs

3. **User Experience**
   - Provide real-time feedback
   - Show agent thinking states
   - Handle errors gracefully
   - Offer human-in-the-loop options

Remember: **We're building autonomous AI systems that augment human intelligence, not replace it.**