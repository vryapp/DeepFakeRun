import { useState } from "react";
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

const MainTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 40px;
`;

const PrivacyCard = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto 80px auto;
  padding: 30px 20px 40px 30px;
`;

const PrivacySection = styled.div`
  margin-bottom: 30px;
`;

const BulletPoint = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  line-height: 1.6;
  
  &::before {
    content: "●";
    color: #333;
    font-size: 1rem;
    margin-right: 8px;
    margin-top: 2px;
    flex-shrink: 0;
  }
`;

const PrivacyText = styled.span`
  color: #333;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const HighlightSection = styled.div`
  background: #f5f5f5;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
`;

const SectionTitle = styled.h3`
  color: #333;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 15px;
`;

const SectionContent = styled.div`
  margin-bottom: 15px;
`;

const ButtonContainer = styled.div`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
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

const AgreeButton = styled.button`
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

export default function Screen5_Privacy() {
  const navigate = useNavigate();

  return (
    <Container>
      <CommonHeader />
      
      <MainTitle>딥페이크 체험을 위해 개인정보 동의가 필요합니다.</MainTitle>
      
      <PrivacyCard>
        <HighlightSection>
          <SectionTitle>개인정보 제공 동의</SectionTitle>
          <SectionContent>
            <PrivacyText><strong>제공받는 자:</strong> KT</PrivacyText>
          </SectionContent>
          <SectionContent>
            <PrivacyText><strong>제공하는 개인정보 항목:</strong> 얼굴 사진</PrivacyText>
          </SectionContent>
          <SectionContent>
            <PrivacyText><strong>제공목적:</strong> 본인은 KT에서 진행하는 딥페이크 체험 행사 진행과 관련하여 본인의 얼굴 사진 촬영 및 이용에 동의합니다. 수집된 사진은 딥페이크 체험 행사에 사용될 예정이며, 다른 목적으로는 사용되지 않습니다.</PrivacyText>
          </SectionContent>
          <SectionContent>
            <PrivacyText><strong>제공받는 자의 보유기간:</strong> 체험 종료후 즉시 폐기 (행사 진행 당일)</PrivacyText>
          </SectionContent>
        </HighlightSection>
        
        <HighlightSection>
          <SectionTitle>개인정보 처리 위탁 동의</SectionTitle>
          <SectionContent>
            <PrivacyText><strong>수탁사:</strong> (주)이데아인터렉티브</PrivacyText>
          </SectionContent>
        </HighlightSection>
        
        <PrivacySection>
          <SectionTitle>중요사항 안내</SectionTitle>
          <BulletPoint>
            <PrivacyText>
              본 행사 참여 고객은 개인정보 수집 이용 동의 / 개인정보 처리 위탁 동의에 대해 거부할 권리를 가지고 있으며, 이에 대한 미동의 시 행사에 참여하실 수 없습니다.
            </PrivacyText>
          </BulletPoint>
          <BulletPoint>
            <PrivacyText>
              수집된 얼굴 사진은 딥페이크 체험 행사 목적으로만 사용되며, 체험 종료 후 즉시 삭제됩니다.
            </PrivacyText>
          </BulletPoint>
          <BulletPoint>
            <PrivacyText>
              개인정보 처리에 관한 동의는 언제든지 철회할 수 있으며, 동의 철회 시 체험 서비스 이용이 중단될 수 있습니다.
            </PrivacyText>
          </BulletPoint>
        </PrivacySection>
      </PrivacyCard>
      
      <ButtonContainer>
        <BackButton onClick={() => {
          playNavigationSound('back');
          navigate("/quiz");
        }}>
          돌아가기
        </BackButton>
        <AgreeButton onClick={() => {
          playNavigationSound('agree');
          navigate("/capture");
        }}>
          동의 후 진행
        </AgreeButton>
      </ButtonContainer>
    </Container>
  );
} 