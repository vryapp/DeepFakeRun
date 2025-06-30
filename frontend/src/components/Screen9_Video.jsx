import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CommonHeader from "./CommonHeader";
import { useDeepfake } from "../context/DeepfakeContext";
import { getResultBase64 } from "../services/api";
import { playNavigationSound } from '../utils/soundUtils';

const Container = styled.div`
  width: 100%;
  height: 100vh;
  padding: 30px 60px 60px 60px;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
`;

const MainTitle = styled.h1`
  font-size: 3.75rem;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 40px;
`;

const SubTitle = styled.p`
  font-size: 1.5rem;
  color: white;
  text-align: center;
  margin-bottom: 60px;
`;

const VideoContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  height: 600px;
  background: #000;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60px;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VideoOverlay = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'show'
})`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  padding: 40px;
`;

const ReloadIcon = styled.button`
  width: 80px;
  height: 80px;
  background-image: url('/asset/replay.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: transparent;
  border: none;
  margin-bottom: 40px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
`;

const ReplayButton = styled.button`
  background: white;
  color: #E31837;
  border: none;
  padding: 1.5rem 4rem;
  font-size: 2rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  font-family: 'Pretendard', sans-serif;
  box-shadow: 0 4px 15px rgba(227, 24, 55, 0.3);
  outline: none;
  
  &:focus {
    outline: none;
  }
  
  &:active {
    outline: none;
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }
`;

const NextButton = styled.button`
  background: #E31837;
  color: white;
  border: none;
  padding: 1.5rem 4rem;
  font-size: 2rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  font-family: 'Pretendard', sans-serif;
  box-shadow: 0 4px 15px rgba(227, 24, 55, 0.3);
  outline: none;
  
  &:focus {
    outline: none;
  }
  
  &:active {
    outline: none;
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }
`;

const LoadingMessage = styled.div`
  color: white;
  font-size: 1.5rem;
  text-align: center;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 1.2rem;
  text-align: center;
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(255, 107, 107, 0.3);
`;

const RetryButton = styled.button`
  background: transparent;
  color: white;
  border: 2px solid white;
  padding: 12px 25px;
  border-radius: 50px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: white;
    color: #000;
  }
`;

export default function Screen9_Video() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [resultVideoUrl, setResultVideoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const { 
    jobId, 
    resultData, 
    videoCache, 
    processedJobs,
    setJobId,
    setResultData,
    setSelectedVideoId,
    setProcessedJobs,
    setShowCompletionPopup,
    setCompletionCountdown
  } = useDeepfake();

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setVideoEnded(false);
    }
  };

  const handleNext = () => {
    console.log("➡️ 다음으로 넘어가기 - 완료 화면으로 이동");
    playNavigationSound('next');
    navigate("/complete"); // 완료 화면으로 이동 (올바른 경로)
  };

  const handleSelectOther = () => {
    // 촬영된 이미지 세션은 유지하고 카드 선택 화면으로 이동
    console.log("🔄 다른 상황 체험하기 - 촬영 세션 유지, 카드 선택으로 이동");
    playNavigationSound('back');
    
    // 🧹 기존 처리 결과 및 상태 초기화 (중요!)
    setResultData(null);
    setJobId(null);
    setSelectedVideoId(null);
    
    // 🗑️ 전역 캐시 및 처리 상태 초기화
    if (videoCache) {
      videoCache.clear();
      console.log("🗑️ Video cache cleared");
    }
    
    // 처리된 작업 목록에서 현재 작업 제거
    if (processedJobs && jobId) {
      setProcessedJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
    
    // 팝업 상태 초기화
    setShowCompletionPopup(false);
    setCompletionCountdown(0);
    
    // jobId와 연관된 임시 파일들 정리 요청
    if (jobId) {
      // cleanupFiles(jobId).catch(console.error);
    }
    
    console.log("🧹 State cleaned up for new situation selection");
    navigate("/situation"); // 카드 선택 화면으로 이동 (올바른 경로)
  };

  const createVideoUrl = (base64Data) => {
    try {
      // base64를 blob으로 변환
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'video/mp4' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating video URL:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadVideo = async () => {
      console.log('🎥 Loading video...', { jobId, hasResultData: !!resultData });
      
      setIsLoading(true);
      setError(null);
      
      try {
        if (!jobId) {
          throw new Error('작업 ID가 없습니다. 처음부터 다시 시작해주세요.');
        }
        
        // 🚀 전역 캐시 우선 확인 (가장 빠름!)
        if (videoCache && videoCache.has(jobId)) {
          const cachedVideo = videoCache.get(jobId);
          console.log('⚡ Using cached video (instant load):', {
            jobId,
            blobUrl: cachedVideo.blobUrl,
            size: `${(cachedVideo.size / 1024 / 1024).toFixed(2)}MB`,
            cacheAge: `${((Date.now() - cachedVideo.downloadTime) / 1000).toFixed(1)}s ago`
          });
          setResultVideoUrl(cachedVideo.blobUrl);
          setIsLoading(false);
          return;
        }
        
        // 🎯 resultData에서 바로 사용 (이미 8페이지에서 준비됨!)
        if (resultData && resultData.success) {
          
          // 📦 blob URL 사용 (예전 방식 - 버퍼링 없음!)
          if (resultData.blobReady && resultData.videoUrl && resultData.videoUrl.startsWith('blob:')) {
            console.log('✅ Using blob URL for smooth playback (no buffering):', resultData.videoUrl);
            setResultVideoUrl(resultData.videoUrl);
            setIsLoading(false);
            return;
          }
          
          // 📦 일반 blob URL도 사용
          if (resultData.videoUrl && resultData.videoUrl.startsWith('blob:')) {
            console.log('📦 Using blob URL:', resultData.videoUrl);
            setResultVideoUrl(resultData.videoUrl);
            setIsLoading(false);
            return;
          }
          
          // 🚀 스트리밍 URL (폴백용)
          if (resultData.isStreaming && resultData.videoUrl) {
            const mode = resultData.fallbackMode ? 'fallback' : 'normal';
            console.log(`🚀 Using streaming URL (${mode}):`, resultData.videoUrl);
            setResultVideoUrl(resultData.videoUrl);
            setIsLoading(false);
            return;
          }
          
          // 📦 일반 blob URL 사용
          if (resultData.videoUrl && resultData.videoUrl.startsWith('blob:')) {
            console.log('📦 Using blob URL:', resultData.videoUrl);
            setResultVideoUrl(resultData.videoUrl);
            setIsLoading(false);
            return;
          }
          
          // 📥 base64 데이터가 있으면 변환
          if (resultData.data) {
            console.log('📥 Converting base64 to blob URL...');
            const videoUrl = createVideoUrl(resultData.data);
            setResultVideoUrl(videoUrl);
            setIsLoading(false);
            return;
          }
        }
        
        // 🚀 스트리밍 처리 완료 대기
        const isStreamingPreparing = processedJobs.has(jobId) && (!resultData || !resultData.success);
        
        if (isStreamingPreparing) {
          console.log('🚀 Streaming is being prepared in Screen8_Processing, waiting...');
          // 로딩 상태 유지 (곧 스트리밍 URL 받을 예정)
          setIsLoading(true);
          return;
        }
        
        // 📭 데이터 없음: 처음부터 다시 시작 필요
        console.log('📭 No cache, result data, or download in progress');
        throw new Error('비디오 데이터를 찾을 수 없습니다. 처음부터 다시 시작해주세요.');
        
      } catch (error) {
        console.error('🎥 Video load error:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    loadVideo();

    // 컴포넌트 언마운트 시 URL 해제
    return () => {
      if (resultVideoUrl && resultVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(resultVideoUrl);
      }
    };
  }, [jobId, resultData, videoCache]);

  // 비디오 로드 완료 시 자동 재생
  const handleVideoLoad = () => {
    if (videoRef.current) {
      // 즉시 재생 시도
      videoRef.current.play().catch(error => {
        console.log('Auto-play blocked, user interaction required:', error);
      });
    }
  };

  if (isLoading) {
    return (
      <Container>
        <CommonHeader />
        <ContentWrapper>
          <MainTitle>딥페이크 영상 로딩 중...</MainTitle>
          <VideoContainer>
            <LoadingMessage>딥페이크 영상을 불러오는 중입니다...</LoadingMessage>
          </VideoContainer>
        </ContentWrapper>
      </Container>
    );
  }

  // 에러 상태 렌더링
  if (error) {
    return (
      <Container>
        <CommonHeader />
        <ContentWrapper>
          <MainTitle>딥페이크 영상</MainTitle>
          <VideoContainer>
            <VideoOverlay show={true}>
              <ErrorMessage>
                영상을 불러오는 중 오류가 발생했습니다
                <br />
                {error}
              </ErrorMessage>
              <RetryButton onClick={() => window.location.reload()}>
                다시 시도
              </RetryButton>
            </VideoOverlay>
          </VideoContainer>
        </ContentWrapper>
        <ButtonContainer>
          <ReplayButton onClick={handleSelectOther}>
            다른 상황 체험하기
          </ReplayButton>
          <NextButton onClick={() => navigate("/")}>
            처음으로 돌아가기
          </NextButton>
        </ButtonContainer>
      </Container>
    );
  }

  return (
    <Container>
      <CommonHeader />
      
      <ContentWrapper>
        <VideoContainer>
          {resultVideoUrl ? (
            <>
              <Video
                ref={videoRef}
                src={resultVideoUrl}
                controls
                onEnded={handleVideoEnd}
                onLoadedData={handleVideoLoad}
                muted
                playsInline
                preload="metadata" // 빠른 로딩을 위해 metadata만 preload
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error('🚀 Video streaming error:', e);
                  setError('영상 스트리밍 중 오류가 발생했습니다. 새로고침해주세요.');
                }}
                onLoadStart={() => {
                  console.log('🚀 Video streaming started...');
                  setIsBuffering(true);
                }}
                onCanPlay={() => {
                  console.log('🚀 Video ready to stream!');
                  setIsBuffering(false);
                }}
                onProgress={() => console.log('🚀 Video buffering...')}
                onWaiting={() => {
                  console.log('🚀 Video waiting for buffer...');
                  setIsBuffering(true);
                }}
                onPlaying={() => {
                  console.log('🚀 Video playing smoothly!');
                  setIsBuffering(false);
                }}
                onCanPlayThrough={() => {
                  console.log('🚀 Video fully loaded and can play through!');
                  setIsBuffering(false);
                }}
                style={{
                  objectFit: 'cover',
                  willChange: 'auto' // GPU 가속 최적화
                }}
                // 버퍼링 최적화를 위한 추가 속성들
                autoPlay={false} // 자동재생 비활성화로 빠른 로딩
              />
              {/* 버퍼링 중일 때 표시 */}
              {isBuffering && (
                <VideoOverlay show={true}>
                  <LoadingMessage> 로딩 중...</LoadingMessage>
                </VideoOverlay>
              )}
              
              <VideoOverlay show={videoEnded}>
                <ReloadIcon onClick={handleReplay} />
              </VideoOverlay>
            </>
          ) : (
            <VideoOverlay show={true}>
              <LoadingMessage>영상을 불러올 수 없습니다.</LoadingMessage>
              <RetryButton onClick={() => window.location.reload()}>
                다시 시도
              </RetryButton>
            </VideoOverlay>
          )}
        </VideoContainer>
      </ContentWrapper>
      
      <ButtonContainer>
        <ReplayButton onClick={handleSelectOther}>
          다른 상황 체험하기
        </ReplayButton>
        <NextButton onClick={handleNext}>
          다음으로 넘어가기
        </NextButton>
      </ButtonContainer>
    </Container>
  );
} 