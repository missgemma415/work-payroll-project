#!/usr/bin/env node

/**
 * Reliability Scoring System
 *
 * Tracks and analyzes agent reliability metrics over time
 * Provides insights into agent performance patterns and trends
 */

const fs = require('fs').promises;
const path = require('path');

class ReliabilityMetrics {
  constructor() {
    this.metricsDir = path.join(process.cwd(), '.claude', 'guardrails', 'metrics');
    this.dailyMetricsFile = path.join(this.metricsDir, 'daily-metrics.json');
    this.agentScoresFile = path.join(this.metricsDir, 'agent-scores.json');
    this.trendsFile = path.join(this.metricsDir, 'trends.json');
    this.init();
  }

  async init() {
    await fs.mkdir(this.metricsDir, { recursive: true });

    // Initialize metrics files
    await this.initializeFile(this.dailyMetricsFile, { dates: {} });
    await this.initializeFile(this.agentScoresFile, { agents: {} });
    await this.initializeFile(this.trendsFile, { trends: [], lastUpdated: null });
  }

  async initializeFile(filePath, defaultContent) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2));
    }
  }

  /**
   * Record agent session metrics
   */
  async recordSession(sessionData) {
    const {
      sessionId,
      agentType,
      success,
      score,
      timestamp,
      executionTime,
      toolCallsCount,
      claimsCount,
      verifiedClaims,
      phantomClaims,
      issues = [],
    } = sessionData;

    const date = timestamp.split('T')[0];

    // Update daily metrics
    await this.updateDailyMetrics(date, agentType, sessionData);

    // Update agent scores
    await this.updateAgentScores(agentType, sessionData);

    // Trigger trend analysis
    await this.updateTrends();

    console.log(
      `📊 Recorded metrics for ${agentType} session: ${success ? '✅' : '❌'} (${score}/100)`
    );
  }

  /**
   * Update daily metrics
   */
  async updateDailyMetrics(date, agentType, sessionData) {
    const dailyMetrics = JSON.parse(await fs.readFile(this.dailyMetricsFile, 'utf8'));

    if (!dailyMetrics.dates[date]) {
      dailyMetrics.dates[date] = {
        totalSessions: 0,
        successfulSessions: 0,
        averageScore: 0,
        agents: {},
        issues: [],
        totalExecutionTime: 0,
        totalToolCalls: 0,
        totalClaims: 0,
        totalVerifiedClaims: 0,
        totalPhantomClaims: 0,
      };
    }

    const dayData = dailyMetrics.dates[date];

    // Update daily totals
    dayData.totalSessions++;
    if (sessionData.success) dayData.successfulSessions++;
    dayData.totalExecutionTime += sessionData.executionTime || 0;
    dayData.totalToolCalls += sessionData.toolCallsCount || 0;
    dayData.totalClaims += sessionData.claimsCount || 0;
    dayData.totalVerifiedClaims += sessionData.verifiedClaims || 0;
    dayData.totalPhantomClaims += sessionData.phantomClaims || 0;

    // Update agent-specific daily data
    if (!dayData.agents[agentType]) {
      dayData.agents[agentType] = {
        sessions: 0,
        successfulSessions: 0,
        averageScore: 0,
        scores: [],
      };
    }

    const agentDayData = dayData.agents[agentType];
    agentDayData.sessions++;
    if (sessionData.success) agentDayData.successfulSessions++;
    agentDayData.scores.push(sessionData.score);
    agentDayData.averageScore =
      agentDayData.scores.reduce((sum, s) => sum + s, 0) / agentDayData.scores.length;

    // Calculate overall daily average
    const allScores = Object.values(dayData.agents).flatMap((agent) => agent.scores);
    dayData.averageScore =
      allScores.length > 0 ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length : 0;

    // Add issues
    if (sessionData.issues && sessionData.issues.length > 0) {
      dayData.issues.push(
        ...sessionData.issues.map((issue) => ({
          agentType,
          sessionId: sessionData.sessionId,
          issue,
        }))
      );
    }

    await fs.writeFile(this.dailyMetricsFile, JSON.stringify(dailyMetrics, null, 2));
  }

  /**
   * Update agent reliability scores
   */
  async updateAgentScores(agentType, sessionData) {
    const agentScores = JSON.parse(await fs.readFile(this.agentScoresFile, 'utf8'));

    if (!agentScores.agents[agentType]) {
      agentScores.agents[agentType] = {
        totalSessions: 0,
        successfulSessions: 0,
        failedSessions: 0,
        averageScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastSuccess: null,
        lastFailure: null,
        reliabilityTier: 'unrated',
        sessionHistory: [],
        issues: {
          phantomWork: 0,
          buildFailures: 0,
          claimMismatches: 0,
          toolCallFailures: 0,
        },
        performance: {
          averageExecutionTime: 0,
          averageToolCalls: 0,
          averageClaimsAccuracy: 0,
        },
      };
    }

    const agent = agentScores.agents[agentType];

    // Update basic stats
    agent.totalSessions++;
    if (sessionData.success) {
      agent.successfulSessions++;
      agent.currentStreak++;
      agent.longestStreak = Math.max(agent.longestStreak, agent.currentStreak);
      agent.lastSuccess = sessionData.timestamp;
    } else {
      agent.failedSessions++;
      agent.currentStreak = 0;
      agent.lastFailure = sessionData.timestamp;
    }

    // Update session history (keep last 20)
    agent.sessionHistory.unshift({
      sessionId: sessionData.sessionId,
      timestamp: sessionData.timestamp,
      success: sessionData.success,
      score: sessionData.score,
      issues: sessionData.issues?.length || 0,
    });

    if (agent.sessionHistory.length > 20) {
      agent.sessionHistory = agent.sessionHistory.slice(0, 20);
    }

    // Calculate average score
    const recentScores = agent.sessionHistory.map((s) => s.score);
    agent.averageScore =
      recentScores.length > 0
        ? Math.round(recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length)
        : 0;

    // Update performance metrics
    if (sessionData.executionTime) {
      agent.performance.averageExecutionTime = this.calculateRunningAverage(
        agent.performance.averageExecutionTime,
        sessionData.executionTime,
        agent.totalSessions
      );
    }

    if (sessionData.toolCallsCount) {
      agent.performance.averageToolCalls = this.calculateRunningAverage(
        agent.performance.averageToolCalls,
        sessionData.toolCallsCount,
        agent.totalSessions
      );
    }

    if (sessionData.claimsCount && sessionData.verifiedClaims !== undefined) {
      const accuracy =
        sessionData.claimsCount > 0
          ? (sessionData.verifiedClaims / sessionData.claimsCount) * 100
          : 100;
      agent.performance.averageClaimsAccuracy = this.calculateRunningAverage(
        agent.performance.averageClaimsAccuracy,
        accuracy,
        agent.totalSessions
      );
    }

    // Update issue tracking
    if (sessionData.phantomClaims > 0) {
      agent.issues.phantomWork += sessionData.phantomClaims;
    }

    // Determine reliability tier
    agent.reliabilityTier = this.calculateReliabilityTier(agent);

    await fs.writeFile(this.agentScoresFile, JSON.stringify(agentScores, null, 2));
  }

  /**
   * Calculate reliability tier based on performance
   */
  calculateReliabilityTier(agent) {
    const successRate =
      agent.totalSessions > 0 ? (agent.successfulSessions / agent.totalSessions) * 100 : 0;

    const claimsAccuracy = agent.performance.averageClaimsAccuracy;
    const averageScore = agent.averageScore;

    // Tier calculation based on multiple factors
    if (
      successRate >= 95 &&
      claimsAccuracy >= 95 &&
      averageScore >= 90 &&
      agent.currentStreak >= 5
    ) {
      return 'platinum';
    } else if (successRate >= 90 && claimsAccuracy >= 90 && averageScore >= 85) {
      return 'gold';
    } else if (successRate >= 80 && claimsAccuracy >= 80 && averageScore >= 75) {
      return 'silver';
    } else if (successRate >= 70 && claimsAccuracy >= 70 && averageScore >= 65) {
      return 'bronze';
    } else if (successRate >= 50) {
      return 'developing';
    } else {
      return 'problematic';
    }
  }

  /**
   * Calculate running average
   */
  calculateRunningAverage(currentAverage, newValue, totalCount) {
    return (currentAverage * (totalCount - 1) + newValue) / totalCount;
  }

  /**
   * Update trend analysis
   */
  async updateTrends() {
    const trends = JSON.parse(await fs.readFile(this.trendsFile, 'utf8'));
    const dailyMetrics = JSON.parse(await fs.readFile(this.dailyMetricsFile, 'utf8'));
    const agentScores = JSON.parse(await fs.readFile(this.agentScoresFile, 'utf8'));

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Calculate 7-day and 30-day trends
    const sevenDayTrend = this.calculatePeriodTrend(dailyMetrics, 7);
    const thirtyDayTrend = this.calculatePeriodTrend(dailyMetrics, 30);

    // Agent performance trends
    const agentTrends = this.calculateAgentTrends(agentScores);

    // Issue trends
    const issueTrends = this.calculateIssueTrends(dailyMetrics, 30);

    const newTrend = {
      date: today,
      timestamp: now.toISOString(),
      sevenDay: sevenDayTrend,
      thirtyDay: thirtyDayTrend,
      agents: agentTrends,
      issues: issueTrends,
      summary: {
        overallReliability: this.calculateOverallReliability(agentScores),
        topPerformers: this.getTopPerformers(agentScores),
        concerningAgents: this.getConcerningAgents(agentScores),
        emergingIssues: this.getEmergingIssues(issueTrends),
      },
    };

    // Add to trends (keep last 30 days)
    trends.trends.unshift(newTrend);
    if (trends.trends.length > 30) {
      trends.trends = trends.trends.slice(0, 30);
    }

    trends.lastUpdated = now.toISOString();

    await fs.writeFile(this.trendsFile, JSON.stringify(trends, null, 2));
  }

  /**
   * Calculate trend for a specific period
   */
  calculatePeriodTrend(dailyMetrics, days) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

    let totalSessions = 0;
    let successfulSessions = 0;
    let totalScore = 0;
    let scoreCount = 0;
    let totalIssues = 0;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayData = dailyMetrics.dates[dateStr];

      if (dayData) {
        totalSessions += dayData.totalSessions;
        successfulSessions += dayData.successfulSessions;
        if (dayData.averageScore > 0) {
          totalScore += dayData.averageScore;
          scoreCount++;
        }
        totalIssues += dayData.issues.length;
      }
    }

    return {
      period: `${days} days`,
      totalSessions,
      successRate: totalSessions > 0 ? (successfulSessions / totalSessions) * 100 : 0,
      averageScore: scoreCount > 0 ? totalScore / scoreCount : 0,
      totalIssues,
      averageIssuesPerDay: totalIssues / days,
    };
  }

  /**
   * Calculate agent-specific trends
   */
  calculateAgentTrends(agentScores) {
    const trends = {};

    for (const [agentType, agent] of Object.entries(agentScores.agents)) {
      const recentSessions = agent.sessionHistory.slice(0, 10);
      const olderSessions = agent.sessionHistory.slice(10, 20);

      const recentSuccess =
        recentSessions.length > 0
          ? (recentSessions.filter((s) => s.success).length / recentSessions.length) * 100
          : 0;

      const olderSuccess =
        olderSessions.length > 0
          ? (olderSessions.filter((s) => s.success).length / olderSessions.length) * 100
          : recentSuccess;

      const recentScore =
        recentSessions.length > 0
          ? recentSessions.reduce((sum, s) => sum + s.score, 0) / recentSessions.length
          : 0;

      const olderScore =
        olderSessions.length > 0
          ? olderSessions.reduce((sum, s) => sum + s.score, 0) / olderSessions.length
          : recentScore;

      trends[agentType] = {
        reliabilityTier: agent.reliabilityTier,
        currentStreak: agent.currentStreak,
        successRateTrend: recentSuccess - olderSuccess,
        scoreTrend: recentScore - olderScore,
        direction: this.calculateTrendDirection(
          recentSuccess,
          olderSuccess,
          recentScore,
          olderScore
        ),
        recentPerformance: {
          successRate: recentSuccess,
          averageScore: recentScore,
          sessions: recentSessions.length,
        },
      };
    }

    return trends;
  }

  /**
   * Calculate issue trends
   */
  calculateIssueTrends(dailyMetrics, days) {
    const issueTypes = {};
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayData = dailyMetrics.dates[dateStr];

      if (dayData && dayData.issues) {
        for (const issueRecord of dayData.issues) {
          const issueKey = this.categorizeIssue(issueRecord.issue);
          if (!issueTypes[issueKey]) {
            issueTypes[issueKey] = {
              count: 0,
              agents: new Set(),
              recentOccurrences: [],
            };
          }
          issueTypes[issueKey].count++;
          issueTypes[issueKey].agents.add(issueRecord.agentType);
          issueTypes[issueKey].recentOccurrences.push({
            date: dateStr,
            agent: issueRecord.agentType,
            session: issueRecord.sessionId,
          });
        }
      }
    }

    // Convert Sets to Arrays for JSON serialization
    for (const issueType of Object.values(issueTypes)) {
      issueType.agents = Array.from(issueType.agents);
      issueType.recentOccurrences = issueType.recentOccurrences.slice(-5); // Keep last 5
    }

    return issueTypes;
  }

  /**
   * Categorize issues for trend analysis
   */
  categorizeIssue(issue) {
    const lowerIssue = issue.toLowerCase();

    if (lowerIssue.includes('phantom') || lowerIssue.includes('claim')) {
      return 'phantom_work';
    } else if (lowerIssue.includes('build') || lowerIssue.includes('compilation')) {
      return 'build_failures';
    } else if (lowerIssue.includes('tool') || lowerIssue.includes('execution')) {
      return 'tool_failures';
    } else if (lowerIssue.includes('file') || lowerIssue.includes('modification')) {
      return 'file_issues';
    } else {
      return 'other';
    }
  }

  /**
   * Calculate trend direction
   */
  calculateTrendDirection(recentSuccess, olderSuccess, recentScore, olderScore) {
    const successImprovement = recentSuccess - olderSuccess;
    const scoreImprovement = recentScore - olderScore;

    if (successImprovement > 5 && scoreImprovement > 5) {
      return 'improving';
    } else if (successImprovement < -5 && scoreImprovement < -5) {
      return 'declining';
    } else {
      return 'stable';
    }
  }

  /**
   * Calculate overall system reliability
   */
  calculateOverallReliability(agentScores) {
    const agents = Object.values(agentScores.agents);
    if (agents.length === 0) return 0;

    const totalSessions = agents.reduce((sum, agent) => sum + agent.totalSessions, 0);
    const totalSuccessful = agents.reduce((sum, agent) => sum + agent.successfulSessions, 0);
    const averageScore = agents.reduce((sum, agent) => sum + agent.averageScore, 0) / agents.length;

    return {
      overallSuccessRate: totalSessions > 0 ? (totalSuccessful / totalSessions) * 100 : 0,
      averageScore: Math.round(averageScore),
      totalAgents: agents.length,
      totalSessions,
    };
  }

  /**
   * Get top performing agents
   */
  getTopPerformers(agentScores, limit = 3) {
    return Object.entries(agentScores.agents)
      .map(([type, agent]) => ({
        agentType: type,
        reliabilityTier: agent.reliabilityTier,
        successRate:
          agent.totalSessions > 0 ? (agent.successfulSessions / agent.totalSessions) * 100 : 0,
        averageScore: agent.averageScore,
        currentStreak: agent.currentStreak,
      }))
      .sort((a, b) => {
        // Sort by reliability tier first, then by average score
        const tierOrder = {
          platinum: 5,
          gold: 4,
          silver: 3,
          bronze: 2,
          developing: 1,
          problematic: 0,
        };
        const aTier = tierOrder[a.reliabilityTier] || 0;
        const bTier = tierOrder[b.reliabilityTier] || 0;

        if (aTier !== bTier) return bTier - aTier;
        return b.averageScore - a.averageScore;
      })
      .slice(0, limit);
  }

  /**
   * Get concerning agents that need attention
   */
  getConcerningAgents(agentScores, limit = 3) {
    return Object.entries(agentScores.agents)
      .map(([type, agent]) => ({
        agentType: type,
        reliabilityTier: agent.reliabilityTier,
        successRate:
          agent.totalSessions > 0 ? (agent.successfulSessions / agent.totalSessions) * 100 : 0,
        averageScore: agent.averageScore,
        recentFailures: agent.failedSessions,
        phantomWork: agent.issues.phantomWork,
      }))
      .filter(
        (agent) =>
          agent.reliabilityTier === 'problematic' ||
          agent.successRate < 70 ||
          agent.averageScore < 60 ||
          agent.phantomWork > 0
      )
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, limit);
  }

  /**
   * Get emerging issues
   */
  getEmergingIssues(issueTrends, threshold = 3) {
    return Object.entries(issueTrends)
      .filter(([type, data]) => data.count >= threshold)
      .map(([type, data]) => ({
        issueType: type,
        occurrences: data.count,
        affectedAgents: data.agents.length,
        agents: data.agents,
      }))
      .sort((a, b) => b.occurrences - a.occurrences);
  }

  /**
   * Generate comprehensive reliability report
   */
  async generateReport() {
    const agentScores = JSON.parse(await fs.readFile(this.agentScoresFile, 'utf8'));
    const trends = JSON.parse(await fs.readFile(this.trendsFile, 'utf8'));
    const latestTrend = trends.trends[0];

    return {
      timestamp: new Date().toISOString(),
      overview: latestTrend?.summary?.overallReliability || {},
      topPerformers: latestTrend?.summary?.topPerformers || [],
      concerningAgents: latestTrend?.summary?.concerningAgents || [],
      emergingIssues: latestTrend?.summary?.emergingIssues || [],
      trends: {
        sevenDay: latestTrend?.sevenDay || {},
        thirtyDay: latestTrend?.thirtyDay || {},
        agents: latestTrend?.agents || {},
      },
      recommendations: this.generateRecommendations(latestTrend),
    };
  }

  /**
   * Generate recommendations based on current metrics
   */
  generateRecommendations(latestTrend) {
    const recommendations = [];

    if (!latestTrend) return recommendations;

    // Check overall reliability
    if (latestTrend.summary.overallReliability.overallSuccessRate < 80) {
      recommendations.push({
        priority: 'high',
        category: 'reliability',
        message:
          'Overall agent success rate is below 80%. Review agent training and validation processes.',
      });
    }

    // Check for problematic agents
    if (latestTrend.summary.concerningAgents.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'agents',
        message: `${latestTrend.summary.concerningAgents.length} agents need attention. Consider additional training or process improvements.`,
      });
    }

    // Check for emerging issues
    if (latestTrend.summary.emergingIssues.length > 0) {
      const topIssue = latestTrend.summary.emergingIssues[0];
      recommendations.push({
        priority: 'medium',
        category: 'issues',
        message: `Emerging issue detected: ${topIssue.issueType} (${topIssue.occurrences} occurrences). Investigate root cause.`,
      });
    }

    // Check trend direction
    const decliningAgents = Object.entries(latestTrend.agents || {}).filter(
      ([, agent]) => agent.direction === 'declining'
    ).length;

    if (decliningAgents > 0) {
      recommendations.push({
        priority: 'low',
        category: 'trends',
        message: `${decliningAgents} agents showing declining performance. Monitor closely.`,
      });
    }

    return recommendations;
  }
}

// CLI interface
if (require.main === module) {
  const [, , command, ...args] = process.argv;
  const metrics = new ReliabilityMetrics();

  switch (command) {
    case 'record':
      const [sessionDataJson] = args;
      const sessionData = JSON.parse(sessionDataJson);
      metrics.recordSession(sessionData);
      break;

    case 'report':
      metrics.generateReport().then((report) => {
        console.log(JSON.stringify(report, null, 2));
      });
      break;

    case 'trends':
      metrics.updateTrends().then(() => {
        console.log('Trends updated successfully');
      });
      break;

    default:
      console.log(`
Usage: reliability-metrics.js <command> [args]

Commands:
  record <sessionDataJson>    Record metrics for a session
  report                      Generate comprehensive reliability report
  trends                      Update trend analysis

Example:
  reliability-metrics.js record '{"sessionId":"abc123","agentType":"test","success":true,"score":85}'
      `);
  }
}

module.exports = ReliabilityMetrics;
