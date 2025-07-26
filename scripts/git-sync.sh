#!/usr/bin/env bash

# Git Sync Script - Automated pull, merge, and push workflow
# Usage: ./scripts/git-sync.sh [commit-message]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}🔄 Git Sync - Automated Workflow${NC}"
echo "================================="

# Function to check if there are uncommitted changes
check_uncommitted_changes() {
  if ! git diff-index --quiet HEAD --; then
    echo "${RED}❌ Error: You have uncommitted changes${NC}"
    echo "Please commit or stash your changes first."
    git status --short
    return 1
  fi
  return 0
}

# Function to get current branch
get_current_branch() {
  git branch --show-current
}

# Main workflow
main() {
  # 1. Check for uncommitted changes
  echo -n "Checking for uncommitted changes... "
  if ! check_uncommitted_changes; then
    exit 1
  fi
  echo "${GREEN}✓ Clean${NC}"

  # 2. Save current branch
  CURRENT_BRANCH=$(get_current_branch)
  echo "Current branch: ${YELLOW}$CURRENT_BRANCH${NC}"

  # 3. Fetch latest changes
  echo -n "Fetching latest changes... "
  if git fetch --all --prune &>/dev/null; then
    echo "${GREEN}✓ Done${NC}"
  else
    echo "${RED}❌ Failed${NC}"
    exit 1
  fi

  # 4. Pull latest changes from current branch
  echo -n "Pulling latest changes from origin/$CURRENT_BRANCH... "
  if git pull origin "$CURRENT_BRANCH" --rebase &>/dev/null; then
    echo "${GREEN}✓ Done${NC}"
  else
    echo "${RED}❌ Failed - Resolve conflicts and try again${NC}"
    exit 1
  fi

  # 5. Check for other branches that need merging
  echo "\nChecking for branches to merge..."
  BRANCHES_TO_MERGE=$(git branch -r --no-merged | grep -v "HEAD" | grep -v "$CURRENT_BRANCH" | sed 's/origin\///')
  
  if [ -n "$BRANCHES_TO_MERGE" ]; then
    echo "${YELLOW}Found unmerged branches:${NC}"
    echo "$BRANCHES_TO_MERGE" | while read -r branch; do
      echo "  - $branch"
    done
    
    echo -n "\nDo you want to merge any branches? (y/N): "
    read -r MERGE_CONFIRM
    
    if [[ $MERGE_CONFIRM =~ ^[Yy]$ ]]; then
      echo "$BRANCHES_TO_MERGE" | while read -r branch; do
        echo -n "Merge $branch? (y/N): "
        read -r CONFIRM
        if [[ $CONFIRM =~ ^[Yy]$ ]]; then
          echo "Merging $branch..."
          if git merge "origin/$branch" --no-ff -m "Merge branch '$branch' into $CURRENT_BRANCH"; then
            echo "${GREEN}✓ Successfully merged $branch${NC}"
          else
            echo "${RED}❌ Failed to merge $branch - Resolve conflicts and continue${NC}"
            exit 1
          fi
        fi
      done
    fi
  else
    echo "${GREEN}✓ No unmerged branches found${NC}"
  fi

  # 6. Run validation checks
  echo "\nRunning validation checks..."
  if npm run validate &>/dev/null; then
    echo "${GREEN}✓ All checks passed${NC}"
  else
    echo "${RED}❌ Validation failed${NC}"
    echo "Run 'npm run validate' to see errors"
    exit 1
  fi

  # 7. Commit if there are changes (from merges)
  if ! git diff-index --quiet HEAD --; then
    echo "\nChanges detected (likely from merges)"
    COMMIT_MSG="${1:-"chore: sync and merge branches"}"
    echo "Committing with message: $COMMIT_MSG"
    git add -A
    git commit -m "$COMMIT_MSG"
  fi

  # 8. Push to remote
  echo -n "\nPushing to origin/$CURRENT_BRANCH... "
  if git push origin "$CURRENT_BRANCH"; then
    echo "${GREEN}✓ Success${NC}"
  else
    echo "${RED}❌ Failed${NC}"
    echo "You may need to force push with: git push origin $CURRENT_BRANCH --force-with-lease"
    exit 1
  fi

  # 9. Summary
  echo "\n${GREEN}✅ Git sync completed successfully!${NC}"
  echo "Summary:"
  echo "  - Branch: $CURRENT_BRANCH"
  echo "  - Latest changes pulled"
  echo "  - All validations passed"
  echo "  - Changes pushed to remote"
  
  # Show recent commits
  echo "\nRecent commits:"
  git log --oneline -5
}

# Run main function with all arguments
main "$@"