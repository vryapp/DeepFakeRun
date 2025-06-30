#!/usr/bin/env bash

echo "🚀 Starting FaceFusion Full Stack on RunPod..."

# 로그 디렉토리 생성
mkdir -p logs

# 기존 프로세스 정리
echo "🧹 Cleaning up existing processes..."
pkill -f "node.*vite" || true
sleep 2

echo "🐍 Starting Backend with existing script..."
./start_backend.sh
echo "   Backend started with start_backend.sh"

echo "⚛️ Starting Frontend Dev Server (port 5173)..."
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid
echo "   Frontend PID: $FRONTEND_PID"
cd ..

# 서비스 상태 확인
sleep 5
echo ""
echo "📊 Service Status:"

# 백엔드 PID 확인 (start_backend.sh에서 생성된 PID 파일 사용)
if [ -f "/workspace/backend_api.pid" ] && ps -p $(cat /workspace/backend_api.pid) > /dev/null; then
    echo "✅ Backend API: Running (PID: $(cat /workspace/backend_api.pid))"
else
    echo "❌ Backend API: Failed to start or PID file not found"
fi

if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Frontend: Running (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend: Failed to start"
fi

echo ""
echo "🌐 Access URLs:"
if [ -n "$RUNPOD_POD_ID" ]; then
    echo "   Frontend: https://${RUNPOD_POD_ID}-5173.proxy.runpod.net"
    echo "   Backend:  https://${RUNPOD_POD_ID}-8001.proxy.runpod.net"
else
    echo "   Frontend: http://localhost:5173"
    echo "   Backend:  http://localhost:8001"
fi

echo ""
echo "📋 Management Commands:"
echo "   Stop all: ./stop_all.sh"
echo "   View backend logs: tail -f logs/backend.log"
echo "   View frontend logs: tail -f logs/frontend.log"
echo ""

echo "🎉 FaceFusion is now running!" 