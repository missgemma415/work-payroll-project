#!/usr/bin/env node

/**
 * Execution Proof Tracker
 *
 * Tracks all tool calls made by agents and verifies claimed deliverables
 * against actual tool executions to prevent phantom work claims
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ExecutionTracker {
  constructor() {
    this.tracksDir = path.join(process.cwd(), '.claude', 'guardrails', 'execution-tracks');
    this.executionLog = path.join(process.cwd(), '.claude', 'guardrails', 'execution.log');
    this.currentSession = null;
    this.init();
  }

  async init() {
    await fs.mkdir(this.tracksDir, { recursive: true });

    // Initialize execution log
    try {
      await fs.access(this.executionLog);
    } catch {
      await fs.writeFile(this.executionLog, '');
    }
  }

  /**
   * Start tracking a new agent session
   */
  async startSession(sessionId, agentType, taskDescription) {
    const sessionData = {
      sessionId,
      agentType,
      taskDescription,
      startTime: new Date().toISOString(),
      toolCalls: [],
      claims: [],
      status: 'active',
    };

    this.currentSession = sessionData;

    const sessionFile = path.join(this.tracksDir, `${sessionId}.json`);
    await fs.writeFile(sessionFile, JSON.stringify(sessionData, null, 2));

    await this.logExecution(`SESSION_START`, { sessionId, agentType, taskDescription });

    console.log(`🎯 Started execution tracking for ${agentType}: ${sessionId}`);
    return sessionId;
  }

  /**
   * Record a tool call execution
   */
  async recordToolCall(toolName, parameters, result, timestamp = new Date().toISOString()) {
    if (!this.currentSession) {
      console.warn('⚠️  No active session - tool call not tracked');
      return;
    }

    const toolCall = {
      id: this.generateCallId(),
      toolName,
      parameters: this.sanitizeParameters(parameters),
      result: this.sanitizeResult(result),
      timestamp,
      success: !result?.error,
      executionTime: Date.now(),
    };

    this.currentSession.toolCalls.push(toolCall);
    await this.updateSessionFile();
    await this.logExecution('TOOL_CALL', toolCall);

    console.log(`🔧 Recorded tool call: ${toolName} (${toolCall.success ? '✅' : '❌'})`);
    return toolCall.id;
  }

  /**
   * Record an agent claim about work performed
   */
  async recordClaim(claimType, description, details = {}) {
    if (!this.currentSession) {
      console.warn('⚠️  No active session - claim not recorded');
      return;
    }

    const claim = {
      id: this.generateCallId(),
      type: claimType,
      description,
      details,
      timestamp: new Date().toISOString(),
      verified: false,
    };

    this.currentSession.claims.push(claim);
    await this.updateSessionFile();
    await this.logExecution('AGENT_CLAIM', claim);

    console.log(`📝 Recorded agent claim: ${claimType} - ${description}`);
    return claim.id;
  }

  /**
   * End the current session and perform verification
   */
  async endSession(finalClaims = []) {
    if (!this.currentSession) {
      console.warn('⚠️  No active session to end');
      return null;
    }

    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.status = 'completed';

    // Add final claims
    for (const claim of finalClaims) {
      await this.recordClaim(claim.type, claim.description, claim.details);
    }

    // Perform verification
    const verification = await this.verifyClaims();
    this.currentSession.verification = verification;

    await this.updateSessionFile();
    await this.logExecution('SESSION_END', {
      sessionId: this.currentSession.sessionId,
      verification: verification.summary,
    });

    const sessionId = this.currentSession.sessionId;
    this.currentSession = null;

    console.log(
      `🏁 Ended session ${sessionId}: ${verification.summary.reliable ? '✅ Verified' : '❌ Issues Found'}`
    );
    return verification;
  }

  /**
   * Verify agent claims against actual tool executions
   */
  async verifyClaims() {
    const verification = {
      timestamp: new Date().toISOString(),
      totalClaims: this.currentSession.claims.length,
      verifiedClaims: 0,
      failedClaims: 0,
      unverifiableClaims: 0,
      discrepancies: [],
      toolCallStats: this.analyzeToolCalls(),
      summary: {
        reliable: true,
        score: 0,
        issues: [],
      },
    };

    // Verify each claim
    for (const claim of this.currentSession.claims) {
      const claimVerification = await this.verifyClaim(claim);

      if (claimVerification.verified) {
        verification.verifiedClaims++;
        claim.verified = true;
      } else if (claimVerification.verifiable) {
        verification.failedClaims++;
        verification.discrepancies.push({
          claimId: claim.id,
          issue: claimVerification.reason,
          severity: claimVerification.severity || 'medium',
        });
        verification.summary.issues.push(claimVerification.reason);
      } else {
        verification.unverifiableClaims++;
      }
    }

    // Calculate reliability score
    const totalVerifiable = verification.verifiedClaims + verification.failedClaims;
    if (totalVerifiable > 0) {
      verification.summary.score = (verification.verifiedClaims / totalVerifiable) * 100;
      verification.summary.reliable =
        verification.summary.score >= 80 && verification.failedClaims === 0;
    }

    // Check for phantom work patterns
    const phantomWork = await this.detectPhantomWork();
    if (phantomWork.length > 0) {
      verification.summary.reliable = false;
      verification.summary.issues.push(...phantomWork);
    }

    return verification;
  }

  /**
   * Verify a specific claim against tool executions
   */
  async verifyClaim(claim) {
    switch (claim.type) {
      case 'file_created':
        return await this.verifyFileCreatedClaim(claim);
      case 'file_modified':
        return await this.verifyFileModifiedClaim(claim);
      case 'file_deleted':
        return await this.verifyFileDeletedClaim(claim);
      case 'api_endpoint_created':
        return await this.verifyApiEndpointClaim(claim);
      case 'dependency_installed':
        return await this.verifyDependencyInstalledClaim(claim);
      case 'build_fixed':
        return await this.verifyBuildFixedClaim(claim);
      default:
        return { verified: false, verifiable: false, reason: `Unknown claim type: ${claim.type}` };
    }
  }

  /**
   * Verify file creation claim
   */
  async verifyFileCreatedClaim(claim) {
    const { filePath } = claim.details;

    // Check if there was a Write tool call for this file
    const writeCall = this.currentSession.toolCalls.find(
      (call) => call.toolName === 'Write' && call.parameters.file_path === filePath && call.success
    );

    if (!writeCall) {
      return {
        verified: false,
        verifiable: true,
        reason: `Claimed file creation for ${filePath} but no successful Write tool call found`,
        severity: 'high',
      };
    }

    // Check if file actually exists
    try {
      await fs.access(path.join(process.cwd(), filePath));
      return { verified: true, verifiable: true, reason: 'File creation verified' };
    } catch {
      return {
        verified: false,
        verifiable: true,
        reason: `Write tool call executed but file ${filePath} does not exist`,
        severity: 'high',
      };
    }
  }

  /**
   * Verify file modification claim
   */
  async verifyFileModifiedClaim(claim) {
    const { filePath } = claim.details;

    // Check for Edit or Write tool calls
    const modificationCall = this.currentSession.toolCalls.find(
      (call) =>
        (call.toolName === 'Edit' || call.toolName === 'Write' || call.toolName === 'MultiEdit') &&
        call.parameters.file_path === filePath &&
        call.success
    );

    if (!modificationCall) {
      return {
        verified: false,
        verifiable: true,
        reason: `Claimed file modification for ${filePath} but no modification tool call found`,
        severity: 'high',
      };
    }

    return { verified: true, verifiable: true, reason: 'File modification verified' };
  }

  /**
   * Verify API endpoint creation claim
   */
  async verifyApiEndpointClaim(claim) {
    const { endpoint, filePath } = claim.details;

    // Check if API route file was created
    const fileCreated = this.currentSession.toolCalls.find(
      (call) =>
        call.toolName === 'Write' && call.parameters.file_path?.includes(filePath) && call.success
    );

    if (!fileCreated) {
      return {
        verified: false,
        verifiable: true,
        reason: `Claimed API endpoint ${endpoint} creation but no route file created`,
        severity: 'high',
      };
    }

    return { verified: true, verifiable: true, reason: 'API endpoint creation verified' };
  }

  /**
   * Verify dependency installation claim
   */
  async verifyDependencyInstalledClaim(claim) {
    const { packageName } = claim.details;

    // Check for npm install command
    const installCall = this.currentSession.toolCalls.find(
      (call) =>
        call.toolName === 'Bash' &&
        call.parameters.command?.includes('npm install') &&
        call.parameters.command?.includes(packageName) &&
        call.success
    );

    if (!installCall) {
      return {
        verified: false,
        verifiable: true,
        reason: `Claimed package ${packageName} installation but no npm install command found`,
        severity: 'medium',
      };
    }

    return { verified: true, verifiable: true, reason: 'Dependency installation verified' };
  }

  /**
   * Verify build fix claim
   */
  async verifyBuildFixedClaim(claim) {
    // Check for build command execution
    const buildCall = this.currentSession.toolCalls.find(
      (call) =>
        call.toolName === 'Bash' &&
        (call.parameters.command?.includes('npm run build') ||
          call.parameters.command?.includes('next build')) &&
        call.success
    );

    if (!buildCall) {
      return {
        verified: false,
        verifiable: true,
        reason: 'Claimed build fix but no successful build command found',
        severity: 'high',
      };
    }

    return { verified: true, verifiable: true, reason: 'Build fix verified' };
  }

  /**
   * Detect phantom work (claims without corresponding tool calls)
   */
  async detectPhantomWork() {
    const phantomWork = [];
    const toolCallsByType = this.groupToolCallsByType();

    // Check for file claims without tool calls
    const fileClaims = this.currentSession.claims.filter(
      (c) => c.type.includes('file_') || c.type.includes('api_endpoint')
    );

    const writeCallCount = (toolCallsByType.Write || []).length;
    const editCallCount =
      (toolCallsByType.Edit || []).length + (toolCallsByType.MultiEdit || []).length;

    if (fileClaims.length > writeCallCount + editCallCount) {
      phantomWork.push(
        `Phantom file work: ${fileClaims.length} file claims but only ${writeCallCount + editCallCount} file tool calls`
      );
    }

    return phantomWork;
  }

  /**
   * Analyze tool call patterns
   */
  analyzeToolCalls() {
    const stats = {
      totalCalls: this.currentSession.toolCalls.length,
      successfulCalls: this.currentSession.toolCalls.filter((c) => c.success).length,
      failedCalls: this.currentSession.toolCalls.filter((c) => !c.success).length,
      toolTypes: this.groupToolCallsByType(),
      executionPattern: this.analyzeExecutionPattern(),
    };

    stats.successRate = stats.totalCalls > 0 ? (stats.successfulCalls / stats.totalCalls) * 100 : 0;

    return stats;
  }

  /**
   * Group tool calls by type
   */
  groupToolCallsByType() {
    const grouped = {};

    for (const call of this.currentSession.toolCalls) {
      if (!grouped[call.toolName]) {
        grouped[call.toolName] = [];
      }
      grouped[call.toolName].push(call);
    }

    return grouped;
  }

  /**
   * Analyze execution pattern
   */
  analyzeExecutionPattern() {
    const pattern = {
      hasFileOperations: false,
      hasBuildOperations: false,
      hasTestOperations: false,
      hasValidation: false,
      suspicious: [],
    };

    const toolNames = this.currentSession.toolCalls.map((c) => c.toolName);

    pattern.hasFileOperations = toolNames.some((t) =>
      ['Write', 'Edit', 'MultiEdit', 'Read'].includes(t)
    );
    pattern.hasBuildOperations = toolNames.some(
      (t) =>
        t === 'Bash' &&
        this.currentSession.toolCalls.some((c) => c.parameters.command?.includes('build'))
    );
    pattern.hasTestOperations = toolNames.some(
      (t) =>
        t === 'Bash' &&
        this.currentSession.toolCalls.some((c) => c.parameters.command?.includes('test'))
    );

    // Check for suspicious patterns
    if (this.currentSession.claims.length > 0 && this.currentSession.toolCalls.length === 0) {
      pattern.suspicious.push('Claims made but no tool calls executed');
    }

    return pattern;
  }

  /**
   * Update session file
   */
  async updateSessionFile() {
    if (this.currentSession) {
      const sessionFile = path.join(this.tracksDir, `${this.currentSession.sessionId}.json`);
      await fs.writeFile(sessionFile, JSON.stringify(this.currentSession, null, 2));
    }
  }

  /**
   * Log execution event
   */
  async logExecution(event, data) {
    const logEntry = `[${new Date().toISOString()}] ${event}: ${JSON.stringify(data)}\n`;
    await fs.appendFile(this.executionLog, logEntry);
  }

  /**
   * Sanitize parameters for logging
   */
  sanitizeParameters(params) {
    // Remove sensitive data, truncate large content
    const sanitized = { ...params };

    if (sanitized.content && sanitized.content.length > 1000) {
      sanitized.content = sanitized.content.substring(0, 1000) + '... [truncated]';
    }

    return sanitized;
  }

  /**
   * Sanitize result for logging
   */
  sanitizeResult(result) {
    if (typeof result === 'string' && result.length > 1000) {
      return result.substring(0, 1000) + '... [truncated]';
    }
    return result;
  }

  /**
   * Generate unique call ID
   */
  generateCallId() {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Get execution report for a session
   */
  async getExecutionReport(sessionId) {
    const sessionFile = path.join(this.tracksDir, `${sessionId}.json`);
    try {
      const sessionData = JSON.parse(await fs.readFile(sessionFile, 'utf8'));
      return sessionData;
    } catch (error) {
      throw new Error(`Session ${sessionId} not found`);
    }
  }

  /**
   * Get all execution reports
   */
  async getAllReports() {
    const reports = [];
    const files = await fs.readdir(this.tracksDir);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const sessionData = JSON.parse(await fs.readFile(path.join(this.tracksDir, file), 'utf8'));
        reports.push({
          sessionId: sessionData.sessionId,
          agentType: sessionData.agentType,
          status: sessionData.status,
          reliable: sessionData.verification?.summary?.reliable,
          score: sessionData.verification?.summary?.score,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
        });
      }
    }

    return reports.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }
}

// CLI interface
if (require.main === module) {
  const [, , command, ...args] = process.argv;
  const tracker = new ExecutionTracker();

  switch (command) {
    case 'start':
      const [sessionId, agentType, taskDescription] = args;
      tracker.startSession(sessionId, agentType, taskDescription);
      break;

    case 'tool-call':
      const [toolName, parametersJson, resultJson] = args;
      tracker.recordToolCall(toolName, JSON.parse(parametersJson), JSON.parse(resultJson));
      break;

    case 'claim':
      const [claimType, description, detailsJson] = args;
      tracker.recordClaim(claimType, description, detailsJson ? JSON.parse(detailsJson) : {});
      break;

    case 'end':
      const [finalClaimsJson] = args;
      tracker.endSession(finalClaimsJson ? JSON.parse(finalClaimsJson) : []);
      break;

    case 'report':
      const [reportSessionId] = args;
      if (reportSessionId) {
        tracker.getExecutionReport(reportSessionId).then((report) => {
          console.log(JSON.stringify(report, null, 2));
        });
      } else {
        tracker.getAllReports().then((reports) => {
          console.log(JSON.stringify(reports, null, 2));
        });
      }
      break;

    default:
      console.log(`
Usage: execution-tracker.js <command> [args]

Commands:
  start <sessionId> <agentType> <task>     Start tracking session
  tool-call <tool> <params> <result>      Record tool call
  claim <type> <description> [details]    Record agent claim
  end [finalClaims]                       End session and verify
  report [sessionId]                      Get execution report(s)
      `);
  }
}

module.exports = ExecutionTracker;
