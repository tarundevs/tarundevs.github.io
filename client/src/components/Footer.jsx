import { ArrowUp, Github, Twitter, Mail, Heart, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const footerLinks = { product: [{ name: "ASL to Speech", href: "/asl_speech", isRoute: true }, { name: "Speech to ASL", href: "/speech_asl", isRoute: true }, { name: "Google Meet Integration", href: "/gmeet", isRoute: true }, { name: "Features", href: "/#about", isRoute: false }, { name: "Help Center", href: "/#help", isRoute: false }] };

export const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => { if (window.pageYOffset > 300) { setIsVisible(true); } else { setIsVisible(false); } };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  useEffect(() => {
    const checkTheme = () => { const htmlElement = document.documentElement; const hasDarkClass = htmlElement.classList.contains('dark'); setIsDarkMode(hasDarkClass); };
    checkTheme();
    const observer = new MutationObserver(() => { checkTheme(); });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { observer.disconnect(); };
  }, []);

  const scrollToTop = () => { window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <>
      <footer className={cn("relative mt-20 transition-all duration-300", isDarkMode ? "bg-background border-t border-border/50" : "bg-gradient-to-br from-gray-900 via-black to-red-900/20")}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,0,0,0.1),transparent)]"></div>
        </div>

        <div className="relative container mx-auto px-6 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link to="/" className={cn("text-2xl font-bold flex items-center mb-4 group transition-all duration-300", isDarkMode ? "text-foreground" : "text-white")}>
                <span className="relative">
                  <span className={cn("text-glow transition-all duration-300 group-hover:scale-105", isDarkMode ? "text-primary" : "text-white")}>Ethereal</span>
                  <span className={cn("ml-1 transition-colors duration-300", isDarkMode ? "text-foreground/80" : "text-white/90")}>Stream</span>
                </span>
              </Link>
              <p className={cn("text-sm leading-relaxed mb-6 max-w-md", isDarkMode ? "text-muted-foreground" : "text-white/70")}>Breaking communication barriers with innovative ASL and speech technology. Making conversations more accessible for everyone.</p>
            </div>
          </div>

          {/* Bottom Section */}
          <div className={cn("pt-8 border-t flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0", isDarkMode ? "border-border/50" : "border-white/10")}>
            <div className={cn("text-sm flex items-center space-x-2", isDarkMode ? "text-muted-foreground" : "text-white/60")}>
              <span>© {new Date().getFullYear()} Ethereal Stream.</span>
            </div>
            <div className={cn("text-xs", isDarkMode ? "text-muted-foreground/80" : "text-white/50")}>Breaking barriers, building connections</div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {isVisible && (
        <button onClick={scrollToTop} className={cn("fixed bottom-8 right-8 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 group", isDarkMode ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800", "hover:shadow-xl backdrop-blur-sm")} aria-label="Scroll to top">
          <ArrowUp size={20} className="transition-transform duration-300 group-hover:-translate-y-1" />
        </button>
      )}
    </>
  );
};