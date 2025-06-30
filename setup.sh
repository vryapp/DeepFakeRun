#!/usr/bin/env bash

echo "🚀 FaceFusion RunPod Setup Starting..."

# 권한 설정
chmod +x start_all.sh
chmod +x stop_all.sh

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