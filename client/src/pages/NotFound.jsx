import { useEffect, useState } from "react";
import { NavBar } from "../components/NavBar";
import { Footer } from "../components/Footer";
import { Starbackground } from "@/components/Starbackground";
import { ThemeToggle } from "@/components/ThemeToggle";

export const NotFound = () => {
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
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* Background effects */}
      <ThemeToggle />
      <Starbackground />
      
      {/* Navigation Bar */}
      <NavBar />

      {/* Main Content */}
      <section id="not-found" className="py-24 px-4 relative flex-grow">
        <div className="container mx-auto max-w-5xl relative z-10">
          <h2 className={`text-3xl md:text-4xl font-bold mb-12 text-center ${
            isDarkMode ? 'text-foreground' : 'text-black bg-white/10'
          }`}>
            404 - <span className={
              isDarkMode 
                ? 'text-primary' 
                : 'bg-gradient-to-r from-black to-red-600 bg-clip-text text-transparent'
            }>Page Not Found</span>
          </h2>
          
          <div className="items-center">
            <div className="space-y-6">
              <h3 className={`text-2xl font-semibold ${
                isDarkMode ? 'text-foreground' : 'text-black bg-white/10'
              }`}>
                Oops! Something Went Wrong
              </h3>
              <p className={`${
                isDarkMode ? 'text-muted-foreground' : 'text-black bg-white/10'
              }`}>
                The page you're looking for doesn't exist or has been moved. 
                Don't worry, let's get you back on track!
              </p>
            </div>
          </div>
          
          <div className="mt-6 text-center flex justify-center gap-4">
            <a 
              href="/" 
              className={`px-6 py-2 rounded-full border transition-colors duration-300 card-hover ${
                isDarkMode 
                  ? 'border-primary text-primary hover:bg-primary/10' 
                  : 'border-red-600 text-red-600 hover:bg-red-600/10 bg-white/10 backdrop-blur-sm'
              }`}
            >
              Return Home
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

      {/* Footer */}
      <Footer />
    </div>
  );
};