import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
  width: 100%;
`;

export const ContentBox = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 3rem;
  border-radius: 20px;
  text-align: center;
  max-width: 800px;
  width: 90%;
  margin: 0 auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h1`
  color: #333;
  font-size: ${props => props.small ? '2rem' : '2.5rem'};
  margin-bottom: 2rem;
  text-align: center;
`;

export const Description = styled.p`
  color: #666;
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 3rem;
  text-align: center;
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: ${props => props.marginTop || '0'};
`;

export const Button = styled.button`
  background: ${props => props.secondary ? 
    'transparent' : 
    'linear-gradient(135deg, #E31837 0%, #FF4B2B 100%)'};
  color: ${props => props.secondary ? '#666' : 'white'};
  border: ${props => props.secondary ? '2px solid #666' : 'none'};
  padding: 1.2rem 3rem;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

export const Logo = styled.h1`
  color: white;
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
`;

export const Subtitle = styled.div`
  color: white;
  font-size: 1.8rem;
  margin-bottom: 4rem;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 1rem;

  &::before,
  &::after {
    content: "";
    display: block;
    width: 2rem;
    height: 2px;
    background-color: white;
  }
`;

export const WarningBox = styled.div`
  background: rgba(227, 24, 55, 0.1);
  border-left: 4px solid #E31837;
  padding: 1.5rem;
  margin: 2rem auto;
  text-align: left;
  max-width: 90%;
`;

export const WarningTitle = styled.h3`
  color: #E31837;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  text-align: left;
`;

export const WarningText = styled.p`
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  text-align: left;
`;

export const Highlight = styled.span`
  color: #E31837;
  font-weight: 600;
`; 