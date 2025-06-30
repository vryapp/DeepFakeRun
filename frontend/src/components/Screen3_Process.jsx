import { useNavigate } from "react-router-dom";
import styled from "styled-components";
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

const MainTitle = styled.h1`
  font-size: 3.75rem;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 20px;
`;

const Description = styled.p`
  font-size: 1.5rem;
  font-weight: 400;
  color: white;
  text-align: center;
  margin: 0 auto 35px auto;
  line-height: 1.6;
  max-width: 1200px;
`;

const ProcessContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin: 0 auto;
  max-width: 1200px;
`;

const ProcessCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  width: 300px;
  text-align: center;
  position: relative;
`;

const ProcessImage = styled.img`
  width: 240px;
  height: 280px;
  object-fit: cover;
  border-radius: 15px;
  margin-bottom: 20px;
`;

const ProcessNumber = styled.div`
  background: #E31837;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 auto 15px auto;
`;

const ProcessTitle = styled.h3`
  color: #333;
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 8px;
`;

const ProcessSubtitle = styled.p`
  color: #666;
  font-size: 1rem;
  margin: 0;
`;

const ArrowIcon = styled.div`
  color: white;
  font-size: 3rem;
  font-weight: bold;
`;

const ButtonContainer = styled.div`
  position: absolute;
  bottom: 4rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
`;

const NextButton = styled.button`
  background: white;
  color: #E31837;
  border: none;
  padding: 1.5rem 4rem;
  font-size: 2rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
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

export default function Screen3_Process() {
  const navigate = useNavigate();

  return (
    <Container>
      <Header>
        <LeftBrand>KT AI Station</LeftBrand>
        <HeaderLine />
        <RightBrand>Deepfake</RightBrand>
      </Header>
      
      <MainTitle>딥페이크는 어떻게 진행되나요?</MainTitle>
      
      <Description>
        딥페이크를 하기 위해서는 많은 대상의 사진과 영상이 필요해요.<br />
        사진과 영상의 수가 많아질 수록 실제처럼 느껴지는 매우 정교한 딥페이크가 가능합니다.
      </Description>
      
      <ProcessContainer>
        <ProcessCard>
          <ProcessImage src="/asset/3_IMG_1.png" alt="인물 얼굴 데이터" />
          <ProcessNumber>01</ProcessNumber>
          <ProcessTitle>인물의 얼굴 데이터</ProcessTitle>
          <ProcessSubtitle>수집/학습</ProcessSubtitle>
        </ProcessCard>
        
        <ArrowIcon>→</ArrowIcon>
        
        <ProcessCard>
          <ProcessImage src="/asset/3_IMG_2.png" alt="얼굴 데이터 합성" />
          <ProcessNumber>02</ProcessNumber>
          <ProcessTitle>얼굴 데이터</ProcessTitle>
          <ProcessSubtitle>합성</ProcessSubtitle>
        </ProcessCard>
        
        <ArrowIcon>→</ArrowIcon>
        
        <ProcessCard>
          <ProcessImage src="/asset/3_IMG_3.png" alt="딥페이크 최종 적용" />
          <ProcessNumber>03</ProcessNumber>
          <ProcessTitle>딥페이크</ProcessTitle>
          <ProcessSubtitle>최종 적용</ProcessSubtitle>
        </ProcessCard>
      </ProcessContainer>
      
      <ButtonContainer>
        <NextButton onClick={() => {
          playNavigationSound('next');
          navigate("/quiz");
        }}>
          다음
        </NextButton>
      </ButtonContainer>
    </Container>
  );
} 