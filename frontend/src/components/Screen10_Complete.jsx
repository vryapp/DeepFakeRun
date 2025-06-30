import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useDeepfake } from "../context/DeepfakeContext";
import { playNavigationSound } from '../utils/soundUtils';

const Container = styled.div`
  width: 100%;
  height: 100vh;
  padding: 30px 60px 60px 60px;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  position: relative;
`;

const LeftBrand = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #9CD5EE;
  position: relative;
  z-index: 2;
`;

const RightBrand = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #D72B31;
  position: absolute;
  right: 0;
  z-index: 2;
`;

const HeaderLine = styled.div`
  position: absolute;
  left: 280px;
  right: 200px;
  top: 50%;
  height: 3px;
  background: linear-gradient(to right, #98D6F1 0%, #E0928A 24%, #E6193A 100%);
  z-index: 1;
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  margin-top: -60px;
`;

const CheckIcon = styled.div`
  width: 80px;
  height: 80px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: "✓";
    font-size: 4rem;
    color: white;
    font-weight: bold;
  }
`;

const MainTitle = styled.h1`
  font-size: 70px;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 40px;
  font-family: 'Pretendard', sans-serif;
`;

const Description = styled.div`
  text-align: center;
  margin-bottom: 60px;
  max-width: 1200px;
`;

const DescriptionLine = styled.p`
  font-size: 24px;
  font-weight: 400;
  color: white;
  font-family: 'Pretendard', sans-serif;
`;

const ButtonContainer = styled.div`
  margin-top: 40px;
  z-index: 2;
`;

const NextButton = styled.button`
  background: #E31837;
  color: white;
  border: none;
  padding: 1.2rem 3rem;
  font-size: 1.8rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  font-family: 'Pretendard', sans-serif;
  box-shadow: 0 4px 15px rgba(227, 24, 55, 0.4);
  outline: none;
  
  &:focus {
    outline: none;
  }
  
  &:hover {
    background: #c2185b;
    transform: scale(1.05);
  }
  
  &:active {
    outline: none;
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }
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

export default function Screen10_Complete() {
  const navigate = useNavigate();
  const {
    setCapturedImage,
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

  const handleNext = () => {
    playNavigationSound('next');
    navigate("/prevention");
  };

  const handleHome = () => {
    console.log("🏠 홈버튼 클릭 - 모든 상태 초기화");
    
    // 🧹 모든 상태 완전 초기화
    setCapturedImage(null);
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
    <Container>
      <Header>
        <LeftBrand>KT AI Station</LeftBrand>
        <HeaderLine />
        <RightBrand>Deepfake</RightBrand>
      </Header>
      
      <ContentWrapper>
        <CheckIcon />
        
        <MainTitle>딥페이크 체험이 끝났습니다.</MainTitle>
        
        <Description>
          <DescriptionLine>이 체험존에서 방금 생성된 영상은 즉시 서버에서 영구 삭제되어 어디에도 남지 않아요.</DescriptionLine>
          <DescriptionLine>하지만 현실의 딥페이크는 한 번 유출되면 복사·재배포가 손쉽게 이루어져, 원본을 지워도 완전히 사라지지 않습니다.</DescriptionLine>
        </Description>
        
        <ButtonContainer>
          <NextButton onClick={handleNext}>
            다음
          </NextButton>
        </ButtonContainer>
      </ContentWrapper>
      
      <HomeButton onClick={handleHome} />
    </Container>
  );
} 