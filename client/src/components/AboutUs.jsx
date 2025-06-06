import { useEffect, useState } from "react";

export const AboutUs = () => {
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
    <section id="about" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className={`text-3xl md:text-4xl font-bold mb-12 text-center ${
          isDarkMode ? 'text-foreground' : 'text-black bg-white/10'
        }`}>
          About <span className={
            isDarkMode 
              ? 'text-primary' 
              : 'bg-gradient-to-r from-black to-red-600 bg-clip-text text-transparent'
          }>Our Project</span>
        </h2>
        
        <div className="items-center">
          <div className="space-y-6 backdrop-blur-sm card-hover" >
            <h3 className={`text-2xl font-semibold${
              isDarkMode ? 'text-foreground' : 'text-black bg-white/10'
            }`}>
              Breaking Communication Barriers
            </h3>
            <p className={`${
              isDarkMode ? 'text-muted-foreground' : 'text-black bg-white/10'
            }`}>
              Our innovative ASL translation platform bridges the gap between deaf and hearing communities 
              through cutting-edge AI technology. We provide seamless, real-time translation between 
              American Sign Language and spoken English.
            </p>
            <p className={`${
              isDarkMode ? 'text-muted-foreground' : 'text-black bg-white/10'
            }`}>
              Whether you're learning ASL, communicating with deaf colleagues, or need accessibility 
              support in meetings, our platform makes communication effortless and inclusive.
            </p>
          </div>
        </div>
        
        
        
        <div className="mt-6 text-center flex justify-center gap-4">
          <a href="/asl_speech" className={`px-6 py-2 rounded-full border transition-colors duration-300 card-hover ${
            isDarkMode 
              ? 'border-primary text-primary hover:bg-primary/10' 
              : 'border-red-600 text-red-600 hover:bg-red-600/10 bg-white/10 backdrop-blur-sm'
          }`}>
            ASL to speech
          </a>

          <a href="/speech_asl" className={`px-6 py-2 rounded-full border transition-colors duration-300 card-hover ${
            isDarkMode 
              ? 'border-primary text-primary hover:bg-primary/10' 
              : 'border-red-600 text-red-600 hover:bg-red-600/10 bg-white/10 backdrop-blur-sm'
          }`}>
            Speech to ASL
          </a>
        </div>

        <div className="mt-4 text-center">
          <p className={`text-lg italic ${
            isDarkMode ? 'text-gray-300' : 'text-black bg-white/10'
          }`}>
            "Empowering inclusive communication through technology"
          </p>
        </div>
      </div>
    </section>
  );
};