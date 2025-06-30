import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
`;

const PopupBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 500px;
  width: 90%;
  animation: slideIn 0.5s ease-out;

  @keyframes slideIn {
    from {
      transform: translateY(-100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const Title = styled.h1`
  color: #dc3545;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;

const Description = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const WarningText = styled.p`
  color: #dc3545;
  font-weight: bold;
  margin-bottom: 2rem;
  font-size: 1.2rem;
`;

const Timer = styled.div`
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const Button = styled.button`
  background-color: ${props => props.secondary ? "#6c757d" : "#dc3545"};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.secondary ? "#5a6268" : "#c82333"};
  }
`;

export default function Screen13_Popup() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      navigate("/end");
    }
  }, [countdown, navigate]);

  return (
    <Container>
      <PopupBox>
        <Title>⚠️ 주의: 딥페이크 영상 유출</Title>
        <Description>
          방금 생성된 당신의 딥페이크 영상이 SNS에 유출되었습니다.
          이 영상은 이미 수백 명에게 공유되었으며, 계속해서 퍼지고 있습니다.
        </Description>
        <WarningText>
          이것은 시뮬레이션입니다.
          하지만 실제로 이런 일이 발생한다면 어떨까요?
        </WarningText>
        <Timer>
          {countdown}초 후 자동으로 이동합니다
        </Timer>
        <ButtonContainer>
          <Button onClick={() => {
            playNavigationSound('next');
            navigate("/end");
          }}>
            다음으로
          </Button>
        </ButtonContainer>
      </PopupBox>
    </Container>
  );
} 