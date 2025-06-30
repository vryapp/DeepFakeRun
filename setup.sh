#!/usr/bin/env bash

echo "🚀 FaceFusion RunPod Setup Starting..."

# 권한 설정
chmod +x start_all.sh
chmod +x stop_all.sh

# Node.js 설치 확인 및 자동 설치
echo "🔍 Checking Node.js installation..."
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "📦 Node.js not found. Installing Node.js LTS..."
    
    # RunPod 환경에서 apt 업데이트 후 Node.js 설치 (sudo 없이)
    apt-get update -y
    apt-get install -y curl
    
    # Node.js 공식 저장소 추가 및 설치 (RunPod는 이미 root)
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    
    # 설치 확인
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        echo "✅ Node.js $(node --version) and npm $(npm --version) installed successfully"
    else
        echo "❌ Node.js installation failed. Trying alternative method..."
        
        # 대안: nvm 설치 (RunPod 환경에서 더 안정적)
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm install --lts
        nvm use --lts
        
        if command -v node &> /dev/null && command -v npm &> /dev/null; then
            echo "✅ Node.js $(node --version) installed via nvm"
        else
            echo "❌ All Node.js installation methods failed"
            exit 1
        fi
    fi
else
    echo "✅ Node.js $(node --version) and npm $(npm --version) already installed"
fi

# 프론트엔드 의존성 설치
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"

# 루트로 돌아가기
cd ..

# 백엔드 스크립트 실행 권한 확인
echo "🐍 Checking backend script..."
if [ -f "start_backend.sh" ]; then
    chmod +x start_backend.sh
    echo "✅ Backend script found and made executable"
else
    echo "⚠️ start_backend.sh not found - backend may need manual setup"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Run: ./start_all.sh"
echo "  2. Access frontend: https://\${RUNPOD_POD_ID}-5173.proxy.runpod.net"
echo "  3. Backend API: https://\${RUNPOD_POD_ID}-8001.proxy.runpod.net"
echo "" 