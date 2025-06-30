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



const TopWordImage = styled.img`
  display: block;
  margin: 0 auto 20px auto;
  height: 50px;
  object-fit: contain;
`;

const MainTitle = styled.h1`
  font-size: 3.75rem;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 40px;
`;

const QuizCard = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
`;

const QuizHeader = styled.div`
  background: #E31837;
  color: white;
  padding: 40px 30px;
  text-align: center;
`;

const QuizQuestion = styled.h2`
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
`;

const QuizBody = styled.div`
  background: white;
  padding: 80px 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 120px;
`;

const ChoiceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const ChoiceIcon = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
  outline: none;
  
  &:focus {
    outline: none;
  }
  
  &:active {
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }
  
  img {
    width: 150px;
    height: 150px;
    object-fit: contain;
  }
`;

const ChoiceButton = styled.button`
  background: ${props => props.isO ? '#E31837' : '#0984E3'};
  color: white;
  border: none;
  padding: 16px 50px;
  font-size: 1.6rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  font-family: 'Pretendard', sans-serif;
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

const DividerLine = styled.div`
  width: 2px;
  height: 250px;
  background: #E0E0E0;
  border-radius: 1px;
`;

export default function Screen4_Quiz() {
  const navigate = useNavigate();

  const handleChoice = (isCorrect) => {
    if (isCorrect) {
      playNavigationSound('quiz_correct');
      navigate("/quiz/result1");
    } else {
      playNavigationSound('quiz_wrong');
      navigate("/quiz/result2");
    }
  };

  return (
    <Container>
      <CommonHeader />
      
      <TopWordImage src="/asset/4_word.png" alt="여기서 문제!" />
      
      <MainTitle>딥페이크QUIZ</MainTitle>
      
      <QuizCard>
        <QuizHeader>
          <QuizQuestion>Q. 얼굴 사진 하나만으로도 딥페이크가 가능하다</QuizQuestion>
        </QuizHeader>
        
        <QuizBody>
          <ChoiceContainer>
            <ChoiceIcon onClick={() => handleChoice(true)}>
              <img src="/asset/4_O.png" alt="O" />
            </ChoiceIcon>
            <ChoiceButton isO={true} onClick={() => handleChoice(true)}>
              가능하다
            </ChoiceButton>
          </ChoiceContainer>
          
          <DividerLine />
          
          <ChoiceContainer>
            <ChoiceIcon onClick={() => handleChoice(false)}>
              <img src="/asset/4_X.png" alt="X" />
            </ChoiceIcon>
            <ChoiceButton isO={false} onClick={() => handleChoice(false)}>
              불가능하다
            </ChoiceButton>
          </ChoiceContainer>
        </QuizBody>
      </QuizCard>
    </Container>
  );
} 