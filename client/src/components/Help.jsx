import { useEffect, useState } from "react";

export const Help = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const htmlElement = document.documentElement;
      const hasDarkClass = htmlElement.classList.contains('dark');
      setIsDarkMode(hasDarkClass);
    };
    
    checkTheme();
    
    // Create observer to watch for theme changes
    const observer = new MutationObserver(() => {
      checkTheme();
    });
    
    // Watch for class changes on document.documentElement (html element)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section id="help" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className={`text-3xl md:text-4xl font-bold mb-12 text-center ${
          isDarkMode ? 'text-foreground' : 'text-black bg-white/10'
        }`}>
          Help & <span className={
            isDarkMode 
              ? 'text-primary' 
              : 'bg-gradient-to-r from-black to-red-600 bg-clip-text text-transparent'
          }>Getting Started</span>
        </h2>
        
        {/* Quick Start Guide */}
        <div className="mb-16">
          <h3 className={`text-2xl font-semibold mb-8 text-center ${
            isDarkMode ? 'text-foreground' : 'text-black bg-white/10'
          }`}>
            Choose Your Communication Mode
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ASL to Speech */}
            <div className={`${
              isDarkMode ? 'gradient-border p-8 card-hover' : 'bg-white/10 backdrop-blur-sm p-8 card-hover'
            }`}>
              <h4 className={`text-xl font-semibold mb-6 ${
                isDarkMode ? 'text-primary' : 'text-red-600'
              }`}>
                📹 ASL to Speech
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className={`${
                    isDarkMode ? 'bg-primary text-white' : 'bg-red-600 text-white'
                  } rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1`}>1</span>
                  <div>
                    <p className={`font-medium ${
                      isDarkMode ? 'text-foreground' : 'text-black'
                    }`}>Position Your Camera</p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-muted-foreground' : 'text-black'
                    }`}>Ensure your hands and upper body are clearly visible in the camera frame</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className={`${
                    isDarkMode ? 'bg-primary text-white' : 'bg-red-600 text-white'
                  } rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1`}>2</span>
                  <div>
                    <p className={`font-medium ${
                      isDarkMode ? 'text-foreground' : 'text-black'
                    }`}>Start Signing</p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-muted-foreground' : 'text-black'
                    }`}>Begin signing at a natural pace - our AI will detect and translate your signs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className={`${
                    isDarkMode ? 'bg-primary text-white' : 'bg-red-600 text-white'
                  } rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1`}>3</span>
                  <div>
                    <p className={`font-medium ${
                      isDarkMode ? 'text-foreground' : 'text-black'
                    }`}>Listen to Translation</p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-muted-foreground' : 'text-black'
                    }`}>Your signs will be converted to clear, natural-sounding speech in real-time</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <a href="/asl_speech" className={`inline-block px-4 py-2 rounded-full border transition-colors duration-300 text-sm ${
                  isDarkMode 
                    ? 'border-primary text-primary hover:bg-primary/10' 
                    : 'border-red-600 text-red-600 hover:bg-red-600/10 bg-white/10 backdrop-blur-sm'
                }`}>
                  Try ASL to Speech →
                </a>
              </div>
            </div>

            {/* Speech to ASL */}
            <div className={`${
              isDarkMode ? 'gradient-border p-8 card-hover' : 'bg-white/10 backdrop-blur-sm p-8 card-hover'
            }`}>
              <h4 className={`text-xl font-semibold mb-6 ${
                isDarkMode ? 'text-primary' : 'text-red-600'
              }`}>
                🎤 Speech to ASL
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className={`${
                    isDarkMode ? 'bg-primary text-white' : 'bg-red-600 text-white'
                  } rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1`}>1</span>
                  <div>
                    <p className={`font-medium ${
                      isDarkMode ? 'text-foreground' : 'text-black'
                    }`}>Allow Microphone Access</p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-muted-foreground' : 'text-black'
                    }`}>Grant permission for the app to access your microphone when prompted</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className={`${
                    isDarkMode ? 'bg-primary text-white' : 'bg-red-600 text-white'
                  } rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1`}>2</span>
                  <div>
                    <p className={`font-medium ${
                      isDarkMode ? 'text-foreground' : 'text-black'
                    }`}>Speak Clearly</p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-muted-foreground' : 'text-black'
                    }`}>Talk at a normal pace and volume - our speech recognition will capture your words</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className={`${
                    isDarkMode ? 'bg-primary text-white' : 'bg-red-600 text-white'
                  } rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1`}>3</span>
                  <div>
                    <p className={`font-medium ${
                      isDarkMode ? 'text-foreground' : 'text-black'
                    }`}>Watch the Translation</p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-muted-foreground' : 'text-black'
                    }`}>See your speech converted into clear ASL animations and text descriptions</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <a href="/speech_asl" className={`inline-block px-4 py-2 rounded-full border transition-colors duration-300 text-sm ${
                  isDarkMode 
                    ? 'border-primary text-primary hover:bg-primary/10' 
                    : 'border-red-600 text-red-600 hover:bg-red-600/10 bg-white/10 backdrop-blur-sm'
                }`}>
                  Try Speech to ASL →
                </a>
              </div>
            </div>
          </div>
        </div>
  
        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className={`text-lg italic mb-6 ${
            isDarkMode ? 'text-gray-300' : 'text-black bg-white/10'
          }`}>
            Ready to break down communication barriers?
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="/asl_speech" className={`px-6 py-3 rounded-full border transition-colors duration-300 ${
              isDarkMode 
                ? 'border-primary text-primary hover:bg-primary/10' 
                : 'border-red-600 text-red-600 hover:bg-red-600/10 bg-white/10 backdrop-blur-sm'
            }`}>
              Start with ASL to Speech
            </a>
            <a href="/speech_asl" className={`px-6 py-3 rounded-full border transition-colors duration-300 ${
              isDarkMode 
                ? 'border-primary text-primary hover:bg-primary/10' 
                : 'border-red-600 text-red-600 hover:bg-red-600/10 bg-white/10 backdrop-blur-sm'
            }`}>
              Start with Speech to ASL
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};