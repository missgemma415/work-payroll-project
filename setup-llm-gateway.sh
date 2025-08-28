#!/bin/bash

# Executive Analytics Platform - LLM Gateway Setup Script
# Sets up multi-model AI infrastructure for Fortune 500 analytics

echo "🚀 Setting up Executive Analytics LLM Gateway..."
echo "================================================"

# Create environment file for API keys
echo "📝 Creating .env.llm for API key management..."

cat > .env.llm << 'EOF'
# LiteLLM Multi-Model Gateway Configuration
# Executive Analytics Platform - Secure API Keys

# DeepSeek API (Advanced Financial Analysis)
# Get your key from: https://platform.deepseek.com/api_keys
# DEEPSEEK_API_KEY="your_deepseek_api_key_here"

# Qwen API (Natural Language Processing) 
# Get your key from: https://dashscope.aliyun.com/
# QWEN_API_KEY="your_qwen_api_key_here"

# Perplexity API (Research and Insights)
# Get your key from: https://www.perplexity.ai/settings/api
# PERPLEXITY_API_KEY="your_perplexity_api_key_here"

# HuggingFace API (Specialized Models)
# Get your key from: https://huggingface.co/settings/tokens
# HUGGINGFACE_API_KEY="your_huggingface_api_key_here"

# LiteLLM Master Key (Generate a secure random key)
LITELLM_MASTER_KEY="sk-executive-analytics-$(openssl rand -hex 16)"

# Claude Code Integration
ANTHROPIC_BASE_URL="http://localhost:4000"
ANTHROPIC_AUTH_TOKEN="sk-executive-analytics-$(openssl rand -hex 16)"
EOF

echo "✅ Created .env.llm file"

# Make the script executable
chmod +x setup-llm-gateway.sh

echo ""
echo "🔐 Next Steps - API Key Setup:"
echo "================================="
echo "1. Edit .env.llm and add your API keys:"
echo "   - DeepSeek: https://platform.deepseek.com/api_keys"
echo "   - Qwen: https://dashscope.aliyun.com/"
echo "   - Perplexity: https://www.perplexity.ai/settings/api"
echo "   - HuggingFace: https://huggingface.co/settings/tokens"
echo ""
echo "2. Load environment variables:"
echo "   source .env.llm"
echo ""
echo "3. Start LiteLLM Gateway:"
echo "   litellm --config litellm_config.yaml --port 4000 --host 0.0.0.0"
echo ""
echo "4. Configure Claude Code:"
echo "   export ANTHROPIC_BASE_URL='http://localhost:4000'"
echo "   export ANTHROPIC_AUTH_TOKEN=\$LITELLM_MASTER_KEY"
echo ""

# Check if Ollama is running
if pgrep -f "ollama serve" > /dev/null; then
    echo "✅ Ollama is running"
    echo "📦 Available local models:"
    ollama list 2>/dev/null || echo "   (No models downloaded yet)"
else
    echo "⚠️  Ollama is not running. Start it with: brew services start ollama"
fi

echo ""
echo "🎯 Model Selection Strategy for Gemma:"
echo "======================================"
echo "💰 Financial Analysis    → DeepSeek (cloud/local)"
echo "💬 Natural Language      → Qwen (cloud/local)" 
echo "🔍 Research & Insights   → Perplexity"
echo "🔒 Sensitive HR Data     → Local Ollama models"
echo "🤖 Specialized Tasks     → HuggingFace models"
echo ""
echo "🚀 Ready for Fortune 500-level AI orchestration!"