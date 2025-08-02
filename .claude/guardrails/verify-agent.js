#!/usr/bin/env node

/**
 * Agent Verification CLI
 *
 * Comprehensive verification system that combines all guardrail components
 * to validate agent work and prevent phantom deliverable claims
 */

const AgentHandoffValidator = require('./agent-handoff-validator');
const ExecutionTracker = require('./execution-tracker');
const FileStateMonitor = require('./file-state-monitor');

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class AgentVerificationCLI {
  constructor() {
    this.validator = new AgentHandoffValidator();
    this.tracker = new ExecutionTracker();
    this.monitor = new FileStateMonitor();
    this.reportsDir = path.join(process.cwd(), '.claude', 'guardrails', 'reports');
  }

  async init() {
    await fs.mkdir(this.reportsDir, { recursive: true });
  }

  /**
   * Comprehensive agent verification workflow
   */
  async verifyAgent(sessionId, options = {}) {
    console.log(`🔍 Starting comprehensive verification for session: ${sessionId}`);

    const verificationReport = {
      sessionId,
      timestamp: new Date().toISOString(),
      options,
      phases: {
        handoffValidation: null,
        executionTracking: null,
        fileStateAnalysis: null,
        buildVerification: null,
        finalAssessment: null,
      },
      summary: {
        passed: false,
        score: 0,
        issues: [],
        recommendations: [],
      },
    };

    try {
      // Phase 1: Handoff Validation
      console.log(`📋 Phase 1: Handoff Validation`);
      verificationReport.phases.handoffValidation = await this.validateHandoff(sessionId);

      // Phase 2: Execution Tracking Analysis
      console.log(`🔧 Phase 2: Execution Tracking Analysis`);
      verificationReport.phases.executionTracking = await this.analyzeExecution(sessionId);

      // Phase 3: File State Analysis
      console.log(`📁 Phase 3: File State Analysis`);
      verificationReport.phases.fileStateAnalysis = await this.analyzeFileState(sessionId);

      // Phase 4: Build Verification (if applicable)
      if (options.verifyBuild) {
        console.log(`🔨 Phase 4: Build Verification`);
        verificationReport.phases.buildVerification = await this.verifyBuild();
      }

      // Phase 5: Final Assessment
      console.log(`📊 Phase 5: Final Assessment`);
      verificationReport.phases.finalAssessment =
        await this.generateFinalAssessment(verificationReport);

      // Calculate overall score and determine pass/fail
      this.calculateFinalScore(verificationReport);

      // Save report
      await this.saveVerificationReport(sessionId, verificationReport);

      // Display results
      this.displayResults(verificationReport);

      return verificationReport;
    } catch (error) {
      console.error(`❌ Verification failed: ${error.message}`);
      verificationReport.summary.issues.push(`Verification error: ${error.message}`);
      verificationReport.summary.passed = false;
      return verificationReport;
    }
  }

  /**
   * Validate agent handoff using HandoffValidator
   */
  async validateHandoff(sessionId) {
    try {
      // Load session data
      const sessionFile = path.join(
        process.cwd(),
        '.claude',
        'guardrails',
        'sessions',
        `${sessionId}.json`
      );
      const sessionData = JSON.parse(await fs.readFile(sessionFile, 'utf8'));

      // Extract claimed deliverables from session
      const deliverables = sessionData.deliverables || [];

      // Validate handoff
      const validation = await this.validator.validateHandoff(sessionId, deliverables);

      return {
        success: true,
        validation,
        issues: validation.issues || [],
        score: validation.validated ? 100 : 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        issues: [`Handoff validation failed: ${error.message}`],
        score: 0,
      };
    }
  }

  /**
   * Analyze execution tracking data
   */
  async analyzeExecution(sessionId) {
    try {
      const executionReport = await this.tracker.getExecutionReport(sessionId);

      if (!executionReport.verification) {
        return {
          success: false,
          error: 'No verification data available',
          issues: ['Execution tracking incomplete'],
          score: 0,
        };
      }

      const verification = executionReport.verification;
      const issues = verification.summary.issues || [];

      return {
        success: verification.summary.reliable,
        verification,
        toolCallStats: verification.toolCallStats,
        issues,
        score: verification.summary.score || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        issues: [`Execution analysis failed: ${error.message}`],
        score: 0,
      };
    }
  }

  /**
   * Analyze file state changes
   */
  async analyzeFileState(sessionId) {
    try {
      // Find before and after snapshots for this session
      const snapshots = await this.monitor.listSnapshots();
      const sessionSnapshots = snapshots.filter((s) => s.id.includes(sessionId));

      if (sessionSnapshots.length < 2) {
        return {
          success: false,
          error: 'Insufficient snapshots for comparison',
          issues: ['No before/after snapshots available'],
          score: 0,
        };
      }

      // Compare snapshots
      const beforeSnapshot = sessionSnapshots[sessionSnapshots.length - 1]; // Oldest
      const afterSnapshot = sessionSnapshots[0]; // Newest

      const comparison = await this.monitor.compareSnapshots(beforeSnapshot.id, afterSnapshot.id);

      // Load session claims
      const sessionFile = path.join(
        process.cwd(),
        '.claude',
        'guardrails',
        'sessions',
        `${sessionId}.json`
      );
      const sessionData = JSON.parse(await fs.readFile(sessionFile, 'utf8'));
      const claims = sessionData.claims || [];

      // Verify claims against file state
      const verification = await this.monitor.verifyClaims(comparison, claims);

      return {
        success: verification.reliability >= 80,
        comparison,
        verification,
        issues:
          verification.phantomClaims > 0
            ? [`${verification.phantomClaims} phantom claims detected`]
            : [],
        score: verification.reliability,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        issues: [`File state analysis failed: ${error.message}`],
        score: 0,
      };
    }
  }

  /**
   * Verify build functionality
   */
  async verifyBuild() {
    try {
      console.log(`🔨 Running build verification...`);

      // Run type check
      const typeCheckResult = await this.runCommand('npm run type-check');

      // Run lint
      const lintResult = await this.runCommand('npm run lint');

      // Run build
      const buildResult = await this.runCommand('npm run build');

      const issues = [];
      let score = 100;

      if (!typeCheckResult.success) {
        issues.push('TypeScript compilation failed');
        score -= 40;
      }

      if (!lintResult.success) {
        issues.push('ESLint validation failed');
        score -= 30;
      }

      if (!buildResult.success) {
        issues.push('Build process failed');
        score -= 50;
      }

      return {
        success: score >= 70,
        typeCheck: typeCheckResult,
        lint: lintResult,
        build: buildResult,
        issues,
        score: Math.max(0, score),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        issues: [`Build verification failed: ${error.message}`],
        score: 0,
      };
    }
  }

  /**
   * Generate final assessment combining all phases
   */
  async generateFinalAssessment(report) {
    const assessment = {
      agentReliability: 'unknown',
      workQuality: 'unknown',
      executionIntegrity: 'unknown',
      recommendations: [],
      criticalIssues: [],
      strengths: [],
    };

    // Analyze handoff validation
    if (report.phases.handoffValidation?.success) {
      assessment.strengths.push('Handoff validation passed');
    } else {
      assessment.criticalIssues.push('Handoff validation failed');
      assessment.recommendations.push('Review agent deliverable claims process');
    }

    // Analyze execution tracking
    if (report.phases.executionTracking?.success) {
      assessment.strengths.push('Execution tracking verified');
      assessment.executionIntegrity = 'good';
    } else {
      assessment.criticalIssues.push('Execution tracking issues detected');
      assessment.executionIntegrity = 'poor';
      assessment.recommendations.push('Implement stricter tool call monitoring');
    }

    // Analyze file state
    if (report.phases.fileStateAnalysis?.success) {
      assessment.strengths.push('File state changes verified');
      assessment.workQuality = 'good';
    } else {
      assessment.criticalIssues.push('File state verification failed');
      assessment.workQuality = 'poor';
      assessment.recommendations.push('Audit claimed file changes against actual modifications');
    }

    // Analyze build verification
    if (report.phases.buildVerification) {
      if (report.phases.buildVerification.success) {
        assessment.strengths.push('Build verification passed');
      } else {
        assessment.criticalIssues.push('Build verification failed');
        assessment.recommendations.push('Fix build errors before deployment');
      }
    }

    // Determine overall agent reliability
    const successCount = Object.values(report.phases).filter((phase) => phase?.success).length;
    const totalPhases = Object.values(report.phases).filter((phase) => phase !== null).length;
    const successRate = totalPhases > 0 ? (successCount / totalPhases) * 100 : 0;

    if (successRate >= 90) {
      assessment.agentReliability = 'excellent';
    } else if (successRate >= 80) {
      assessment.agentReliability = 'good';
    } else if (successRate >= 60) {
      assessment.agentReliability = 'acceptable';
    } else {
      assessment.agentReliability = 'poor';
    }

    return assessment;
  }

  /**
   * Calculate final verification score
   */
  calculateFinalScore(report) {
    const phases = Object.values(report.phases).filter((phase) => phase !== null);
    const scores = phases.map((phase) => phase.score || 0);

    if (scores.length === 0) {
      report.summary.score = 0;
      report.summary.passed = false;
      return;
    }

    // Weighted average (handoff and execution tracking are more important)
    const weights = {
      handoffValidation: 0.3,
      executionTracking: 0.3,
      fileStateAnalysis: 0.25,
      buildVerification: 0.15,
    };

    let weightedScore = 0;
    let totalWeight = 0;

    for (const [phaseName, phase] of Object.entries(report.phases)) {
      if (phase !== null) {
        const weight = weights[phaseName] || 0.1;
        weightedScore += (phase.score || 0) * weight;
        totalWeight += weight;
      }
    }

    report.summary.score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
    report.summary.passed =
      report.summary.score >= 70 && report.phases.finalAssessment.criticalIssues.length === 0;

    // Collect all issues
    for (const phase of phases) {
      if (phase.issues) {
        report.summary.issues.push(...phase.issues);
      }
    }

    // Add recommendations
    if (report.phases.finalAssessment?.recommendations) {
      report.summary.recommendations.push(...report.phases.finalAssessment.recommendations);
    }
  }

  /**
   * Run a command and capture result
   */
  async runCommand(command) {
    try {
      const output = execSync(command, {
        encoding: 'utf8',
        timeout: 30000,
        maxBuffer: 1024 * 1024,
      });

      return {
        success: true,
        command,
        output: output.trim(),
        exitCode: 0,
      };
    } catch (error) {
      return {
        success: false,
        command,
        output: error.stdout || '',
        error: error.stderr || error.message,
        exitCode: error.status || 1,
      };
    }
  }

  /**
   * Save verification report
   */
  async saveVerificationReport(sessionId, report) {
    const reportFile = path.join(this.reportsDir, `verification-${sessionId}.json`);
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));

    // Also save a summary report
    const summaryFile = path.join(this.reportsDir, `summary-${sessionId}.json`);
    await fs.writeFile(
      summaryFile,
      JSON.stringify(
        {
          sessionId,
          timestamp: report.timestamp,
          passed: report.summary.passed,
          score: report.summary.score,
          agentReliability: report.phases.finalAssessment?.agentReliability,
          criticalIssues: report.phases.finalAssessment?.criticalIssues.length || 0,
          recommendations: report.summary.recommendations.length,
        },
        null,
        2
      )
    );
  }

  /**
   * Display verification results
   */
  displayResults(report) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 AGENT VERIFICATION REPORT: ${report.sessionId}`);
    console.log(`${'='.repeat(60)}`);

    console.log(`\n📊 OVERALL RESULT:`);
    console.log(`   Status: ${report.summary.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Score: ${report.summary.score}/100`);
    console.log(
      `   Agent Reliability: ${report.phases.finalAssessment?.agentReliability?.toUpperCase() || 'UNKNOWN'}`
    );

    console.log(`\n📋 PHASE RESULTS:`);
    for (const [phaseName, phase] of Object.entries(report.phases)) {
      if (phase !== null) {
        const status = phase.success ? '✅' : '❌';
        const score = phase.score !== undefined ? ` (${phase.score}/100)` : '';
        console.log(`   ${phaseName}: ${status}${score}`);
      }
    }

    if (report.summary.issues.length > 0) {
      console.log(`\n⚠️  ISSUES FOUND:`);
      report.summary.issues.forEach((issue) => console.log(`   - ${issue}`));
    }

    if (report.phases.finalAssessment?.strengths?.length > 0) {
      console.log(`\n✅ STRENGTHS:`);
      report.phases.finalAssessment.strengths.forEach((strength) =>
        console.log(`   - ${strength}`)
      );
    }

    if (report.summary.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS:`);
      report.summary.recommendations.forEach((rec) => console.log(`   - ${rec}`));
    }

    console.log(`\n${'='.repeat(60)}\n`);
  }

  /**
   * Quick verification for recent sessions
   */
  async quickVerify(count = 5) {
    const reports = await this.tracker.getAllReports();
    const recentSessions = reports.slice(0, count);

    console.log(`🔍 Quick verification of ${recentSessions.length} recent sessions:\n`);

    for (const session of recentSessions) {
      const result = await this.verifyAgent(session.sessionId, { verifyBuild: false });
      console.log(
        `${session.sessionId}: ${result.summary.passed ? '✅' : '❌'} (${result.summary.score}/100)`
      );
    }
  }

  /**
   * Generate reliability dashboard data
   */
  async generateDashboard() {
    const reports = await this.tracker.getAllReports();
    const verificationReports = [];

    // Load all verification reports
    for (const session of reports) {
      try {
        const reportFile = path.join(this.reportsDir, `summary-${session.sessionId}.json`);
        const summary = JSON.parse(await fs.readFile(reportFile, 'utf8'));
        verificationReports.push(summary);
      } catch {
        // Skip missing reports
      }
    }

    // Calculate dashboard metrics
    const dashboard = {
      totalSessions: verificationReports.length,
      passedSessions: verificationReports.filter((r) => r.passed).length,
      averageScore:
        verificationReports.length > 0
          ? Math.round(
              verificationReports.reduce((sum, r) => sum + r.score, 0) / verificationReports.length
            )
          : 0,
      reliabilityTrend: this.calculateReliabilityTrend(verificationReports),
      agentReliabilityDistribution: this.calculateAgentReliabilityDistribution(verificationReports),
      recentSessions: verificationReports.slice(0, 10),
    };

    dashboard.passRate =
      dashboard.totalSessions > 0
        ? Math.round((dashboard.passedSessions / dashboard.totalSessions) * 100)
        : 0;

    return dashboard;
  }

  /**
   * Calculate reliability trend over time
   */
  calculateReliabilityTrend(reports) {
    const sortedReports = reports.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const batchSize = Math.max(1, Math.floor(sortedReports.length / 10));
    const trend = [];

    for (let i = 0; i < sortedReports.length; i += batchSize) {
      const batch = sortedReports.slice(i, i + batchSize);
      const avgScore = batch.reduce((sum, r) => sum + r.score, 0) / batch.length;
      trend.push({
        period: i / batchSize + 1,
        averageScore: Math.round(avgScore),
        sessionCount: batch.length,
      });
    }

    return trend;
  }

  /**
   * Calculate agent reliability distribution
   */
  calculateAgentReliabilityDistribution(reports) {
    const distribution = {
      excellent: 0,
      good: 0,
      acceptable: 0,
      poor: 0,
    };

    for (const report of reports) {
      const reliability = report.agentReliability || 'poor';
      if (distribution.hasOwnProperty(reliability)) {
        distribution[reliability]++;
      }
    }

    return distribution;
  }
}

// CLI interface
if (require.main === module) {
  const [, , command, ...args] = process.argv;
  const cli = new AgentVerificationCLI();

  cli.init().then(() => {
    switch (command) {
      case 'verify':
        const [sessionId, ...options] = args;
        const verifyOptions = {
          verifyBuild: options.includes('--build'),
        };
        cli.verifyAgent(sessionId, verifyOptions);
        break;

      case 'quick':
        const [count] = args;
        cli.quickVerify(count ? parseInt(count) : 5);
        break;

      case 'dashboard':
        cli.generateDashboard().then((dashboard) => {
          console.log(JSON.stringify(dashboard, null, 2));
        });
        break;

      default:
        console.log(`
Usage: verify-agent.js <command> [args]

Commands:
  verify <sessionId> [--build]    Comprehensive agent verification
  quick [count]                   Quick verification of recent sessions
  dashboard                       Generate reliability dashboard data

Examples:
  verify-agent.js verify abc123-def456 --build
  verify-agent.js quick 10
  verify-agent.js dashboard
        `);
    }
  });
}

module.exports = AgentVerificationCLI;
