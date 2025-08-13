# Git Workflow Automation

This project includes automated git hooks and scripts to ensure code quality and streamline the development workflow.

## 🔍 Automatic Code Review (Post-Commit Hook)

After every commit, an automatic code review runs to check:

- ✓ No console.log statements in production code
- ✓ TODO/FIXME/HACK comments tracking
- ✓ TypeScript compilation errors
- ✓ ESLint violations
- ✓ Unhandled promise rejections
- ✓ Hardcoded secrets or API keys

The results are displayed after each commit with a summary of any issues found.

## 🔄 Git Sync Workflow

### Full Sync Script: `npm run git:sync`

A comprehensive script that:

1. Checks for uncommitted changes
2. Fetches all remote changes
3. Pulls and rebases current branch
4. Shows available branches to merge
5. Runs validation checks
6. Commits any merge changes
7. Pushes to remote

**Usage:**

```bash
# Basic sync
npm run git:sync

# Sync with custom commit message
npm run git:sync "feat: merged feature branches"
```

### Quick Sync: `npm run git:quick-sync`

A faster alternative that:

1. Pulls with rebase
2. Runs validation
3. Pushes changes

**Usage:**

```bash
npm run git:quick-sync
```

## 📋 Available Commands

| Command                  | Description                                   |
| ------------------------ | --------------------------------------------- |
| `npm run validate`       | Run all checks (TypeScript, ESLint, Prettier) |
| `npm run git:sync`       | Full git workflow with branch management      |
| `npm run git:quick-sync` | Quick pull, validate, and push                |
| `npm run git:review`     | Auto-fix staged files before commit           |

## 🚀 Recommended Workflow

1. **Before starting work:**

   ```bash
   npm run git:sync
   ```

2. **After making changes:**

   ```bash
   git add .
   git commit -m "feat: your changes"
   # Post-commit hook runs automatically
   ```

3. **Before pushing:**
   ```bash
   npm run git:sync
   # or for quick sync:
   npm run git:quick-sync
   ```

## ⚙️ Hook Configuration

- **Pre-commit**: Runs ESLint and Prettier on staged files
- **Post-commit**: Runs comprehensive code review
- **Pre-push**: Runs full validation suite

All hooks are managed by Husky and can be found in `.husky/` directory.
