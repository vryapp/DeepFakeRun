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
  margin-bottom: 50px;
  line-height: 1.6;
  max-width: 1200px;
  margin: 0 auto 35px auto;
`;

const VideoContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  aspect-ratio: 16/9;
  margin: 0px auto 0px auto;
  background: linear-gradient(135deg, #8a8a8a 0%, #c5c5c5 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
`;

const ButtonContainer = styled.div`
  position: absolute;
  bottom: 4rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
`;

const ExperienceButton = styled.button`
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

export default function Screen2_Intro() {
  const navigate = useNavigate();

  return (
    <Container>
      <Header>
        <LeftBrand>KT AI Station</LeftBrand>
        <HeaderLine />
        <RightBrand>Deepfake</RightBrand>
      </Header>
      
      <MainTitle>딥페이크, 당신의 얼굴이 바뀐다면?</MainTitle>
      
      <Description>
        딥페이크는 AI가 사람의 얼굴을 그대로 추출해서 만든 '가짜 이미지 / 영상'입니다.<br />
        컴퓨터의 진짜와 구별하기 어려워, 피해자를 있지도 않은 장면에 등장시키는 일이 가능해집니다.
      </Description>
      
      <VideoContainer>
        <VideoElement
          src="/videos/2_vd.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </VideoContainer>
      
      <ButtonContainer>
        <ExperienceButton onClick={() => {
          playNavigationSound('experience');
          navigate("/process");
        }}>
          체험하기
        </ExperienceButton>
      </ButtonContainer>
    </Container>
  );
} 