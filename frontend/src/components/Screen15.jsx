import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { playNavigationSound } from '../utils/soundUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: url('/asset/All_Background.png') center/cover no-repeat;
  position: relative;
  overflow: hidden;
`;

const Content = styled.div`
  color: white;
  font-size: 2rem;
  text-align: center;
  position: relative;
  z-index: 1;
  margin-bottom: 2rem;
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
  position: relative;
  z-index: 1;

  &:hover {
    transform: translateY(-2px);
  }
`;

export default function Screen15() {
  const navigate = useNavigate();

  return (
    <Container>
      <Content>Screen 15 Content</Content>
      <NextButton onClick={() => {
        playNavigationSound('next');
        navigate("/screen16");
      }}>
        다음
      </NextButton>
    </Container>
  );
} 