import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Screen9_Video from "./components/Screen9_Video";
import Screen10_Complete from "./components/Screen10_Complete";
import Screen10_ImageResult from "./components/Screen10_ImageResult";
import Screen11_VideoResult from "./components/Screen11_VideoResult";
import Screen12_End from "./components/Screen12_End";
import Screen13_Popup from "./components/Screen13_Popup";
import Screen13_Prevention from "./components/Screen13_Prevention";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Screen1_Start />} />
        <Route path="/intro" element={<Screen2_Intro />} />
        <Route path="/process" element={<Screen3_Process />} />
        <Route path="/quiz" element={<Screen4_Quiz />} />
        <Route path="/quiz-result-correct" element={<Screen4_1_Result />} />
        <Route path="/quiz-result-wrong" element={<Screen4_2_Result />} />
        <Route path="/privacy" element={<Screen5_Privacy />} />
        <Route path="/capture" element={<Screen6_Capture />} />
        <Route path="/gender" element={<Screen7_Gender />} />
        <Route path="/situation" element={<Screen8_Situation />} />
        <Route path="/processing" element={<Screen8_Processing />} />
        <Route path="/video" element={<Screen9_Video />} />
        <Route path="/complete" element={<Screen10_Complete />} />
        <Route path="/image-result" element={<Screen10_ImageResult />} />
        <Route path="/video-result" element={<Screen11_VideoResult />} />
        <Route path="/end" element={<Screen12_End />} />
        <Route path="/popup" element={<Screen13_Popup />} />
        <Route path="/prevention" element={<Screen13_Prevention />} />
      </Routes>
    </BrowserRouter>
  );
} 