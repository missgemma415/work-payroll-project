#!/usr/bin/env node

/**
 * File State Monitor
 *
 * Monitors file system changes and detects phantom file claims
 * Provides before/after comparisons and content verification
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

class FileStateMonitor {
  constructor() {
    this.snapshotsDir = path.join(process.cwd(), '.claude', 'guardrails', 'snapshots');
    this.workingDir = process.cwd();
    this.init();
  }

  async init() {
    await fs.mkdir(this.snapshotsDir, { recursive: true });
  }

  /**
   * Create a complete file system snapshot
   */
  async createSnapshot(snapshotId = null) {
    if (!snapshotId) {
      snapshotId = this.generateSnapshotId();
    }

    console.log(`📸 Creating file system snapshot: ${snapshotId}`);

    const snapshot = {
      id: snapshotId,
      timestamp: new Date().toISOString(),
      files: {},
      directories: new Set(),
      gitStatus: await this.getGitStatus(),
      totalFiles: 0,
      totalSize: 0,
    };

    // Get all tracked files
    const trackedFiles = await this.getTrackedFiles();

    for (const filePath of trackedFiles) {
      try {
        const fileInfo = await this.getFileInfo(filePath);
        snapshot.files[filePath] = fileInfo;
        snapshot.totalFiles++;
        snapshot.totalSize += fileInfo.size;

        // Track directory
        const dirPath = path.dirname(filePath);
        snapshot.directories.add(dirPath);
      } catch (error) {
        console.warn(`⚠️  Could not read file: ${filePath} - ${error.message}`);
      }
    }

    // Convert Set to Array for JSON serialization
    snapshot.directories = Array.from(snapshot.directories);

    // Save snapshot
    const snapshotFile = path.join(this.snapshotsDir, `${snapshotId}.json`);
    await fs.writeFile(snapshotFile, JSON.stringify(snapshot, null, 2));

    console.log(
      `✅ Snapshot created: ${snapshot.totalFiles} files, ${this.formatBytes(snapshot.totalSize)}`
    );
    return snapshot;
  }

  /**
   * Compare two snapshots and detect changes
   */
  async compareSnapshots(beforeSnapshotId, afterSnapshotId) {
    const beforeSnapshot = await this.loadSnapshot(beforeSnapshotId);
    const afterSnapshot = await this.loadSnapshot(afterSnapshotId);

    console.log(`🔍 Comparing snapshots: ${beforeSnapshotId} → ${afterSnapshotId}`);

    const comparison = {
      beforeSnapshot: beforeSnapshotId,
      afterSnapshot: afterSnapshotId,
      timestamp: new Date().toISOString(),
      changes: {
        filesCreated: [],
        filesModified: [],
        filesDeleted: [],
        directoriesCreated: [],
        directoriesDeleted: [],
      },
      statistics: {
        totalChangeFiles: 0,
        totalSizeChange: afterSnapshot.totalSize - beforeSnapshot.totalSize,
        netFileChange: afterSnapshot.totalFiles - beforeSnapshot.totalFiles,
      },
      verification: {
        phantomClaims: [],
        verifiedChanges: [],
        suspiciousPatterns: [],
      },
    };

    // Find created files
    for (const [filePath, fileInfo] of Object.entries(afterSnapshot.files)) {
      if (!beforeSnapshot.files[filePath]) {
        comparison.changes.filesCreated.push({
          path: filePath,
          size: fileInfo.size,
          hash: fileInfo.hash,
          created: fileInfo.mtime,
        });
      }
    }

    // Find modified files
    for (const [filePath, beforeInfo] of Object.entries(beforeSnapshot.files)) {
      const afterInfo = afterSnapshot.files[filePath];
      if (afterInfo && beforeInfo.hash !== afterInfo.hash) {
        comparison.changes.filesModified.push({
          path: filePath,
          beforeHash: beforeInfo.hash,
          afterHash: afterInfo.hash,
          sizeChange: afterInfo.size - beforeInfo.size,
          modified: afterInfo.mtime,
        });
      }
    }

    // Find deleted files
    for (const [filePath, fileInfo] of Object.entries(beforeSnapshot.files)) {
      if (!afterSnapshot.files[filePath]) {
        comparison.changes.filesDeleted.push({
          path: filePath,
          size: fileInfo.size,
          hash: fileInfo.hash,
          deleted: new Date().toISOString(),
        });
      }
    }

    // Find directory changes
    const beforeDirs = new Set(beforeSnapshot.directories);
    const afterDirs = new Set(afterSnapshot.directories);

    for (const dir of afterDirs) {
      if (!beforeDirs.has(dir)) {
        comparison.changes.directoriesCreated.push(dir);
      }
    }

    for (const dir of beforeDirs) {
      if (!afterDirs.has(dir)) {
        comparison.changes.directoriesDeleted.push(dir);
      }
    }

    comparison.statistics.totalChangeFiles =
      comparison.changes.filesCreated.length +
      comparison.changes.filesModified.length +
      comparison.changes.filesDeleted.length;

    // Save comparison
    const comparisonFile = path.join(
      this.snapshotsDir,
      `comparison-${beforeSnapshotId}-${afterSnapshotId}.json`
    );
    await fs.writeFile(comparisonFile, JSON.stringify(comparison, null, 2));

    console.log(`📊 Comparison complete: ${comparison.statistics.totalChangeFiles} files changed`);
    return comparison;
  }

  /**
   * Verify claimed changes against actual file system changes
   */
  async verifyClaims(comparison, claims) {
    console.log(`🔍 Verifying ${claims.length} claims against file system changes`);

    const verification = {
      totalClaims: claims.length,
      verifiedClaims: 0,
      phantomClaims: 0,
      incorrectClaims: 0,
      details: [],
    };

    for (const claim of claims) {
      const claimVerification = await this.verifyClaim(claim, comparison);
      verification.details.push(claimVerification);

      if (claimVerification.status === 'verified') {
        verification.verifiedClaims++;
      } else if (claimVerification.status === 'phantom') {
        verification.phantomClaims++;
      } else {
        verification.incorrectClaims++;
      }
    }

    // Check for unreported changes
    const unreportedChanges = await this.findUnreportedChanges(comparison, claims);
    if (unreportedChanges.length > 0) {
      verification.unreportedChanges = unreportedChanges;
    }

    verification.reliability =
      verification.totalClaims > 0
        ? (verification.verifiedClaims / verification.totalClaims) * 100
        : 100;

    return verification;
  }

  /**
   * Verify a single claim against file system changes
   */
  async verifyClaim(claim, comparison) {
    const { type, path: claimPath, description } = claim;

    switch (type) {
      case 'file_created':
        return this.verifyFileCreatedClaim(claimPath, comparison);
      case 'file_modified':
        return this.verifyFileModifiedClaim(claimPath, comparison);
      case 'file_deleted':
        return this.verifyFileDeletedClaim(claimPath, comparison);
      case 'directory_created':
        return this.verifyDirectoryCreatedClaim(claimPath, comparison);
      default:
        return {
          claim,
          status: 'unknown',
          reason: `Unknown claim type: ${type}`,
        };
    }
  }

  /**
   * Verify file creation claim
   */
  verifyFileCreatedClaim(claimPath, comparison) {
    const created = comparison.changes.filesCreated.find((f) => f.path === claimPath);

    if (created) {
      return {
        claim: { type: 'file_created', path: claimPath },
        status: 'verified',
        reason: 'File creation confirmed by file system',
        details: created,
      };
    }

    // Check if file was modified instead
    const modified = comparison.changes.filesModified.find((f) => f.path === claimPath);
    if (modified) {
      return {
        claim: { type: 'file_created', path: claimPath },
        status: 'incorrect',
        reason: 'Claimed file creation but file was modified',
        details: modified,
      };
    }

    return {
      claim: { type: 'file_created', path: claimPath },
      status: 'phantom',
      reason: 'No file creation detected in file system',
      details: null,
    };
  }

  /**
   * Verify file modification claim
   */
  verifyFileModifiedClaim(claimPath, comparison) {
    const modified = comparison.changes.filesModified.find((f) => f.path === claimPath);

    if (modified) {
      return {
        claim: { type: 'file_modified', path: claimPath },
        status: 'verified',
        reason: 'File modification confirmed by file system',
        details: modified,
      };
    }

    // Check if file was created instead
    const created = comparison.changes.filesCreated.find((f) => f.path === claimPath);
    if (created) {
      return {
        claim: { type: 'file_modified', path: claimPath },
        status: 'incorrect',
        reason: 'Claimed file modification but file was created',
        details: created,
      };
    }

    return {
      claim: { type: 'file_modified', path: claimPath },
      status: 'phantom',
      reason: 'No file modification detected in file system',
      details: null,
    };
  }

  /**
   * Verify file deletion claim
   */
  verifyFileDeletedClaim(claimPath, comparison) {
    const deleted = comparison.changes.filesDeleted.find((f) => f.path === claimPath);

    if (deleted) {
      return {
        claim: { type: 'file_deleted', path: claimPath },
        status: 'verified',
        reason: 'File deletion confirmed by file system',
        details: deleted,
      };
    }

    return {
      claim: { type: 'file_deleted', path: claimPath },
      status: 'phantom',
      reason: 'No file deletion detected in file system',
      details: null,
    };
  }

  /**
   * Verify directory creation claim
   */
  verifyDirectoryCreatedClaim(claimPath, comparison) {
    const created = comparison.changes.directoriesCreated.includes(claimPath);

    if (created) {
      return {
        claim: { type: 'directory_created', path: claimPath },
        status: 'verified',
        reason: 'Directory creation confirmed by file system',
        details: { path: claimPath },
      };
    }

    return {
      claim: { type: 'directory_created', path: claimPath },
      status: 'phantom',
      reason: 'No directory creation detected in file system',
      details: null,
    };
  }

  /**
   * Find changes that weren't reported in claims
   */
  async findUnreportedChanges(comparison, claims) {
    const unreported = [];
    const claimedPaths = new Set(claims.map((c) => c.path));

    // Check unreported file creations
    for (const created of comparison.changes.filesCreated) {
      if (!claimedPaths.has(created.path)) {
        unreported.push({
          type: 'unreported_creation',
          path: created.path,
          details: created,
        });
      }
    }

    // Check unreported file modifications
    for (const modified of comparison.changes.filesModified) {
      if (!claimedPaths.has(modified.path)) {
        unreported.push({
          type: 'unreported_modification',
          path: modified.path,
          details: modified,
        });
      }
    }

    return unreported;
  }

  /**
   * Get file information including hash
   */
  async getFileInfo(filePath) {
    const fullPath = path.join(this.workingDir, filePath);
    const stats = await fs.stat(fullPath);

    if (!stats.isFile()) {
      throw new Error('Not a file');
    }

    const content = await fs.readFile(fullPath);
    const hash = crypto.createHash('sha256').update(content).digest('hex');

    return {
      size: stats.size,
      mtime: stats.mtime.toISOString(),
      hash: hash,
      mode: stats.mode,
    };
  }

  /**
   * Get list of tracked files (git tracked + important config files)
   */
  async getTrackedFiles() {
    const files = new Set();

    try {
      // Get git tracked files
      const gitFiles = execSync('git ls-files', { encoding: 'utf8', cwd: this.workingDir })
        .trim()
        .split('\n')
        .filter((f) => f);

      gitFiles.forEach((f) => files.add(f));
    } catch (error) {
      console.warn('⚠️  Could not get git tracked files');
    }

    // Add important untracked files
    const importantFiles = ['.env.local', '.env', 'vercel.json'];

    for (const file of importantFiles) {
      try {
        await fs.access(path.join(this.workingDir, file));
        files.add(file);
      } catch {
        // File doesn't exist, skip
      }
    }

    return Array.from(files);
  }

  /**
   * Get git status information
   */
  async getGitStatus() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8', cwd: this.workingDir });
      const branch = execSync('git branch --show-current', {
        encoding: 'utf8',
        cwd: this.workingDir,
      }).trim();
      const commit = execSync('git rev-parse HEAD', {
        encoding: 'utf8',
        cwd: this.workingDir,
      }).trim();

      return {
        branch,
        commit: commit.substring(0, 8),
        hasChanges: status.trim().length > 0,
        status: status
          .trim()
          .split('\n')
          .filter((l) => l),
      };
    } catch (error) {
      return {
        branch: 'unknown',
        commit: 'unknown',
        hasChanges: false,
        status: [],
      };
    }
  }

  /**
   * Load a snapshot from file
   */
  async loadSnapshot(snapshotId) {
    const snapshotFile = path.join(this.snapshotsDir, `${snapshotId}.json`);
    try {
      const content = await fs.readFile(snapshotFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Snapshot ${snapshotId} not found`);
    }
  }

  /**
   * List all available snapshots
   */
  async listSnapshots() {
    const files = await fs.readdir(this.snapshotsDir);
    const snapshots = [];

    for (const file of files) {
      if (file.endsWith('.json') && !file.includes('comparison-')) {
        const snapshotId = file.replace('.json', '');
        try {
          const snapshot = await this.loadSnapshot(snapshotId);
          snapshots.push({
            id: snapshotId,
            timestamp: snapshot.timestamp,
            files: snapshot.totalFiles,
            size: snapshot.totalSize,
          });
        } catch (error) {
          // Skip invalid snapshots
        }
      }
    }

    return snapshots.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Clean up old snapshots (keep last 10)
   */
  async cleanupSnapshots(keepCount = 10) {
    const snapshots = await this.listSnapshots();

    if (snapshots.length <= keepCount) {
      return;
    }

    const toDelete = snapshots.slice(keepCount);
    console.log(`🧹 Cleaning up ${toDelete.length} old snapshots`);

    for (const snapshot of toDelete) {
      try {
        await fs.unlink(path.join(this.snapshotsDir, `${snapshot.id}.json`));
      } catch (error) {
        console.warn(`⚠️  Could not delete snapshot ${snapshot.id}: ${error.message}`);
      }
    }
  }

  /**
   * Generate unique snapshot ID
   */
  generateSnapshotId() {
    return `snapshot-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Format bytes for display
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generate summary report
   */
  async generateSummaryReport() {
    const snapshots = await this.listSnapshots();

    return {
      totalSnapshots: snapshots.length,
      latestSnapshot: snapshots[0] || null,
      totalTrackedFiles: snapshots[0]?.files || 0,
      totalSize: snapshots[0]?.size || 0,
      availableComparisons: await this.getAvailableComparisons(),
    };
  }

  /**
   * Get available comparison files
   */
  async getAvailableComparisons() {
    const files = await fs.readdir(this.snapshotsDir);
    return files.filter((f) => f.startsWith('comparison-') && f.endsWith('.json')).length;
  }
}

// CLI interface
if (require.main === module) {
  const [, , command, ...args] = process.argv;
  const monitor = new FileStateMonitor();

  switch (command) {
    case 'snapshot':
      const [snapshotId] = args;
      monitor.createSnapshot(snapshotId);
      break;

    case 'compare':
      const [beforeId, afterId] = args;
      monitor.compareSnapshots(beforeId, afterId).then((comparison) => {
        console.log(JSON.stringify(comparison, null, 2));
      });
      break;

    case 'verify':
      const [comparisonFile, claimsFile] = args;
      Promise.all([
        fs.readFile(comparisonFile, 'utf8').then(JSON.parse),
        fs.readFile(claimsFile, 'utf8').then(JSON.parse),
      ])
        .then(([comparison, claims]) => {
          return monitor.verifyClaims(comparison, claims);
        })
        .then((verification) => {
          console.log(JSON.stringify(verification, null, 2));
        });
      break;

    case 'list':
      monitor.listSnapshots().then((snapshots) => {
        console.log(JSON.stringify(snapshots, null, 2));
      });
      break;

    case 'cleanup':
      const [keepCount] = args;
      monitor.cleanupSnapshots(keepCount ? parseInt(keepCount) : 10);
      break;

    case 'summary':
      monitor.generateSummaryReport().then((report) => {
        console.log(JSON.stringify(report, null, 2));
      });
      break;

    default:
      console.log(`
Usage: file-state-monitor.js <command> [args]

Commands:
  snapshot [id]                           Create file system snapshot
  compare <beforeId> <afterId>            Compare two snapshots
  verify <comparisonFile> <claimsFile>    Verify claims against changes
  list                                    List all snapshots
  cleanup [keepCount]                     Clean up old snapshots
  summary                                 Generate summary report
      `);
  }
}

module.exports = FileStateMonitor;
