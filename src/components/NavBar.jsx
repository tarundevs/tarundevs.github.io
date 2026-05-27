import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";

const navItems = [
  { name: "Home", href: "/#home" },
  { name: "About", href: "/#about" },
  { name: "Projects", href: "/#portfolio" },
  { name: "Contact", href: "/#contact" },
];

export const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location]);

  const handleHashClick = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    navigate(href);
  };

  const toggleTheme = () => {
    const newIsDark = !isDarkMode;
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  };

  return (
    <nav
      className={cn(
        "fixed w-full z-40 transition-all duration-300",
        isDarkMode
          ? "bg-transparent"
          : "bg-gradient-to-r from-black/90 to-red-600/90",
        isScrolled
          ? "py-3 backdrop-blur-md shadow-xs dark:bg-background/80"
          : "py-5"
      )}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link
          className={`text-xl font-bold flex items-center ${isDarkMode ? "text-primary" : "text-white"
            }`}
          to="/"
        >
          <span className="relative z-10">
            <span
              className={`text-glow ${isDarkMode ? "text-foreground" : "text-white"
                }`}
            >
              Tarun
            </span>{" "}
            Warrier
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item, key) => (
            <a
              key={key}
              href={item.href}
              onClick={(e) => handleHashClick(e, item.href)}
              className={`transition-colors duration-300 ${isDarkMode
                ? "text-foreground/80 hover:text-primary"
                : "text-white/90 hover:text-white"
                }`}
            >
              {item.name}
            </a>
          ))}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors duration-300 ${isDarkMode
              ? "text-foreground hover:text-primary"
              : "text-white/90 hover:text-white"
              }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile right side: theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors duration-300 ${isDarkMode ? "text-foreground" : "text-white"
              }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className={`flex flex-col gap-1.5 p-2 ${isDarkMode ? "text-foreground" : "text-white"
              }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 transition-all duration-300 ${isDarkMode ? "bg-foreground" : "bg-white"
                } ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 transition-all duration-300 ${isDarkMode ? "bg-foreground" : "bg-white"
                } ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 transition-all duration-300 ${isDarkMode ? "bg-foreground" : "bg-white"
                } ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className={`md:hidden px-6 pb-4 pt-2 flex flex-col gap-4 ${isDarkMode ? "bg-background/95" : "bg-black/95"
            }`}
        >
          {navItems.map((item, key) => (
            <a
              key={key}
              href={item.href}
              onClick={(e) => handleHashClick(e, item.href)}
              className={`text-sm transition-colors duration-300 ${isDarkMode
                ? "text-foreground/80 hover:text-primary"
                : "text-white/90 hover:text-white"
                }`}
            >
              {item.name}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};