#!/usr/bin/env bash

echo "Starting FaceFusion Backend API"

# RunPod 환경 설정
export HF_HOME="/workspace"
export PYTHONIOENCODING="utf-8"

# 로그 디렉토리 생성
mkdir -p /workspace/logs

# micromamba 환경 활성화
eval "$(micromamba shell hook --shell bash)"
micromamba activate facefusion

# 백엔드 API 실행
cd /workspace
echo "Backend API starting on port 8001..."
echo "Access via: https://${RUNPOD_POD_ID:-localhost}-8001.proxy.runpod.net/"

# 백그라운드에서 실행
nohup python backend_api.py > /workspace/logs/backend_api.log 2>&1 &

echo "Backend API started"
echo "Log file: /workspace/logs/backend_api.log"
echo "Check status: tail -f /workspace/logs/backend_api.log"

# 프로세스 ID 저장
echo $! > /workspace/backend_api.pid
echo "PID saved to: /workspace/backend_api.pid"

# 환경 비활성화
micromamba deactivate

echo "Backend API is running in background"
echo "To stop: kill \$(cat /workspace/backend_api.pid)" 