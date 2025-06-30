#!/usr/bin/env bash

echo "⚛️ Starting FaceFusion Frontend Only..."

# 로그 디렉토리 생성
mkdir -p logs

# 기존 프론트엔드 프로세스 정리
echo "🧹 Cleaning up existing frontend processes..."
pkill -f "node.*vite" || true
sleep 2

echo "🚀 Starting Frontend Dev Server (port 5173)..."
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid
echo "   Frontend PID: $FRONTEND_PID"
cd ..

# 서비스 상태 확인
sleep 3
echo ""
echo "📊 Frontend Status:"

if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Frontend: Running (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend: Failed to start"
fi

echo ""
echo "🌐 Frontend URL:"
if [ -n "$RUNPOD_POD_ID" ]; then
    echo "   https://${RUNPOD_POD_ID}-5173.proxy.runpod.net"
else
    echo "   http://localhost:5173"
fi

echo ""
echo "📋 Management Commands:"
echo "   Stop frontend: pkill -f 'node.*vite'"
echo "   View logs: tail -f logs/frontend.log"
echo ""

echo "🎉 Frontend is now running!" 