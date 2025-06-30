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
`;

const MainTitle = styled.h1`
  font-size: 70px;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 40px;
  font-family: 'Pretendard', sans-serif;
`;

const SubTitle = styled.p`
  font-size: 24px;
  font-weight: 400;
  color: white;
  text-align: center;
  margin-bottom: 80px;
  font-family: 'Pretendard', sans-serif;
`;

const CardContainer = styled.div`
  display: flex;
  gap: 40px;
  justify-content: center;
  max-width: 1000px;
  width: 100%;
`;

const CardImage = styled.img`
  width: 100%;
  max-width: 350px;
  height: auto;
  border-radius: 20px;
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

export default function Screen13_Prevention() {
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

  const handleHome = () => {
    console.log("🏠 홈버튼 클릭 - 모든 상태 초기화");
    playNavigationSound('back');
    
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
        <MainTitle>딥페이크, 이렇게 예방하세요!</MainTitle>
        
        <SubTitle>오늘의 체험이 보이는 대로 믿지 않는 습관을 길러 주는 계기가 되길 바랍니다.</SubTitle>
        
        <CardContainer>
          <CardImage src="/asset/11_card_1.png" alt="예방법 카드 1" />
          <CardImage src="/asset/11_card_2.png" alt="예방법 카드 2" />
          <CardImage src="/asset/11_card_3.png" alt="예방법 카드 3" />
        </CardContainer>
      </ContentWrapper>
      
      <HomeButton onClick={handleHome} />
    </Container>
  );
} 