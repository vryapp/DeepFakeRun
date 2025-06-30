import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import LetterGlitch from "../blocks/Backgrounds/LetterGlitch/LetterGlitch";
import ShinyText from "../blocks/TextAnimations/ShinyText/ShinyText";
import DecryptedText from "../blocks/TextAnimations/DecryptedText/DecryptedText";
import { playNavigationSound } from '../utils/soundUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  position: relative;
`;

const GlitchBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  opacity: .1;
`;

const DeepfakeText = styled.div`
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -60%);
  font-size: 28rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.3);
  z-index: 1;
  user-select: none;
  font-family: 'Pretendard', sans-serif;
  letter-spacing: -1.5rem;
`;

const MainIcon = styled.div`
  position: relative;
  z-index: 2;
  margin-bottom: 2rem;
  perspective: 1000px;
  
  img {
    width: 400px;
    height: 400px;
    object-fit: contain;
    animation: orbit 8s ease-in-out infinite, float 6s ease-in-out infinite;
    transform-style: preserve-3d;
    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
  }

  @keyframes orbit {
    0%, 100% { 
      transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
    }
    25% { 
      transform: rotateX(10deg) rotateY(90deg) rotateZ(5deg);
    }
    50% { 
      transform: rotateX(0deg) rotateY(180deg) rotateZ(0deg);
    }
    75% { 
      transform: rotateX(-10deg) rotateY(270deg) rotateZ(-5deg);
    }
  }

  @keyframes float {
    0%, 100% { 
      transform: translateY(0px) scale(1);
    }
    50% { 
      transform: translateY(-10px) scale(1.05);
    }
  }
`;

const Title = styled.h2`
  color: white;
  font-size: 4.2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 4rem;
  z-index: 2;
  position: relative;
  font-family: 'Pretendard', sans-serif;
`;

const StartButton = styled.button`
  background: white;
  color: #E31837;
  border: none;
  padding: 1.5rem 4rem;
  font-size: 2rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 2;
  position: relative;
  font-family: 'Pretendard', sans-serif;
  justify-self: center;
  box-shadow: 0 4px 15px rgba(227, 24, 55, 0.3);
  overflow: hidden;
  outline: none;
  
  &:focus {
    outline: none;
  }
  
  &:active {
    outline: none;
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }
  
  .shiny-text {
    color: #E31837;
    font-weight: bold;
    font-family: 'Pretendard', sans-serif;
  }
`;

const BrandContainer = styled.div`
  position: absolute;
  bottom: 4rem;
  left: 4rem;
  right: 4rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  z-index: 2;
`;

const BrandText = styled.div`
  color: white;
  font-size: 3rem;
  font-weight: bold;
  opacity: 0.9;
  font-family: 'Pretendard', sans-serif;
  
  &:first-child {
    justify-self: start;
  }
  
  &:last-child {
    justify-self: end;
  }
`;

export default function Screen1_Start() {
  const navigate = useNavigate();
  const [triggerDecrypt, setTriggerDecrypt] = useState(0);

  useEffect(() => {
    // 5초마다 decrypt 애니메이션 트리거
    const interval = setInterval(() => {
      setTriggerDecrypt(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container>
      <GlitchBackground>
        <LetterGlitch 
          glitchColors={["rgb(255, 255, 255)", "rgba(176, 176, 176, 0.8)", "rgba(136, 23, 196, 0.8)"]}
          centerVignette={true}
          outerVignette={true}
          smooth={true}
        />
      </GlitchBackground>
      <DeepfakeText>Deepfake</DeepfakeText>
      <MainIcon>
        <img src="/asset/1_main_icon.png" alt="Main Icon" />
      </MainIcon>
      <Title>
        <DecryptedText 
          key={triggerDecrypt}
          text="딥페이크 체험"
          speed={100}
          maxIterations={1}
          sequential={true}
          revealDirection="start"
          useOriginalCharsOnly={false}
          characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz가나다라마바사아자차카타파하헤호후히0123456789!@#$%^&*()_+"
          animateOn="view"
          className=""
          style={{
            color: 'white',
            fontSize: '4.2rem',
            fontWeight: 'bold',
            fontFamily: 'Pretendard, sans-serif'
          }}
        />
      </Title>

      <BrandContainer>      
        <BrandText>KT</BrandText>
        <StartButton onClick={() => {
          playNavigationSound('start');
          navigate("/intro");
        }}>
          <ShinyText text="시작하기" speed={3} />
        </StartButton>
        <BrandText>AI Station</BrandText>
      </BrandContainer>
    </Container>
  );
} 