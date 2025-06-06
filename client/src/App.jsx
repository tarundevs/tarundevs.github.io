// import { useState, useEffect, useRef } from 'react';

// import NavBar from './components/NavBar';
// import Home from './components/Home';
// import AboutUs from './components/AboutUs';
// import ASLToTextConverter from './components/ASLToTextConverter';
// import TextToASLConverter from './components/TextToASLConverter';

// // Main App Component
// function App() {
//   const [activeTab, setActiveTab] = useState('home');

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'home':
//         return <Home />;
//       case 'about':
//         return <AboutUs />;
//       case 'asl-to-text':
//         return <ASLToTextConverter />;
//       case 'text-to-asl':
//         return <TextToASLConverter />;
//       default:
//         return <Home />;
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-white flex flex-col">
//       <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
//       <main className="flex-1 w-full bg-white">
//         {renderContent()}
//       </main>
//     </div>
//   );
// }

// export default App;

import {BrowserRouter, Route, Routes} from "react-router-dom";
import { Home } from "@/pages/Home";
import {NotFound} from "@/pages/NotFound"
import { ASLSpeechPage } from "@/pages/ASLSpeechPage";
import { SpeechASLPage } from "@/pages/SpeechASLPage";
function App() {
  

  return (
  <>
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />}/>
        <Route path="/asl_speech" element={<ASLSpeechPage />} />
        <Route path="/speech_asl" element={<SpeechASLPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </>
  );
}

export default App;