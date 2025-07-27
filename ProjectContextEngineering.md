# Project Context Engineering

## Overview

**Prophet Growth Analysis** is an AI-powered financial intelligence platform that revolutionizes workforce cost management through autonomous agents, predictive analytics, and real-time collaboration. Built on Cloudflare's cutting-edge Agent technology and powered by Google Gemini, it transforms reactive financial operations into proactive, intelligent systems.

## Business Vision

### Problem Statement

Organizations struggle with:

- Manual, reactive employee cost tracking
- Lack of predictive insights for workforce planning
- Siloed financial data across departments
- Time-consuming scenario planning
- Delayed decision-making on hiring/termination impacts

### Solution

An autonomous AI financial operations platform that:

- Continuously monitors and optimizes employee costs
- Predicts future costs with machine learning
- Enables real-time collaborative scenario planning
- Provides executive-ready insights instantly
- Learns from decisions to improve recommendations

## Technical Architecture

### Core Technologies

- **Frontend**: Next.js 15 with App Router (static export)
- **Agent Platform**: Cloudflare Agents SDK with MCP
- **AI/ML**: Google Gemini API, Prophet, Neural Prophet
- **Real-time**: WebSocket via Durable Objects
- **State Management**: Agent-native SQL database
- **Deployment**: Cloudflare Pages + Workers
- **Security**: OAuth 2.1 with MCP authorization
- **Type Safety**: TypeScript with strict mode

### Agent-Based Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Executive Dashboard                       │
│                     (Next.js Frontend)                       │
└─────────────────┬───────────────────────┬───────────────────┘
                  │ WebSocket/SSE         │
┌─────────────────▼───────────────────────▼───────────────────┐
│              Cloudflare MCP Agent Network                    │
├──────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Financial Brain │ │ Forecast Engine │ │ Scenario Planner│ │
│ │   MCP Agent     │ │   MCP Agent     │ │   MCP Agent     │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│                                                              │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Alert Monitor   │ │ Data Collector  │ │ Integration Hub │ │
│ │   MCP Agent     │ │   MCP Agent     │ │   MCP Agent     │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Agent Specifications

#### 1. Financial Brain Agent

- **Purpose**: Central AI-powered financial analyst
- **Tools**:
  - `analyze_costs`: Deep cost analysis with Gemini
  - `generate_insights`: Actionable recommendations
  - `answer_questions`: Natural language Q&A
- **State**: Conversation history, learned patterns, insights cache
- **Integration**: Gemini API for NLP

#### 2. Forecast Engine Agent

- **Purpose**: Time series prediction and trend analysis
- **Tools**:
  - `generate_forecast`: Prophet/Neural Prophet predictions
  - `detect_anomalies`: Cost anomaly detection
  - `seasonal_analysis`: Identify patterns
- **State**: Historical data, model parameters, forecasts
- **Integration**: Python microservice for Prophet

#### 3. Scenario Planner Agent

- **Purpose**: What-if analysis and collaborative planning
- **Tools**:
  - `simulate_scenario`: Multi-variable simulations
  - `calculate_impact`: Real-time impact analysis
  - `compare_scenarios`: Side-by-side comparisons
- **State**: Active scenarios, simulation results, decisions
- **Integration**: Multi-model ensemble

#### 4. Alert Monitor Agent

- **Purpose**: Proactive monitoring and notifications
- **Tools**:
  - `set_threshold`: Configure alert rules
  - `check_metrics`: Continuous monitoring
  - `send_alert`: Multi-channel notifications
- **State**: Alert rules, trigger history, escalations
- **Integration**: Email, Slack, Teams

### Model Context Protocol (MCP)

MCP provides standardized communication between agents and services:

```typescript
// MCP Tool Definition
server.tool(
  'analyze_costs',
  {
    employees: z.array(EmployeeSchema),
    timeframe: z.enum(['monthly', 'quarterly', 'annual']),
    includeForecasts: z.boolean(),
  },
  async (params) => {
    // Tool implementation
    const analysis = await geminiAnalyze(params);
    return { content: [{ type: 'text', text: analysis }] };
  }
);
```

### Data Models

#### Core Entities

```typescript
interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  level: string;
  location: string;
  startDate: Date;
  baseSalary: number;
  currency: string;
}

interface EmployeeCost {
  employeeId: string;
  employee: Employee;
  baseSalary: number;
  benefits: BenefitsPackage;
  overhead: OverheadCosts;
  projectAllocations: ProjectAllocation[];
  utilization: number;
  totalMonthlyCost: number;
  totalAnnualCost: number;
  effectiveDate: Date;
}

interface Forecast {
  id: string;
  agentId: string;
  type: 'prophet' | 'neural_prophet' | 'statsforecast';
  timeframe: string;
  predictions: TimeSeries[];
  confidence: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  assumptions: ScenarioAssumptions;
  results: ScenarioResults;
  status: 'draft' | 'active' | 'approved' | 'rejected';
  collaborators: string[];
  approvals: Approval[];
}
```

### Security Architecture

1. **Authentication**
   - OAuth 2.1 via MCP authorization
   - JWT tokens for session management
   - Multi-factor authentication support

2. **Authorization**
   - Role-based access control (RBAC)
   - Organization-level isolation
   - Tool-specific permissions

3. **Data Protection**
   - End-to-end encryption
   - At-rest encryption in Durable Objects
   - Audit logging for compliance

### Performance Optimization

1. **Agent Optimization**
   - WebSocket hibernation for inactive connections
   - State caching in SQL database
   - Lazy loading of historical data

2. **AI Optimization**
   - Prompt caching for common queries
   - Batched API calls to Gemini
   - Model selection based on complexity

3. **Frontend Optimization**
   - Static site generation
   - Edge caching with Cloudflare
   - Progressive enhancement

## Development Workflow

### Agent Development

1. **Create Agent Class**

```typescript
export class FinancialBrainAgent extends McpAgent {
  server = new McpServer({
    name: 'Financial Brain',
    version: '1.0.0',
  });

  initialState = {
    conversations: [],
    insights: [],
  };

  async init() {
    // Register tools
  }
}
```

2. **Deploy Agent**

```bash
npx wrangler deploy --name financial-brain-agent
```

3. **Connect Frontend**

```typescript
const ws = new WebSocket('wss://financial-brain.prophet-growth.workers.dev');
```

### Testing Strategy

1. **Agent Testing**
   - Unit tests for individual tools
   - Integration tests for agent coordination
   - End-to-end tests for workflows

2. **Performance Testing**
   - Load testing with multiple concurrent users
   - Latency testing across regions
   - API rate limit testing

3. **Security Testing**
   - Penetration testing
   - OAuth flow validation
   - Data isolation verification

## Deployment Pipeline

1. **Development**
   - Local agent development with Miniflare
   - Hot reload for frontend changes
   - Mock data for testing

2. **Staging**
   - Deploy to Cloudflare staging environment
   - Integration testing with real APIs
   - Performance benchmarking

3. **Production**
   - Blue-green deployment
   - Gradual rollout
   - Monitoring and alerting

## Monitoring & Analytics

1. **Agent Metrics**
   - Response times
   - Tool usage
   - Error rates
   - State size

2. **Business Metrics**
   - User engagement
   - Cost savings identified
   - Forecast accuracy
   - Decision impact

3. **Technical Metrics**
   - API usage and costs
   - WebSocket connections
   - Database performance
   - Cache hit rates

## Future Roadmap

### Phase 1: Foundation (Current)

- Core agent implementation
- Basic Gemini integration
- Simple forecasting

### Phase 2: Intelligence

- Multi-agent coordination
- Advanced ML models
- Learning system

### Phase 3: Enterprise

- Custom agent builder
- API marketplace
- White-label solution

### Phase 4: Innovation

- Autonomous decision execution
- Cross-organization benchmarking
- AI-driven negotiations

## Success Metrics

1. **Technical KPIs**
   - 99.9% uptime
   - <200ms agent response time
   - <2s end-to-end latency
   - 90% cache hit rate

2. **Business KPIs**
   - 30% reduction in manual analysis time
   - 15% improvement in cost predictions
   - 50% faster scenario planning
   - 25% cost savings identified

3. **User KPIs**
   - 80% daily active users
   - 4.5+ star satisfaction
   - <2 minute onboarding
   - 90% feature adoption

Remember: We're building the future of financial operations - autonomous, intelligent, and human-centered.
