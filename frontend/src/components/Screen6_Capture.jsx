import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useDeepfake } from "../context/DeepfakeContext";
import { uploadImage } from "../services/api";
import { playNavigationSound } from '../utils/soundUtils';

const FullScreenContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
`;

const CameraView = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
`;

const CapturedImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TopSection = styled.div`
  position: relative;
  z-index: 10;
  text-align: center;
  margin-top: 60px;
`;

const GuideText = styled.div`
  color: white;
  font-size: 36px;
  font-weight: 500;
  font-family: 'Pretendard', sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const CountdownOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  pointer-events: none;
`;

const CountdownNumber = styled.div`
  color: white;
  font-size: 180px;
  font-weight: bold;
  font-family: 'Pretendard', sans-serif;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.8);
  animation: pulse 1s ease-in-out;
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

const CenterSection = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const TargetFrame = styled.div`
  width: 480px;
  height: 600px;
  background-image: url('/asset/8_target.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

const BottomSection = styled.div`
  position: relative;
  z-index: 10;
  margin-bottom: 60px;
`;

const CaptureButton = styled.button`
  background: #E31837;
  color: white;
  border: none;
  padding: 20px 60px;
  border-radius: 50px;
  font-size: 24px;
  font-weight: 500;
  font-family: 'Pretendard', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const RetakeButton = styled.button`
  background: white;
  color: #333;
  border: none;
  padding: 20px 60px;
  border-radius: 50px;
  font-size: 24px;
  font-weight: 500;
  font-family: 'Pretendard', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  margin-right: 20px;

  &:active {
    transform: scale(0.95);
  }
`;

const CameraError = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  text-align: center;
  font-family: 'Pretendard', sans-serif;
`;

const HomeButton = styled.button`
  position: fixed;
  bottom: 60px;
  right: 60px;
  width: 60px;
  height: 60px;
  background-image: url('/asset/home_button.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export default function Screen6_Capture() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const { 
    setCapturedImage: setContextImage, 
    setImageId,
    setSelectedGender,
    setSelectedVideoId,
    setJobId,
    setResultData,
    videoCache,
    processedJobs,
    setProcessedJobs,
    currentlyProcessing,
    setCurrentlyProcessing,
    setShowCompletionPopup,
    setCompletionCountdown
  } = useDeepfake();

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("카메라 접근 오류:", err);
        setCameraError(true);
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const actualCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageData);
      setContextImage(imageData);
    }
  };

  const startCountdown = () => {
    setIsCountingDown(true);
    setCountdown(5);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCountingDown(false);
          actualCapture();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleUpload = async () => {
    if (!capturedImage) return;
    
    playNavigationSound('confirm');
    setIsUploading(true);
    try {
      const response = await uploadImage(capturedImage);
      setImageId(response.imageId);
      navigate("/gender");
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsUploading(false);
    }
  };

  const retakePhoto = async () => {
    playNavigationSound('retry');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setCapturedImage(null);
    setCountdown(0);
    setIsCountingDown(false);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("카메라 접근 오류:", err);
      setCameraError(true);
    }
  };

  const handleHome = () => {
    console.log("🏠 홈버튼 클릭 - 모든 상태 초기화");
    
    // 카메라 스트림 정리
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    // 🧹 모든 상태 완전 초기화
    setContextImage(null);
    setImageId(null);
    setSelectedGender(null);
    setSelectedVideoId(null);
    setJobId(null);
    setResultData(null);
    
    // 🗑️ 전역 캐시 및 처리 상태 초기화
    if (videoCache) {
      videoCache.clear();
      console.log("🗑️ Video cache cleared");
    }
    
    // 처리된 작업 목록 초기화
    setProcessedJobs(new Set());
    setCurrentlyProcessing(null);
    
    // 팝업 상태 초기화
    setShowCompletionPopup(false);
    setCompletionCountdown(0);
    
    // 모든 interval 정리
    if (window.processingCountdownInterval) {
      clearInterval(window.processingCountdownInterval);
      window.processingCountdownInterval = null;
    }
    
    console.log("🧹 All states cleared, navigating to home");
    navigate("/");
  };

  return (
    <FullScreenContainer>
      <HomeButton onClick={handleHome} />
      
          {!capturedImage && !cameraError && (
            <CameraView 
              ref={videoRef} 
              autoPlay 
              playsInline 
            />
          )}
      
          {capturedImage && (
            <CapturedImage src={capturedImage} alt="촬영된 이미지" />
          )}
      
          {cameraError && (
        <CameraError>
              카메라를 사용할 수 없습니다.<br />
              카메라 권한을 확인해 주세요.
        </CameraError>
          )}

      <TopSection>
        <GuideText>얼굴을 화면지시선에 맞춰주세요.</GuideText>
      </TopSection>

      <CenterSection>
        <TargetFrame />
      </CenterSection>

      {isCountingDown && (
        <CountdownOverlay>
          <CountdownNumber key={countdown}>{countdown}</CountdownNumber>
        </CountdownOverlay>
      )}

      <BottomSection>
          {!capturedImage ? (
          <CaptureButton 
              onClick={startCountdown}
              disabled={cameraError || isCountingDown}
            >
            {isCountingDown ? "촬영 준비 중..." : "촬영하기"}
          </CaptureButton>
          ) : (
            <>
            <RetakeButton onClick={retakePhoto}>
              다시촬영
            </RetakeButton>
            <CaptureButton 
                onClick={handleUpload}
                disabled={isUploading}
              >
              {isUploading ? "업로드 중..." : "확인"}
            </CaptureButton>
            </>
          )}
      </BottomSection>
    </FullScreenContainer>
  );
} 