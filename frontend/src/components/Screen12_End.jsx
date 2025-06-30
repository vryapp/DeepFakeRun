import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: url('/asset/All_Background.png') center/cover no-repeat;
  position: relative;
`;

const ProcessingScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const Title = styled.h2`
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

const VideoContainer = styled.div`
  width: 400px;
  height: 300px;
  background: #000;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  overflow: hidden;
  
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const LoadingBar = styled.div`
  width: 300px;
  height: 6px;
  background: rgba(255,255,255,0.3);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const LoadingProgress = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #E31837, #4285F4);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.p`
  color: white;
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const Popup = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'visible'
})`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: ${props => props.visible ? 1 : 0};
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const PopupContent = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  text-align: center;
  max-width: 400px;
  width: 90%;
`;

const PopupTitle = styled.h3`
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const PopupText = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const PopupButton = styled.button`
  background: #E31837;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const VideoPlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const VideoPlayer = styled.video`
  width: 600px;
  height: 400px;
  border-radius: 15px;
  margin-bottom: 2rem;
`;

const NextButton = styled.button`
  background: #27AE60;
  color: white;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

export default function Screen12_End() {
  const navigate = useNavigate();
  const [step, setStep] = useState('processing'); // processing, popup, video, complete
  const [progress, setProgress] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    // 딥페이크 처리 시뮬레이션
    if (step === 'processing') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setStep('popup');
              setPopupVisible(true);
            }, 500);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handlePopupClick = () => {
    setPopupVisible(false);
    setStep('video');
  };

  const handleVideoEnd = () => {
    setStep('complete');
  };

  const renderContent = () => {
    switch (step) {
      case 'processing':
        return (
          <ProcessingScreen>
            <Title>딥페이크 생성 중...</Title>
            <VideoContainer>
              <video autoPlay loop muted>
                <source src="/videos/v1.mp4" type="video/mp4" />
              </video>
            </VideoContainer>
            <LoadingBar>
              <LoadingProgress progress={progress} />
            </LoadingBar>
            <ProgressText>{progress}% 완료</ProgressText>
          </ProcessingScreen>
        );
      
      case 'video':
        return (
          <VideoPlayerContainer>
            <Title>딥페이크 결과</Title>
            <VideoPlayer 
              controls 
              autoPlay
              onEnded={handleVideoEnd}
            >
              <source src="/videos/v1.mp4" type="video/mp4" />
            </VideoPlayer>
          </VideoPlayerContainer>
        );
      
      case 'complete':
        return (
          <ProcessingScreen>
            <Title>체험 완료!</Title>
            <NextButton onClick={() => navigate("/screen14")}>
              다음으로
            </NextButton>
          </ProcessingScreen>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container>
      {renderContent()}
      <Popup visible={popupVisible}>
        <PopupContent>
          <PopupTitle>딥페이크 완성!</PopupTitle>
          <PopupText>
            딥페이크 영상이 완성되었습니다.<br />
            결과를 확인해보세요.
          </PopupText>
          <PopupButton onClick={handlePopupClick}>
            결과 보기
          </PopupButton>
        </PopupContent>
      </Popup>
    </Container>
  );
} 