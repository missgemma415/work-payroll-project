# Agent Guardrails System

## Overview

The Agent Guardrails System provides comprehensive accountability and reliability tracking for AI agents working on the Prophet Growth Analysis platform. It prevents phantom work claims, validates deliverables, and maintains execution integrity.

## Features

### 🔒 Agent Accountability

- **Pre-task checkpoints** with git snapshots and file state capture
- **Handoff validation** to verify claimed deliverables against actual changes
- **Phantom work detection** to catch agents claiming work they didn't perform

### 🔧 Execution Tracking

- **Tool call monitoring** to track all agent actions
- **Claim verification** against actual tool executions
- **Pattern analysis** to detect suspicious behavior

### 📁 File State Monitoring

- **File system snapshots** before and after agent work
- **Change detection** with hash-based verification
- **Content validation** to ensure claimed modifications exist

### 📊 Reliability Metrics

- **Performance scoring** based on success rate and accuracy
- **Reliability tiers** (Platinum, Gold, Silver, Bronze, Developing, Problematic)
- **Trend analysis** to track agent improvement over time
- **Dashboard reporting** for system-wide oversight

### 🔍 Comprehensive Verification

- **Multi-phase validation** combining all guardrail components
- **Build verification** to ensure code quality
- **Weighted scoring** with critical issue detection

## Quick Start

### Available Commands

```bash
# Agent verification
npm run agent:verify <sessionId> [--build]    # Comprehensive verification
npm run agent:dashboard                        # Reliability dashboard

# Session management
npm run agent:checkpoint <agentType> <task>    # Create pre-work checkpoint
npm run agent:handoff <sessionId> <claims>     # Validate deliverables

# Monitoring
npm run agent:snapshot [id]                    # Create file snapshot
npm run agent:track <command>                  # Execution tracking
npm run agent:metrics                          # View reliability metrics
```

### Basic Workflow

1. **Start Agent Session**

   ```bash
   .claude/hooks/agent-session-start "fullstack-architect" "Implement user authentication"
   ```

2. **Agent Performs Work**
   - All tool calls are automatically tracked
   - File changes are monitored
   - Claims are recorded

3. **End Agent Session**

   ```bash
   .claude/hooks/agent-session-end '[{"type":"file_created","path":"src/auth.ts"}]'
   ```

4. **Verify Results**
   ```bash
   npm run agent:verify <session-id> --build
   ```

## System Components

### 1. Agent Handoff Validator (`agent-handoff-validator.js`)

Creates checkpoints and validates deliverables:

- Git snapshots for rollback capability
- File state capture for change detection
- Deliverable validation against claims
- Agent reliability metrics tracking

### 2. Execution Tracker (`execution-tracker.js`)

Monitors tool calls and verifies claims:

- Tool call recording with parameters and results
- Claim verification against actual executions
- Phantom work detection
- Execution pattern analysis

### 3. File State Monitor (`file-state-monitor.js`)

Tracks file system changes:

- Complete file snapshots with hash verification
- Before/after comparisons
- Claim verification against file changes
- Unreported change detection

### 4. Reliability Metrics (`reliability-metrics.js`)

Calculates performance scores and trends:

- Session-based scoring (0-100)
- Reliability tier assignment
- Trend analysis over time
- Performance recommendations

### 5. Agent Verification CLI (`verify-agent.js`)

Comprehensive verification system:

- Multi-phase validation process
- Build verification integration
- Weighted scoring algorithm
- Dashboard reporting

## Reliability Tiers

### 🏆 Platinum (95%+ success, 95%+ accuracy, 90%+ score, 5+ streak)

- Highest reliability agents
- Minimal oversight required
- Can handle critical tasks

### 🥇 Gold (90%+ success, 90%+ accuracy, 85%+ score)

- Highly reliable agents
- Standard oversight
- Trusted for important tasks

### 🥈 Silver (80%+ success, 80%+ accuracy, 75%+ score)

- Reliable agents with minor issues
- Increased monitoring
- Suitable for routine tasks

### 🥉 Bronze (70%+ success, 70%+ accuracy, 65%+ score)

- Developing reliability
- Close supervision required
- Limited to simple tasks

### 🔄 Developing (50%+ success)

- Learning phase
- Extensive oversight needed
- Training opportunities

### ⚠️ Problematic (<50% success)

- Serious reliability issues
- Immediate attention required
- May need process changes

## Git Integration

The system integrates with Git hooks:

### Pre-Commit Hook

- Runs TypeScript and ESLint checks
- Creates file snapshots
- Verifies recent agent activity
- Updates reliability trends

### Post-Commit Hook

- Records commit information
- Creates post-commit snapshots
- Associates commits with agent sessions
- Updates success metrics

## Dashboard

The reliability dashboard provides:

- Overall system metrics
- Agent performance distribution
- Trend analysis
- Recent session summaries
- Reliability recommendations

Access via: `npm run agent:dashboard`

## Troubleshooting

### Common Issues

1. **Session Not Found**
   - Ensure session was properly created with checkpoint
   - Check `.claude/guardrails/sessions/` directory

2. **Phantom Claims Detected**
   - Agent claimed work but no tool calls recorded
   - Review actual vs. claimed deliverables
   - May indicate process bypass

3. **Build Verification Failed**
   - TypeScript or ESLint errors present
   - Fix errors before considering work complete
   - Run `npm run validate` for details

4. **Low Reliability Score**
   - Review recent session failures
   - Check for phantom work patterns
   - Consider additional agent training

### File Locations

```
.claude/
├── guardrails/
│   ├── agent-handoff-validator.js    # Checkpoint & validation
│   ├── execution-tracker.js          # Tool call tracking
│   ├── file-state-monitor.js         # File change monitoring
│   ├── reliability-metrics.js        # Performance metrics
│   ├── verify-agent.js               # Comprehensive verification
│   ├── sessions/                     # Session data
│   ├── snapshots/                    # File snapshots
│   ├── execution-tracks/             # Tool call logs
│   ├── metrics/                      # Reliability data
│   └── reports/                      # Verification reports
├── hooks/
│   ├── pre-commit                    # Pre-commit validation
│   ├── post-commit                   # Post-commit tracking
│   ├── agent-session-start           # Session initialization
│   └── agent-session-end             # Session validation
└── settings.local.json               # Hook configuration
```

## Best Practices

1. **Always Create Checkpoints**
   - Start sessions before agent work begins
   - Capture initial state for comparison

2. **Validate All Claims**
   - End sessions with specific deliverable claims
   - Verify against actual file changes

3. **Monitor Trends**
   - Review reliability metrics regularly
   - Address declining performance quickly

4. **Use Build Verification**
   - Include `--build` flag for critical changes
   - Ensure code quality standards

5. **Regular Cleanup**
   - Snapshots auto-cleanup (keep last 20)
   - Archive old session data periodically

## Security

- No sensitive data logged in tracking
- Content truncated in execution logs
- Git hooks validate code before commit
- Build verification prevents broken deploys

The Agent Guardrails System ensures reliable, accountable AI assistance while maintaining development velocity and code quality.
