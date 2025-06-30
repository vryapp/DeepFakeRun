#!/usr/bin/env bash

echo "🛑 Stopping FaceFusion services..."

# 백엔드 PID 파일에서 프로세스 중지 (start_backend.sh에서 생성한 PID 사용)
if [ -f "/workspace/backend_api.pid" ]; then
    BACKEND_PID=$(cat /workspace/backend_api.pid)
    if ps -p $BACKEND_PID > /dev/null; then
        echo "🐍 Stopping Backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        sleep 2
        if ps -p $BACKEND_PID > /dev/null; then
            echo "   Force killing backend..."
            kill -9 $BACKEND_PID
        fi
    fi
    rm -f /workspace/backend_api.pid
fi

if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null; then
        echo "⚛️ Stopping Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        sleep 2
        if ps -p $FRONTEND_PID > /dev/null; then
            echo "   Force killing frontend..."
            kill -9 $FRONTEND_PID
        fi
    fi
    rm -f frontend.pid
fi

# 프로세스 이름으로도 정리
echo "🧹 Cleaning up remaining processes..."
pkill -f "python.*backend_api.py" || true
pkill -f "node.*vite" || true

echo "✅ All services stopped" 