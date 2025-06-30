import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useDeepfake } from "../context/DeepfakeContext";

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

export default function CommonHeader() {
  return (
    <Header>
      <LeftBrand>KT AI Station</LeftBrand>
      <HeaderLine />
      <RightBrand>Deepfake</RightBrand>
    </Header>
  );
} 