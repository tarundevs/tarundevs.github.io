import {cn} from "@/lib/utils";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  {name: "Home", href:"/#home", isRoute: false},
  {name: "About", href:"/#about", isRoute: false},
  {name: "ASL->speech", href:"/asl_speech", isRoute: true},
  {name: "speech->ASL", href:"/speech_asl", isRoute: true},
  // {name: "Try it on gmeet", href:"/gmeet", isRoute: true},
  {name: "Help", href:"/#help", isRoute: false}
]

export const NavBar = () => {
  const [isScrolled, setIsScrolled]=useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(()=>{
    const handleScroll =() =>{
      setIsScrolled(window.scrollY > 10) // Fixed: was screenY, should be scrollY
    }

    window.addEventListener("scroll",handleScroll)
    return () => window.removeEventListener("scroll",handleScroll);
  }, [])

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

  // Handle scrolling to hash when location changes
  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.substring(1); // Remove the '#'
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

  // Handle hash scrolling
  const handleHashClick = (e, href) => {
    e.preventDefault();
    
    // Use React Router to navigate to the hash URL
    navigate(href);
  };

  return <nav className={cn(
    "fixed w-full z-40 transition-all duration-300",
    // Base styles - use red gradient in light mode, transparent in dark mode
    isDarkMode 
      ? "bg-transparent" 
      : "bg-gradient-to-r from-black/90 to-red-600/90",
    // Scrolled styles
    isScrolled 
      ? "py-3 backdrop-blur-md shadow-xs dark:bg-background/80" 
      : "py-5"
  )}>

  <div className="container flex items-center justify-between">
      <Link className={`text-xl font-bold flex items-center ${
        isDarkMode 
          ? 'text-primary' 
          : 'text-white'
      }`} to="/">
        <span className="relative z-10">
          <span className={`text-glow ${
            isDarkMode 
              ? 'text-foreground' 
              : 'text-white'
          }`}>Ethereal </span> Stream
        </span>
      </Link>

    <div className="hidden md:flex space-x-8">
      {navItems.map((item, key) => (
        item.isRoute ? (
          <Link 
            key={key} 
            to={item.href} 
            className={`transition-colors duration-300 ${
              isDarkMode 
                ? 'text-foreground/80 hover:text-primary' 
                : 'text-white/90 hover:text-white'
            }`}
          >
            {item.name}
          </Link>
        ) : (
          <a 
            key={key} 
            href={item.href}
            onClick={(e) => handleHashClick(e, item.href)}
            className={`transition-colors duration-300 ${
              isDarkMode 
                ? 'text-foreground/80 hover:text-primary' 
                : 'text-white/90 hover:text-white'
            }`}
          >
            {item.name}
          </a>
        )
      ))}
    </div>
  </div>

  </nav>;
};