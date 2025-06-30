import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

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

const Title = styled.h2`
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 3rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

const CardContainer = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: center;
  margin-bottom: 3rem;
`;

const Card = styled.div`
  width: 200px;
  height: 280px;
  perspective: 1000px;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
`;

const CardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  transform: ${props => props.$flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 15px;
  }
`;

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
`;

const NextButton = styled.button`
  background: #E31837;
  color: white;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s;
  opacity: ${props => props.visible ? 1 : 0};
  transform: ${props => props.visible ? 'translateY(0)' : 'translateY(20px)'};
  transition: all 0.5s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

export default function Screen10_ImageResult() {
  const navigate = useNavigate();
  const [flippedCards, setFlippedCards] = useState([false, false, false]);
  const [allFlipped, setAllFlipped] = useState(false);

  const cards = [
    { back: '/asset/backcard_1.png', front: '/asset/17_card_1.png' },
    { back: '/asset/backcard_1.png', front: '/asset/17_card_2.png' },
    { back: '/asset/backcard_1.png', front: '/asset/17_card_3.png' }
  ];

  const handleCardClick = (index) => {
    if (flippedCards[index]) return;
    
    playNavigationSound('card');
    
    const newFlippedCards = [...flippedCards];
    newFlippedCards[index] = true;
    setFlippedCards(newFlippedCards);
    
    // 모든 카드가 뒤집혔는지 확인
    if (newFlippedCards.every(flipped => flipped)) {
      setTimeout(() => setAllFlipped(true), 1000);
    }
  };

  return (
    <Container>
      <Title>카드를 선택하세요</Title>
      <CardContainer>
        {cards.map((card, index) => (
          <Card 
            key={index} 
            onClick={() => handleCardClick(index)}
            disabled={flippedCards[index]}
          >
            <CardInner $flipped={flippedCards[index]}>
              <CardFace>
                <img src={card.back} alt="카드 뒷면" />
              </CardFace>
              <CardBack>
                <img src={card.front} alt="카드 앞면" />
              </CardBack>
            </CardInner>
          </Card>
        ))}
      </CardContainer>
      <NextButton 
        visible={allFlipped}
        onClick={() => {
          playNavigationSound('next');
          navigate("/video-result");
        }}
      >
            다음으로
      </NextButton>
    </Container>
  );
} 