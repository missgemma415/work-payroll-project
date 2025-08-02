#!/usr/bin/env node

/**
 * Agent Handoff Validation System
 *
 * Ensures agent accountability by creating checkpoints and validating deliverables
 * Prevents phantom work claims and maintains execution integrity
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

class AgentHandoffValidator {
  constructor() {
    this.sessionDir = path.join(process.cwd(), '.claude', 'guardrails', 'sessions');
    this.checkpointsDir = path.join(process.cwd(), '.claude', 'guardrails', 'checkpoints');
    this.metricsFile = path.join(process.cwd(), '.claude', 'guardrails', 'agent-metrics.json');
    this.init();
  }

  async init() {
    // Ensure directories exist
    await fs.mkdir(this.sessionDir, { recursive: true });
    await fs.mkdir(this.checkpointsDir, { recursive: true });

    // Initialize metrics file if it doesn't exist
    try {
      await fs.access(this.metricsFile);
    } catch {
      await fs.writeFile(
        this.metricsFile,
        JSON.stringify(
          {
            agents: {},
            sessions: [],
            totalSessions: 0,
            successRate: 0,
          },
          null,
          2
        )
      );
    }
  }

  /**
   * Create a pre-agent checkpoint (git snapshot + file state)
   */
  async createCheckpoint(agentType, taskDescription) {
    const sessionId = this.generateSessionId();
    const timestamp = new Date().toISOString();

    console.log(`🔒 Creating checkpoint for ${agentType} session: ${sessionId}`);

    // Create git checkpoint
    const gitHash = this.createGitCheckpoint(sessionId);

    // Capture current file state
    const fileState = await this.captureFileState();

    // Create session metadata
    const sessionData = {
      sessionId,
      agentType,
      taskDescription,
      timestamp,
      gitHash,
      fileState,
      status: 'started',
      claims: [],
      actualActions: [],
      deliverables: [],
    };

    await fs.writeFile(
      path.join(this.sessionDir, `${sessionId}.json`),
      JSON.stringify(sessionData, null, 2)
    );

    console.log(`✅ Checkpoint created: ${sessionId}`);
    return sessionId;
  }

  /**
   * Validate agent deliverables after task completion
   */
  async validateHandoff(sessionId, claimedDeliverables = []) {
    console.log(`🔍 Validating handoff for session: ${sessionId}`);

    const sessionFile = path.join(this.sessionDir, `${sessionId}.json`);
    const sessionData = JSON.parse(await fs.readFile(sessionFile, 'utf8'));

    // Capture post-execution state
    const postFileState = await this.captureFileState();

    // Validate each claimed deliverable
    const validation = {
      sessionId,
      timestamp: new Date().toISOString(),
      validated: true,
      issues: [],
      deliverables: [],
    };

    for (const deliverable of claimedDeliverables) {
      const result = await this.validateDeliverable(
        deliverable,
        sessionData.fileState,
        postFileState
      );
      validation.deliverables.push(result);

      if (!result.valid) {
        validation.validated = false;
        validation.issues.push(`Deliverable failed: ${result.reason}`);
      }
    }

    // Check for phantom claims (files claimed but don't exist)
    const phantomFiles = await this.detectPhantomFiles(claimedDeliverables);
    if (phantomFiles.length > 0) {
      validation.validated = false;
      validation.issues.push(`Phantom files detected: ${phantomFiles.join(', ')}`);
    }

    // Update session data
    sessionData.status = validation.validated ? 'completed' : 'failed';
    sessionData.validation = validation;
    sessionData.completedAt = new Date().toISOString();

    await fs.writeFile(sessionFile, JSON.stringify(sessionData, null, 2));

    // Update agent metrics
    await this.updateAgentMetrics(sessionData.agentType, validation.validated);

    if (validation.validated) {
      console.log(`✅ Handoff validated successfully for ${sessionId}`);
    } else {
      console.log(`❌ Handoff validation failed for ${sessionId}`);
      console.log(`Issues: ${validation.issues.join(', ')}`);
    }

    return validation;
  }

  /**
   * Validate a specific deliverable
   */
  async validateDeliverable(deliverable, preState, postState) {
    const { type, path: filePath, expectedContent, expectedExists } = deliverable;

    try {
      switch (type) {
        case 'file_created':
          return await this.validateFileCreated(filePath, preState, postState, expectedContent);
        case 'file_modified':
          return await this.validateFileModified(filePath, preState, postState, expectedContent);
        case 'file_deleted':
          return await this.validateFileDeleted(filePath, preState, postState);
        case 'directory_created':
          return await this.validateDirectoryCreated(filePath, postState);
        default:
          return { valid: false, reason: `Unknown deliverable type: ${type}` };
      }
    } catch (error) {
      return { valid: false, reason: `Validation error: ${error.message}` };
    }
  }

  /**
   * Validate file creation
   */
  async validateFileCreated(filePath, preState, postState, expectedContent) {
    // Check file didn't exist before
    if (preState.files[filePath]) {
      return { valid: false, reason: 'File already existed before agent execution' };
    }

    // Check file exists now
    if (!postState.files[filePath]) {
      return { valid: false, reason: 'File claimed to be created but does not exist' };
    }

    // Check content if provided
    if (expectedContent) {
      try {
        const actualContent = await fs.readFile(path.join(process.cwd(), filePath), 'utf8');
        if (!actualContent.includes(expectedContent)) {
          return { valid: false, reason: 'File content does not match expected content' };
        }
      } catch (error) {
        return { valid: false, reason: `Could not read file content: ${error.message}` };
      }
    }

    return { valid: true, reason: 'File created successfully' };
  }

  /**
   * Validate file modification
   */
  async validateFileModified(filePath, preState, postState, expectedContent) {
    // Check file existed before
    if (!preState.files[filePath]) {
      return { valid: false, reason: 'File did not exist before modification' };
    }

    // Check file still exists
    if (!postState.files[filePath]) {
      return { valid: false, reason: 'File no longer exists after claimed modification' };
    }

    // Check file was actually modified
    if (preState.files[filePath].hash === postState.files[filePath].hash) {
      return { valid: false, reason: 'File hash unchanged - no actual modification detected' };
    }

    return { valid: true, reason: 'File modified successfully' };
  }

  /**
   * Validate file deletion
   */
  async validateFileDeleted(filePath, preState, postState) {
    // Check file existed before
    if (!preState.files[filePath]) {
      return { valid: false, reason: 'File did not exist before deletion' };
    }

    // Check file no longer exists
    if (postState.files[filePath]) {
      return { valid: false, reason: 'File still exists after claimed deletion' };
    }

    return { valid: true, reason: 'File deleted successfully' };
  }

  /**
   * Validate directory creation
   */
  async validateDirectoryCreated(dirPath, postState) {
    try {
      const stats = await fs.stat(path.join(process.cwd(), dirPath));
      if (!stats.isDirectory()) {
        return { valid: false, reason: 'Path exists but is not a directory' };
      }
      return { valid: true, reason: 'Directory created successfully' };
    } catch (error) {
      return { valid: false, reason: 'Directory does not exist' };
    }
  }

  /**
   * Detect phantom files (claimed to exist but don't)
   */
  async detectPhantomFiles(claimedDeliverables) {
    const phantomFiles = [];

    for (const deliverable of claimedDeliverables) {
      if (deliverable.type === 'file_created' || deliverable.type === 'file_modified') {
        try {
          await fs.access(path.join(process.cwd(), deliverable.path));
        } catch (error) {
          phantomFiles.push(deliverable.path);
        }
      }
    }

    return phantomFiles;
  }

  /**
   * Capture current file state (files and their hashes)
   */
  async captureFileState() {
    const fileState = {
      timestamp: new Date().toISOString(),
      files: {},
      directories: [],
    };

    // Get all files in project (excluding node_modules, .git, etc.)
    const gitFiles = execSync('git ls-files', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter((f) => f);

    for (const filePath of gitFiles) {
      try {
        const fullPath = path.join(process.cwd(), filePath);
        const stats = await fs.stat(fullPath);

        if (stats.isFile()) {
          const content = await fs.readFile(fullPath);
          const hash = crypto.createHash('sha256').update(content).digest('hex');

          fileState.files[filePath] = {
            size: stats.size,
            mtime: stats.mtime.toISOString(),
            hash: hash,
          };
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return fileState;
  }

  /**
   * Create git checkpoint
   */
  createGitCheckpoint(sessionId) {
    try {
      // Create a lightweight tag for this checkpoint
      const tagName = `checkpoint-${sessionId}`;
      execSync(`git tag ${tagName}`, { stdio: 'ignore' });

      // Get current commit hash
      const gitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();

      console.log(`📍 Git checkpoint created: ${tagName} (${gitHash.substring(0, 8)})`);
      return gitHash;
    } catch (error) {
      console.warn(`⚠️  Could not create git checkpoint: ${error.message}`);
      return null;
    }
  }

  /**
   * Update agent reliability metrics
   */
  async updateAgentMetrics(agentType, success) {
    try {
      const metrics = JSON.parse(await fs.readFile(this.metricsFile, 'utf8'));

      if (!metrics.agents[agentType]) {
        metrics.agents[agentType] = {
          totalSessions: 0,
          successfulSessions: 0,
          successRate: 0,
          lastSeen: new Date().toISOString(),
        };
      }

      metrics.agents[agentType].totalSessions++;
      if (success) {
        metrics.agents[agentType].successfulSessions++;
      }
      metrics.agents[agentType].successRate =
        (metrics.agents[agentType].successfulSessions / metrics.agents[agentType].totalSessions) *
        100;
      metrics.agents[agentType].lastSeen = new Date().toISOString();

      metrics.totalSessions++;
      const totalSuccessful = Object.values(metrics.agents).reduce(
        (sum, agent) => sum + agent.successfulSessions,
        0
      );
      metrics.successRate = (totalSuccessful / metrics.totalSessions) * 100;

      await fs.writeFile(this.metricsFile, JSON.stringify(metrics, null, 2));
    } catch (error) {
      console.error(`Error updating metrics: ${error.message}`);
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
  }

  /**
   * Get agent reliability report
   */
  async getReliabilityReport() {
    try {
      const metrics = JSON.parse(await fs.readFile(this.metricsFile, 'utf8'));
      return metrics;
    } catch (error) {
      return { agents: {}, sessions: [], totalSessions: 0, successRate: 0 };
    }
  }

  /**
   * Rollback to checkpoint (in case of agent failure)
   */
  async rollbackToCheckpoint(sessionId) {
    const sessionFile = path.join(this.sessionDir, `${sessionId}.json`);
    const sessionData = JSON.parse(await fs.readFile(sessionFile, 'utf8'));

    if (sessionData.gitHash) {
      try {
        console.log(`🔄 Rolling back to checkpoint: ${sessionId}`);
        execSync(`git reset --hard ${sessionData.gitHash}`, { stdio: 'inherit' });
        console.log(`✅ Rollback completed`);
        return true;
      } catch (error) {
        console.error(`❌ Rollback failed: ${error.message}`);
        return false;
      }
    } else {
      console.warn(`⚠️  No git checkpoint available for session: ${sessionId}`);
      return false;
    }
  }
}

// CLI interface
if (require.main === module) {
  const [, , command, ...args] = process.argv;
  const validator = new AgentHandoffValidator();

  switch (command) {
    case 'checkpoint':
      const [agentType, taskDescription] = args;
      validator.createCheckpoint(agentType, taskDescription).then((sessionId) => {
        console.log(`Session ID: ${sessionId}`);
      });
      break;

    case 'validate':
      const [sessionId, ...deliverables] = args;
      const parsedDeliverables = deliverables.map((d) => JSON.parse(d));
      validator.validateHandoff(sessionId, parsedDeliverables);
      break;

    case 'report':
      validator.getReliabilityReport().then((report) => {
        console.log(JSON.stringify(report, null, 2));
      });
      break;

    case 'rollback':
      const [rollbackSessionId] = args;
      validator.rollbackToCheckpoint(rollbackSessionId);
      break;

    default:
      console.log(`
Usage: agent-handoff-validator.js <command> [args]

Commands:
  checkpoint <agentType> <taskDescription>  Create pre-agent checkpoint
  validate <sessionId> [deliverables...]    Validate agent deliverables
  report                                    Show reliability report
  rollback <sessionId>                      Rollback to checkpoint
      `);
  }
}

module.exports = AgentHandoffValidator;
