import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CommonHeader from "./CommonHeader";
import { useDeepfake } from "../context/DeepfakeContext";
import { getResultBase64Fast, getResultStreamingFast, getJobStatus } from "../services/api";
import { playNavigationSound } from '../utils/soundUtils';

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #000;
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const Title = styled.h2`
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  z-index: 10;
`;

const VideoContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: #000;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProgressContainer = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  overflow: hidden;
`;

const Progress = styled.div`
  width: ${props => props.value}%;
  height: 100%;
  background: linear-gradient(90deg, #E31837 0%, #FF6B6B 50%, #9CD5EE 100%);
  border-radius: 6px;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
`;

const StatusText = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  text-align: center;
  margin-top: 10px;
`;

const DebugInfo = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  max-width: 300px;
  z-index: 1000;
`;

const PopupOverlay = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'show'
})`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const PopupContainer = styled.div`
  width: 500px;
  height: 300px;
  background: linear-gradient(135deg, #E31837 0%, #FF6B6B 50%, #9CD5EE 100%);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
`;

const CheckIcon = styled.div`
  width: 60px;
  height: 60px;
  background-image: url('/asset/check.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-bottom: 30px;
`;

const PopupTitle = styled.h2`
  color: white;
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
`;

const PopupButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 12px 30px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: white;
    color: #E31837;
  }
`;

const CountdownText = styled.div`
  position: absolute;
  bottom: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  text-align: center;
`;

export default function Screen8_Processing() {
  const navigate = useNavigate();
  const { 
    capturedImage, 
    selectedVideoId, 
    jobId, 
    setResultData,
    processedJobs,
    setProcessedJobs,
    currentlyProcessing,
    setCurrentlyProcessing,
    showCompletionPopup,
    setShowCompletionPopup,
    completionCountdown,
    setCompletionCountdown,
    resultData,
    videoCache,
    setVideoCache
  } = useDeepfake();
  
  // 로컬 상태는 최소화
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("딥페이크 영상을 생성하고 있습니다...");
  const [startTime] = useState(Date.now()); // 처리 시작 시간 기록
  const [checkInterval, setCheckInterval] = useState(2000); // 적응형 체크 간격

  // 적응형 폴링 간격 계산
  const getAdaptiveInterval = useCallback((elapsedTime, lastStatus) => {
    if (lastStatus === 'completed') return 0; // 완료되면 폴링 중단
    if (elapsedTime < 10000) return 500;   // 첫 10초는 0.5초마다
    if (elapsedTime < 20000) return 1000;  // 다음 10초는 1초마다
    if (elapsedTime < 40000) return 2000;  // 다음 20초는 2초마다 (H200은 빠르니까)
    return 3000; // 40초 후는 3초마다
  }, []);
  
  useEffect(() => {
    console.log("🚀 Screen8_Processing component mounted");
    console.log("📷 capturedImage exists:", !!capturedImage);
    console.log("🎬 selectedVideoId:", selectedVideoId);
    console.log("🔑 jobId:", jobId);
    console.log("🔄 currentlyProcessing:", currentlyProcessing);
    console.log("✅ processedJobs:", Array.from(processedJobs));
    
    // 필수 데이터 체크
    if (!capturedImage) {
      console.error("❌ No captured image, redirecting to capture");
      setTimeout(() => navigate("/capture"), 0);
      return;
    }

    // jobId가 없거나 temp_면 바로 비디오 페이지로 이동 (데모용)
    if (!jobId || jobId.startsWith('temp_')) {
      console.log("⚠️ No valid jobId, using demo mode - showing popup after 3 seconds");
      const demoTimeout = setTimeout(() => {
        setShowCompletionPopup(true);
        setCompletionCountdown(10);
        
        // 카운트다운 시작
        const countdownInterval = setInterval(() => {
          setCompletionCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setShowCompletionPopup(false);
              navigate("/video");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 3000);
      
      return () => {
        clearTimeout(demoTimeout);
      };
    }

    // 이미 처리된 작업이면 바로 비디오 페이지로 이동
    if (processedJobs.has(jobId)) {
      console.log("✅ Job already processed, checking cache and result data");
      
      // 🚀 캐시가 있으면 결과 데이터 복원
      if (videoCache.has(jobId)) {
        const cachedVideo = videoCache.get(jobId);
        console.log("⚡ Restoring result data from cache");
        setResultData({
          success: true,
          videoUrl: cachedVideo.blobUrl,
          status: 'completed',
          isStreaming: false,
          downloadCompleted: true,
          blobReady: true,
          cached: true,
          fromCache: true
        });
      } else {
        // ⚠️ 캐시가 없으면 바로 비디오 페이지로 이동 (중복 다운로드 방지)
        console.log("⚠️ No cache found, navigating to video page directly");
        setTimeout(() => navigate("/video"), 1000);
      }
      
      // 결과 데이터가 있으면 팝업 표시 (처리 직후 상황)
      if ((resultData && resultData.success) || videoCache.has(jobId)) {
        console.log("🎉 Showing completion popup for processed job");
        setShowCompletionPopup(true);
        setCompletionCountdown(10);
        
        // ⏰ 10초 카운트다운 시작
        let countdownTimer = 10;
        const countdownInterval = setInterval(() => {
          countdownTimer--;
          setCompletionCountdown(countdownTimer);
          
          console.log(`⏰ Countdown: ${countdownTimer} seconds remaining`);
          
          if (countdownTimer <= 0) {
            clearInterval(countdownInterval);
            console.log('⏰ Countdown finished, navigating to video page');
            setShowCompletionPopup(false);
            navigate("/video");
          }
        }, 1000);
        
        // 컴포넌트 언마운트 시 interval 정리를 위해 저장
        window.processingCountdownInterval = countdownInterval;
        
        return; // 완료되었으므로 더 이상 체크하지 않음
      } else {
        // 결과 데이터와 캐시가 모두 없으면 바로 비디오 페이지로
        console.log("📺 No result data or cache, navigating directly to video");
        setTimeout(() => navigate("/video"), 1000);
        return;
      }
    }

    // 이미 다른 인스턴스에서 처리 중이면 대기
    if (currentlyProcessing && currentlyProcessing !== jobId) {
      console.log("⚠️ Another job is currently processing, waiting...");
      return;
    }

    // 현재 작업 설정
    if (currentlyProcessing !== jobId) {
      console.log("🏁 Starting to process job:", jobId);
      setCurrentlyProcessing(jobId);
    }

    // 진행률 시뮬레이션 (H200에 맞게 조정)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const elapsed = Date.now() - startTime;
        // H200은 빠르니까 30초 정도면 완료
        if (elapsed < 5000) return Math.min(20, prev + 3);   // 첫 5초
        if (elapsed < 15000) return Math.min(60, prev + 2);  // 다음 10초
        if (elapsed < 25000) return Math.min(85, prev + 1);  // 다음 10초
        if (elapsed < 35000) return Math.min(95, prev + 0.5); // 마지막 10초
        return Math.min(98, prev + 0.1); // 완료 대기
      });
    }, 1000);

    // ⚡ 초고속 적응형 결과 체크 - URL 우선 방식
    let isChecking = false;
    let lastStatus = null;
    
    const checkResult = async () => {
      if (isChecking) return; // 중복 체크 방지
      
      // 이미 처리된 작업이면 체크 중단
      if (processedJobs.has(jobId)) {
        console.log("⚠️ Job already marked as processed, stopping checks");
        return;
      }
      
      isChecking = true;
      const elapsed = Date.now() - startTime;
      
      try {
        // 🎥 상태만 확인 (더 이상 다운로드 하지 않음!)
        const response = await getJobStatus(jobId);
        lastStatus = response.status;
        
        if (response.status === 'completed') {
          // 🎉 즉시 완료 처리 (2번 체크 필요 없음!)
          setProcessedJobs(prev => new Set([...prev, jobId]));
          setCurrentlyProcessing(null);
          
          const totalTime = Date.now() - startTime;
          
          console.log('🏁⚡ H200 초고속 처리 완료!', {
            jobId,
            totalProcessingTime: `${(totalTime / 1000).toFixed(1)}초`,
            startTime: new Date(startTime).toLocaleTimeString(),
            endTime: new Date().toLocaleTimeString()
          });
          
          // 🎥 최적화된 비디오 URL 가져오기 (기존 API 활용!)
          const getOptimizedVideoUrl = async () => {
            try {
              console.log('🎥 Getting optimized video URL...');
              
              // 기존 getResultVideoUrl API 사용 (가장 빠름!)
              const { getResultVideoUrl } = await import('../services/api');
              const result = await getResultVideoUrl(jobId);
              
              if (result.success) {
                console.log('🎥 Optimized video URL ready:', {
                  videoUrl: result.videoUrl,
                  fileSize: `${(result.fileSize / 1024 / 1024).toFixed(2)}MB`,
                  checkTime: `${result.checkTime}ms`
                });
                
                // 최적화된 URL로 즉시 설정
                setResultData({
                  success: true,
                  videoUrl: result.videoUrl,
                  status: 'completed',
                  isStreaming: true,
                  downloadCompleted: false,
                  optimizedUrl: true,
                  jobId: jobId,
                  fileSize: result.fileSize
                });
                
                console.log('⚡ Optimized video URL ready! Instant playback available.');
              } else {
                throw new Error(`URL 가져오기 실패: ${result.message}`);
              }
              
            } catch (error) {
              console.error('🎥 URL 가져오기 실패:', error);
              
              // 폴백: 자동 감지된 API URL 사용
              const getAutoApiUrl = () => {
                if (typeof window !== 'undefined' && window.location.hostname.includes('proxy.runpod.net')) {
                  const podId = window.location.hostname.split('-')[0];
                  return `https://${podId}-8001.proxy.runpod.net`;
                }
                return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
              };
              const API_BASE_URL = getAutoApiUrl();
              const fallbackUrl = `${API_BASE_URL}/video/${jobId}`;
              
              setResultData({
                success: true,
                videoUrl: fallbackUrl,
                status: 'completed',
                isStreaming: true,
                downloadCompleted: false,
                fallbackMode: true
              });
            }
          };
          
          // 최적화된 URL 가져오기
          getOptimizedVideoUrl();
          
          setProgress(100);
          setStatusText(`H200 초고속 처리 완료! (${(totalTime / 1000).toFixed(1)}초)`);
          
          // 체크 중단
          clearInterval(progressInterval);
          
          // 🎉 팝업 표시하고 10초 카운트다운 후 이동
          console.log('🎉 Processing completed, showing popup with countdown');
          setShowCompletionPopup(true);
          setCompletionCountdown(10);
          
          // ⏰ 10초 카운트다운 시작 (전역 변수 사용)
          window.processingCountdownInterval = setInterval(() => {
            setCompletionCountdown(prev => {
              const newValue = prev - 1;
              console.log(`⏰ Countdown: ${newValue} seconds remaining`);
              
              if (newValue <= 0) {
                clearInterval(window.processingCountdownInterval);
                window.processingCountdownInterval = null;
                console.log('⏰ Countdown finished, navigating to video page');
                setShowCompletionPopup(false);
                navigate("/video");
                return 0;
              }
              return newValue;
            });
          }, 1000);
          
          return; // 완료되었으므로 더 이상 체크하지 않음
        } else {
          // 상태에 따른 메시지 업데이트
          if (response.status === 'processing') {
            const elapsed = Date.now() - startTime;
            if (elapsed < 15000) {
              setStatusText("H200 GPU로 초고속 처리 중...");
            } else if (elapsed < 30000) {
              setStatusText("거의 완료되었습니다...");
            } else {
              setStatusText("최종 마무리 중...");
            }
          } else if (response.status === 'failed') {
            setStatusText("처리 중 오류가 발생했습니다.");
            console.error("Processing failed:", response.message);
          }
        }
        
      } catch (error) {
        console.error("⚠️ Result check error (will retry):", error.message);
      } finally {
        isChecking = false;
        
        // 적응형 다음 체크 스케줄링
        const nextInterval = getAdaptiveInterval(elapsed, lastStatus);
        if (nextInterval > 0 && !processedJobs.has(jobId)) {
          setTimeout(checkResult, nextInterval);
        }
      }
    };

    // 첫 체크는 5초 후 시작 (백엔드 처리 시간 고려)
    const initialTimeout = setTimeout(checkResult, 5000);

    return () => {
      console.log("🧹 Cleaning up Screen8_Processing...");
      clearInterval(progressInterval);
      clearTimeout(initialTimeout);
      // 카운트다운 interval도 정리
      if (window.processingCountdownInterval) {
        clearInterval(window.processingCountdownInterval);
        window.processingCountdownInterval = null;
      }
    };
  }, [capturedImage, jobId, navigate, setResultData, startTime, processedJobs, setProcessedJobs, currentlyProcessing, setCurrentlyProcessing, getAdaptiveInterval]);

  const handleConfirm = useCallback(() => {
    console.log('👆 User clicked confirm button, navigating immediately');
    playNavigationSound('confirm');
    // 모든 카운트다운 interval 정리
    if (window.processingCountdownInterval) {
      clearInterval(window.processingCountdownInterval);
      window.processingCountdownInterval = null;
    }
    // 팝업 상태 초기화
    setShowCompletionPopup(false);
    setCompletionCountdown(0);
    // 즉시 이동
    navigate("/video");
  }, [navigate, setShowCompletionPopup, setCompletionCountdown]);

  const showPopupManually = useCallback(() => {
    setShowCompletionPopup(true);
    setCompletionCountdown(10);
    
    // 카운트다운 시작
    const countdownInterval = setInterval(() => {
      setCompletionCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          handleConfirm();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [handleConfirm]);

  return (
    <Container>
      <CommonHeader />
      
      <ContentWrapper>
        <VideoContainer>
          <Video
            src="/asset/deep_loading.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        </VideoContainer>
      </ContentWrapper>
      
      {/* 디버그 정보 숨김 - 프로덕션 환경에서는 표시하지 않음 */}
      {process.env.NODE_ENV === 'development' && (
        <DebugInfo>
          <div>H200 Processing State (URL Mode)</div>
          <div>capturedImage: {!!capturedImage ? 'YES' : 'NO'}</div>
          <div>selectedVideoId: {selectedVideoId || 'NONE'}</div>
          <div>jobId: {jobId || 'NONE'}</div>
          <div>progress: {Math.floor(progress)}%</div>
          <div>checkInterval: {checkInterval}ms</div>
          <div>elapsed: {Math.floor((Date.now() - startTime) / 1000)}s</div>
        </DebugInfo>
      )}

      <PopupOverlay show={showCompletionPopup}>
        <PopupContainer>
          <CheckIcon />
          <PopupTitle>딥페이크영상이 완료되었습니다!</PopupTitle>
          <PopupButton onClick={handleConfirm}>
            확인하러 가기
          </PopupButton>
          {completionCountdown > 0 && (
            <CountdownText>
              {completionCountdown}초 후 자동으로 이동합니다
            </CountdownText>
          )}
        </PopupContainer>
      </PopupOverlay>
    </Container>
  );
} 