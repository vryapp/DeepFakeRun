# 🎭 FaceFusion Experience

딥페이크 얼굴 합성 체험 애플리케이션

## 🚀 RunPod 배포 (추천)

### 1. RunPod에서 프로젝트 클론
```bash
git clone https://github.com/your-username/facefusion-project.git
cd facefusion-project
```

### 2. 자동 설정 실행
```bash
chmod +x setup.sh start_all.sh stop_all.sh
./setup.sh
```

### 3. 서비스 시작
```bash
./start_all.sh
```

### 4. 접속하기
- **프론트엔드**: `https://{POD_ID}-5173.proxy.runpod.net`
- **백엔드 API**: `https://{POD_ID}-8001.proxy.runpod.net`

### 관리 명령어
```bash
# 서비스 중지
./stop_all.sh

# 로그 확인
tail -f logs/backend.log    # 백엔드 로그
tail -f logs/frontend.log   # 프론트엔드 로그

# 서비스 재시작
./stop_all.sh && ./start_all.sh
```

---

## 🏠 로컬 개발

### 1. 의존성 설치
```bash
cd frontend
npm install
```

### 2. 개발 서버 실행
```bash
# 백엔드 (별도 터미널)
./start_backend.sh

# 프론트엔드 (별도 터미널)
cd frontend
npm run dev
```

---

## ✨ 주요 기능

- 🎥 실시간 얼굴 캡처
- 🔄 AI 얼굴 합성 (FaceFusion)
- 🎬 다양한 시나리오 영상
- 📱 반응형 웹 인터페이스
- ⚡ H100 GPU 초고속 처리

## 🛠 기술 스택

- **Frontend**: React + Vite
- **Backend**: FastAPI + Python
- **AI**: FaceFusion
- **Deployment**: RunPod

## 📁 프로젝트 구조

```
facefusion-project/
├── frontend/           # React 프론트엔드
│   ├── src/
│   └── package.json
├── backend/
│   └── videos/         # 영상 파일들
├── start_backend.sh    # 백엔드 실행 (기존)
├── setup.sh           # 자동 설정
├── start_all.sh       # 통합 실행
└── stop_all.sh        # 서비스 중지
```

## 🔧 자동 URL 감지

프론트엔드에서 자동으로 RunPod 백엔드 URL을 감지합니다:
- RunPod 환경: `https://{pod_id}-8001.proxy.runpod.net`
- 로컬 환경: `http://localhost:8001`

더 이상 URL을 수동으로 설정할 필요가 없습니다! 🎉 