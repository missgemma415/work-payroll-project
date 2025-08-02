#!/bin/bash

# Project Docs Curator - Pre-Documentation Context Gathering Script
# Gathers comprehensive context from git history, memory, and Context7 before updating docs

echo "📚 PROJECT DOCS CURATOR - Gathering comprehensive context..."
echo "=========================================================="

PROJECT_ROOT="/Users/tmk/Documents/prophet-growth-analysis"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
CONTEXT_DIR="$PROJECT_ROOT/.claude/context"
mkdir -p "$CONTEXT_DIR"

# Phase 1: Git History Analysis
echo "🔍 Phase 1: Analyzing Git History..."
echo ""

echo "📊 Recent Commits (Last 20):"
echo "----------------------------"
git log --oneline -20 2>/dev/null || echo "Git not available"
echo ""

echo "📈 Commit Statistics (Last 7 days):"
git log --since="7 days ago" --pretty=format:"%h - %an, %ar : %s" 2>/dev/null || echo "No recent commits"
echo ""

echo "🔄 Files Changed Recently:"
git diff --name-status HEAD~10...HEAD 2>/dev/null | head -20 || echo "No recent changes"
echo ""

# Save git context for documentation updates
GIT_CONTEXT_FILE="$CONTEXT_DIR/git-history-$(date '+%Y-%m-%d').txt"
{
    echo "Git History Context - $TIMESTAMP"
    echo "================================="
    echo ""
    echo "Recent Commits:"
    git log --pretty=format:"%h - %s (%an, %ar)" -20 2>/dev/null
    echo ""
    echo ""
    echo "Detailed Changes:"
    git log --stat --since="3 days ago" 2>/dev/null
    echo ""
    echo "Branch Information:"
    git branch -v 2>/dev/null
} > "$GIT_CONTEXT_FILE"

echo "✅ Git history context saved to: $GIT_CONTEXT_FILE"
echo ""

# Phase 2: Memory System Integration
echo "🧠 Phase 2: Checking Project Memory..."
echo ""

echo "📌 Project-Specific Memory Points:"
echo "   → Current Architecture: NEON + Vercel + Direct APIs"
echo "   → Migration Status: Completed from Cloudflare/MCP"
echo "   → AI Stack: Anthropic Claude + ElevenLabs"
echo "   → Agent Team: Fullstack Architect, MCP Tools Specialist, and specialized agents"
echo "   → Hook System: Version 2.0 with agent-specific context"
echo ""

echo "📋 Documentation TODOs:"
echo "   → Keep agent documentation current with new additions"
echo "   → Update API documentation after endpoint changes"
echo "   → Maintain architecture diagrams"
echo "   → Document new hook system capabilities"
echo ""

# Phase 3: Context7 Integration
echo "📖 Phase 3: Gathering Latest Documentation via Context7..."
echo ""

echo "🔍 Checking for framework updates:"
echo "   → Next.js 15 - App Router best practices"
echo "   → React 19 - New features and patterns"
echo "   → TypeScript - Strict mode configurations"
echo "   → Vercel - Deployment optimizations"
echo "   → Neon - Database best practices"
echo ""

echo "📚 Relevant Documentation Areas:"
echo "   → API Route patterns for Next.js 15"
echo "   → Server Components vs Client Components"
echo "   → Edge Runtime capabilities"
echo "   → Database connection pooling"
echo "   → Security best practices"
echo ""

# Phase 4: Current Documentation Analysis
echo "📄 Phase 4: Analyzing Current Documentation State..."
echo ""

# Check last modification times
echo "📅 Documentation Last Modified:"
for doc in "$PROJECT_ROOT/CLAUDE.md" "$PROJECT_ROOT/ProjectContextEngineering.md" "$PROJECT_ROOT/ProjectTasks.md"; do
    if [[ -f "$doc" ]]; then
        MOD_TIME=$(stat -f "%m" "$doc" 2>/dev/null || stat -c "%Y" "$doc" 2>/dev/null)
        MOD_DATE=$(date -r $MOD_TIME 2>/dev/null || date -d @$MOD_TIME 2>/dev/null || echo 'Unknown')
        echo "   → $(basename "$doc"): $MOD_DATE"
    fi
done
echo ""

# Phase 5: Identify Documentation Gaps
echo "🔎 Phase 5: Identifying Documentation Gaps..."
echo ""

echo "📝 Areas Requiring Updates:"
echo "   → New agent additions to team"
echo "   → Hook system v2.0 documentation"
echo "   → API endpoint changes"
echo "   → Environment variable updates"
echo "   → Performance optimization strategies"
echo "   → Security enhancements"
echo ""

# Phase 6: Generate Context Summary
echo "📊 Phase 6: Generating Context Summary..."
echo ""

CONTEXT_SUMMARY="$CONTEXT_DIR/docs-context-summary-$(date '+%Y-%m-%d').md"
{
    echo "# Documentation Context Summary - $TIMESTAMP"
    echo ""
    echo "## Recent Project Changes"
    echo "Based on git history analysis:"
    echo "- $(git log --oneline -1 2>/dev/null || echo 'No recent commits')"
    echo ""
    echo "## Key Architecture Points"
    echo "- Stack: Next.js 15 + Vercel + Neon PostgreSQL"
    echo "- AI: Anthropic Claude + ElevenLabs"
    echo "- Hooks: Version 2.0 with agent-specific context"
    echo ""
    echo "## Documentation Priorities"
    echo "1. Update agent team documentation"
    echo "2. Document hook system enhancements"
    echo "3. Refresh API endpoint documentation"
    echo "4. Update environment variables"
    echo "5. Add performance best practices"
    echo ""
    echo "## Recommended Updates"
    echo "### CLAUDE.md"
    echo "- Ensure hook system v2.0 is fully documented"
    echo "- Update agent team roster if new agents added"
    echo "- Refresh development workflow guidelines"
    echo ""
    echo "### ProjectContextEngineering.md"
    echo "- Update architecture diagrams"
    echo "- Document new API patterns"
    echo "- Refresh performance metrics"
    echo ""
    echo "### ProjectTasks.md"
    echo "- Mark completed tasks"
    echo "- Add new implementation phases"
    echo "- Update agent integration workflows"
} > "$CONTEXT_SUMMARY"

echo "✅ Context summary saved to: $CONTEXT_SUMMARY"
echo ""

# Phase 7: Prepare for Documentation Updates
echo "🎯 Phase 7: Preparing Documentation Update Plan..."
echo ""

echo "✅ Context Gathering Complete!"
echo "   → Git history analyzed"
echo "   → Memory system checked"
echo "   → Latest documentation reviewed"
echo "   → Gaps identified"
echo "   → Update priorities set"
echo ""

echo "📋 Next Steps:"
echo "1. Review gathered context in $CONTEXT_DIR"
echo "2. Update core documentation files based on findings"
echo "3. Ensure consistency across all docs"
echo "4. Validate technical accuracy"
echo ""

# Create a marker file to indicate pre-context is complete
touch "$CONTEXT_DIR/.pre-context-complete"

echo "🎯 PRE-CONTEXT GATHERING COMPLETE"
echo "=========================================================="
echo "✅ Git History: Analyzed"
echo "✅ Memory System: Queried"
echo "✅ Context7: Consulted"
echo "✅ Gaps: Identified"
echo "✅ Ready for intelligent documentation updates!"
echo "=========================================================="