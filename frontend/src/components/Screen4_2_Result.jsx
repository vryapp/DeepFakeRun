import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CommonHeader from "./CommonHeader";
import { playNavigationSound } from '../utils/soundUtils';

const Container = styled.div`
  width: 100%;
  height: 100vh;
  padding: 30px 60px 60px 60px;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ResultCard = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 1000px;
  width: 100%;
  margin: 80px auto 0 auto;
  padding: 80px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ResultIcon = styled.img`
  width: 150px;
  height: 150px;
  object-fit: contain;
  margin-bottom: 30px;
`;

const ResultTitle = styled.h2`
  color: #0984E3;
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 30px;
`;

const ResultDescription = styled.p`
  color: #333;
  font-size: 1.4rem;
  line-height: 1.6;
  margin-bottom: 0;
`;

const BottomSection = styled.div`
  position: absolute;
  bottom: 150px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
`;

const BottomText = styled.p`
  color: white;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 30px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const BackButton = styled.button`
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

const ExperienceButton = styled.button`
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

export default function Screen4_2_Result() {
  const navigate = useNavigate();

  return (
    <Container>
      <CommonHeader />
      
      <ResultCard>
        <ResultIcon src="/asset/6_X.png" alt="틀림" />
        <ResultTitle>오답입니다!</ResultTitle>
        <ResultDescription>
          기술이 발전하여 사진 한 장만으로도 딥페이크가 가능합니다.<br />
          물론, 많은 사진과 영상을 활용하여 정교한 딥페이크보다 얼굴의 유사성이 떨어지지만,<br />
          사진 하나만으로도 비슷한 얼굴을 만드는 게 가능해요.
        </ResultDescription>
      </ResultCard>
      
      <BottomSection>
        <BottomText>사진을 촬영하여 딥페이크를 체험해볼까요?</BottomText>
        <ButtonContainer>
          <BackButton onClick={() => {
            playNavigationSound('back');
            navigate("/quiz");
          }}>
            돌아가기
          </BackButton>
          <ExperienceButton onClick={() => {
            playNavigationSound('experience');
            navigate("/privacy");
          }}>
            체험하기
          </ExperienceButton>
        </ButtonContainer>
      </BottomSection>
    </Container>
  );
} 