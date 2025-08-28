#!/usr/bin/env python3
"""
Executive Analytics Platform - Model Testing Suite
Test local Ollama models and LiteLLM gateway functionality
"""

import requests
import json
import os
import time
from datetime import datetime

def test_ollama_connection():
    """Test direct Ollama connection"""
    try:
        response = requests.get("http://localhost:11434/api/tags")
        if response.status_code == 200:
            models = response.json()
            print("✅ Ollama is running")
            print("📦 Available models:")
            if models.get('models'):
                for model in models['models']:
                    name = model.get('name', 'Unknown')
                    size = model.get('size', 0)
                    size_gb = size / (1024**3) if size > 0 else 0
                    print(f"   • {name} ({size_gb:.1f}GB)")
            else:
                print("   (No models downloaded yet)")
            return True
        else:
            print("❌ Ollama not responding")
            return False
    except Exception as e:
        print(f"❌ Ollama connection failed: {e}")
        return False

def test_model_inference(model_name):
    """Test model inference with analytics query"""
    analytics_prompt = """You are an executive analytics assistant. A CEO asks: 
    "What should I know about our Q4 workforce costs if we're spending $596,000 monthly 
    with 24 employees and a 23.7% burden rate?"
    
    Give a concise executive summary with 3 key insights."""
    
    try:
        print(f"\n🧠 Testing {model_name} inference...")
        
        payload = {
            "model": model_name,
            "prompt": analytics_prompt,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_p": 0.8,
                "num_predict": 200
            }
        }
        
        response = requests.post(
            "http://localhost:11434/api/generate", 
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            answer = result.get('response', 'No response')
            print(f"✅ {model_name} response:")
            print(f"   {answer[:200]}...")
            return True
        else:
            print(f"❌ {model_name} failed: {response.status_code}")
            return False
            
    except requests.Timeout:
        print(f"⏰ {model_name} timed out (model may be loading)")
        return False
    except Exception as e:
        print(f"❌ {model_name} error: {e}")
        return False

def test_litellm_gateway():
    """Test LiteLLM gateway if running"""
    try:
        response = requests.get("http://localhost:4000/health")
        if response.status_code == 200:
            print("✅ LiteLLM Gateway is running")
            return True
        else:
            print("⚠️  LiteLLM Gateway not running")
            return False
    except Exception as e:
        print("⚠️  LiteLLM Gateway not running")
        return False

def main():
    """Main testing function"""
    print("🚀 Executive Analytics Platform - Model Testing Suite")
    print("=" * 60)
    print(f"⏰ Test started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test Ollama connection
    ollama_ok = test_ollama_connection()
    
    if ollama_ok:
        print("\n🧪 Testing available models...")
        
        # Get available models
        try:
            response = requests.get("http://localhost:11434/api/tags")
            models = response.json()
            
            if models.get('models'):
                for model in models['models']:
                    model_name = model.get('name', '').split(':')[0]
                    if model_name:
                        test_model_inference(model.get('name'))
                        time.sleep(2)  # Brief pause between tests
            else:
                print("📥 No models available yet - download with:")
                print("   ollama pull qwen2.5-coder:7b")
                print("   ollama pull deepseek-r1:7b")
                
        except Exception as e:
            print(f"❌ Error testing models: {e}")
    
    print("\n🌐 Testing LiteLLM Gateway...")
    test_litellm_gateway()
    
    print("\n📋 Next Steps:")
    print("==============")
    print("1. Ensure models are downloaded: ollama list")
    print("2. Start LiteLLM Gateway: litellm --config litellm_config.yaml --port 4000")
    print("3. Configure Claude Code with: export ANTHROPIC_BASE_URL='http://localhost:4000'")
    print("4. Test Gemma's 10-second insight tool")
    print()
    print("🎯 Ready for Fortune 500-level AI orchestration!")

if __name__ == "__main__":
    main()