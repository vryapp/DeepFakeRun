import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CommonHeader from "./CommonHeader";
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

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const MainTitle = styled.h1`
  font-size: 3.75rem;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 80px;
`;

const GenderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
  margin: 0;
`;

const GenderOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const GenderButton = styled.button`
  background: ${props => props.$isMale ? 'white' : '#E31837'};
  color: ${props => props.$isMale ? '#E31837' : 'white'};
  border: none;
  border-radius: 50px;
  padding: 1.2rem 4rem;
  font-size: 1.8rem;
  font-weight: 600;
  font-family: 'Pretendard', sans-serif;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(227, 24, 55, 0.3);
  outline: none;
  min-width: 150px;
  
  &:focus {
    outline: none;
  }
  
  &:active {
    outline: none;
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }
`;

export default function Screen7_Gender() {
  const navigate = useNavigate();
  const { setSelectedGender } = useDeepfake();

  const handleGenderSelect = (gender) => {
    console.log("🚹🚺 Gender selected:", gender);
    playNavigationSound('next');
    setSelectedGender(gender);
    navigate("/situation");
  };

  return (
    <Container>
      <CommonHeader />
      
      <ContentWrapper>
        <MainTitle>당신의 성별을 알려주세요.</MainTitle>
        
        <GenderContainer>
          <GenderOption>
            <GenderButton 
              $isMale={true}
              onClick={() => handleGenderSelect("male")}
            >
              남성
            </GenderButton>
          </GenderOption>
          
          <GenderOption>
            <GenderButton 
              $isMale={false}
              onClick={() => handleGenderSelect("female")}
            >
              여성
            </GenderButton>
          </GenderOption>
        </GenderContainer>
      </ContentWrapper>
    </Container>
  );
} 