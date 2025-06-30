import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CommonHeader from "./CommonHeader";
import { useDeepfake } from "../context/DeepfakeContext";
import { startFaceFusion } from "../services/api";
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
  align-items: center;
  padding: 20px 0;
`;

const MainTitle = styled.h1`
  font-size: 3.75rem;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 80px;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
`;

const CardWrapper = styled.div`
  perspective: 1000px;
  width: 260px;
  height: 400px;
  flex: 0 0 auto;
`;

const Card = styled.button`
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  outline: none;
  padding: 0;
  position: relative;
  transform: ${props => props.$flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
  
  &:focus {
    outline: none;
  }
  
  &:hover:not(.$flipped) {
    transform: translateY(-5px);
  }
  
  &:active {
    outline: none;
  }
`;

const CardFace = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 15px;
`;

const CardFront = styled(CardFace)`
  background-image: url('/asset/${props => props.$isBlue ? 'All_bluecard.png' : 'All_redcard.png'}');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
  background-image: url('/CardBack/${props => {
    const genderPrefix = props.$isMale ? 'Card_M' : 'Card_W';
    return `${genderPrefix}${props.$cardNumber}.png`;
  }}');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

export default function Screen8_Situation() {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});
  const { setSelectedVideoId, capturedImage, setJobId, selectedGender } = useDeepfake();

  const handleCardClick = (cardId) => {
    if (flippedCards[cardId]) return; // 이미 뒤집힌 카드는 클릭 무시
    
    // 카드 선택 사운드 재생
    playNavigationSound('card');
    
    // 즉시 텍스트 변경
    setSelectedCard(cardId);
    
    // 성별과 카드에 따른 비디오 ID 계산
    const cardNumber = cardId; // 1~6 (이미 1부터 시작)
    console.log("🎯 Card selected:", cardId, "-> cardNumber:", cardNumber);
    console.log("🚹🚺 selectedGender from context:", selectedGender);
    
    const gender = selectedGender || 'male'; // 기본값 male
    const genderPrefix = gender === 'male' ? 'M' : 'W';
    const videoId = `${genderPrefix}${cardNumber}`; // M1~M6 또는 W1~W6
    
    console.log("🎬 Final calculation:");
    console.log("  - Gender:", gender);
    console.log("  - Gender prefix:", genderPrefix);
    console.log("  - Card number:", cardNumber);
    console.log("  - Video ID:", videoId);
    console.log("  - Logic: Using gender + cardNumber (", videoId, ")");
    
    setSelectedVideoId(videoId);
    
    // 카드 뒤집기 시작
    setFlippedCards(prev => ({ ...prev, [cardId]: true }));
    
    // 백그라운드에서 FaceFusion 시작 (비동기로 실행, 기다리지 않음)
    const startProcessing = async () => {
      try {
        console.log("🚀 Starting FaceFusion in background...");
        console.log("📷 capturedImage length:", capturedImage ? capturedImage.length : 'NONE');
        console.log("🎬 videoId:", videoId);
        
        const response = await startFaceFusion(capturedImage, videoId);
        console.log("📨 FaceFusion API response:", response);
        
        if (response && response.job_id) {
          setJobId(response.job_id);
          console.log("✅ FaceFusion started with job ID:", response.job_id);
        } else {
          console.error("❌ FaceFusion start failed:", response?.error || 'No job_id in response');
          console.error("📨 Full response:", response);
          // API 실패 시에도 임시 jobId 설정
          const tempJobId = `temp_${Date.now()}`;
          setJobId(tempJobId);
          console.log("⚠️ Setting temporary job ID:", tempJobId);
        }
      } catch (error) {
        console.error("❌ FaceFusion start error:", error.message);
        console.error("🔍 Error details:", error);
        // 에러 시에도 임시 jobId 설정
        const tempJobId = `temp_${Date.now()}`;
        setJobId(tempJobId);
        console.log("⚠️ Setting temporary job ID after error:", tempJobId);
      }
    };
    
    // 비동기로 실행 (기다리지 않음)
    startProcessing();
    
    // 카드 뒤집기 애니메이션 완료 후 즉시 다음 페이지로 이동 (2초)
    setTimeout(() => {
      console.log("🚀 Navigating to processing...");
      navigate("/processing");
    }, 2000);
  };

  // 6개의 개별 카드 정의 (1부터 시작)
  const cards = [
    { id: 1, type: 'red' },
    { id: 2, type: 'blue' },
    { id: 3, type: 'red' },
    { id: 4, type: 'blue' },
    { id: 5, type: 'red' },
    { id: 6, type: 'blue' }
  ];

  const getTitle = () => {
    return selectedCard !== null 
      ? "딥페이크 할 상황이 선택되었습니다."
      : "원하는 카드를 골라주세요.";
  };

  return (
    <Container>
      <CommonHeader />
      
      <ContentWrapper>
        <MainTitle>{getTitle()}</MainTitle>
        
        <CardContainer>
          {cards.map((card) => (
            <CardWrapper key={card.id}>
              <Card
                $flipped={flippedCards[card.id]}
                onClick={() => handleCardClick(card.id)}
                disabled={selectedCard !== null}
              >
                <CardFront $isBlue={card.type === 'blue'} />
                <CardBack 
                  $isMale={selectedGender === 'male'} 
                  $cardNumber={card.id}
                />
              </Card>
            </CardWrapper>
          ))}
        </CardContainer>
      </ContentWrapper>
    </Container>
  );
} 