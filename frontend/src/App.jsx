import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createGlobalStyle } from "styled-components";
import { DeepfakeProvider } from "./context/DeepfakeContext";
import Screen1_Start from "./components/Screen1_Start";
import Screen2_Intro from "./components/Screen2_Intro";
import Screen3_Process from "./components/Screen3_Process";
import Screen4_Quiz from "./components/Screen4_Quiz";
import Screen4_1_Result from "./components/Screen4_1_Result";
import Screen4_2_Result from "./components/Screen4_2_Result";
import Screen5_Privacy from "./components/Screen5_Privacy";
import Screen6_Capture from "./components/Screen6_Capture";
import Screen7_Gender from "./components/Screen7_Gender";
import Screen8_Situation from "./components/Screen8_Situation";
import Screen8_Processing from "./components/Screen8_Processing";
import Screen8_1_SituationSelect from "./components/Screen8_1_SituationSelect";
import Screen9_Video from "./components/Screen9_Video";
import Screen10_Complete from "./components/Screen10_Complete";
import Screen10_ImageResult from "./components/Screen10_ImageResult";
import Screen11_VideoResult from "./components/Screen11_VideoResult";
import Screen12_End from "./components/Screen12_End";
import Screen13_Prevention from "./components/Screen13_Prevention";
import Screen13_Popup from "./components/Screen13_Popup";
import Screen14 from "./components/Screen14";
import Screen15 from "./components/Screen15";
import Screen16 from "./components/Screen16";
import Screen17 from "./components/Screen17";

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Pretendard';
    src: url('/fonts/Pretendard-Regular.woff2') format('woff2'),
         url('/fonts/Pretendard-Regular.woff') format('woff');
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: 'Pretendard';
    src: url('/fonts/Pretendard-Bold.woff2') format('woff2'),
         url('/fonts/Pretendard-Bold.woff') format('woff');
    font-weight: 700;
    font-style: normal;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
  }

  body {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: transparent;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  #root {
    width: 100%;
    height: 100%;
    background: url('/asset/All_Background.png') center/cover no-repeat;
    position: relative;
  }
`;

function App() {
  // 메인 딥페이크 체험 앱
  return (
    <DeepfakeProvider>
      <Router>
        <GlobalStyle />
        <Routes>
          <Route path="/" element={<Screen1_Start />} />
          <Route path="/intro" element={<Screen2_Intro />} />
          <Route path="/process" element={<Screen3_Process />} />
          <Route path="/quiz" element={<Screen4_Quiz />} />
          <Route path="/quiz/result1" element={<Screen4_1_Result />} />
          <Route path="/quiz/result2" element={<Screen4_2_Result />} />
          <Route path="/privacy" element={<Screen5_Privacy />} />
          <Route path="/capture" element={<Screen6_Capture />} />
          <Route path="/gender" element={<Screen7_Gender />} />
          <Route path="/situation" element={<Screen8_Situation />} />
          <Route path="/situation/select" element={<Screen8_1_SituationSelect />} />
          <Route path="/processing" element={<Screen8_Processing />} />
          <Route path="/video" element={<Screen9_Video />} />
          <Route path="/complete" element={<Screen10_Complete />} />
          <Route path="/image-result" element={<Screen10_ImageResult />} />
          <Route path="/video-result" element={<Screen11_VideoResult />} />
          <Route path="/end" element={<Screen12_End />} />
          <Route path="/prevention" element={<Screen13_Prevention />} />
          <Route path="/popup" element={<Screen13_Popup />} />
          <Route path="/screen14" element={<Screen14 />} />
          <Route path="/screen15" element={<Screen15 />} />
          <Route path="/screen16" element={<Screen16 />} />
          <Route path="/screen17" element={<Screen17 />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </DeepfakeProvider>
  );
}

export default App; 