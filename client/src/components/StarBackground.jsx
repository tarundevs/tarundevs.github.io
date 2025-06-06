import { useEffect, useState } from "react";

export const Starbackground = () => {
    const [stars, setStars] = useState([]);
    const [meteors, setMeteors] = useState([]);
    const [matrixRain, setMatrixRain] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        generateStars();
        
        // Check initial theme
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

        const handleResize = () => {
            generateStars();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            generateMeteors();
            setMatrixRain([]);
        } else {
            setMeteors([]);
            generateMatrixRain();
        }
    }, [isDarkMode]);

    const checkTheme = () => {
        const htmlElement = document.documentElement;
        const hasDarkClass = htmlElement.classList.contains('dark');
        setIsDarkMode(hasDarkClass);
    };

    const generateStars = () => {
        const numberOfStars = Math.floor(window.innerWidth * window.innerHeight) / 10000;
        const newStars = [];

        for (let i = 0; i < numberOfStars; i++) {
            newStars.push({
                id: i,
                size: Math.random() * 3 + 1,
                x: Math.random() * 100,
                y: Math.random() * 100,
                opacity: Math.random() * 0.5 + 0.5,
                animationDuration: Math.random() * 4 + 2,
            });
        }

        setStars(newStars);
    };

    const generateMeteors = () => {
        const numberOfMeteors = 5;
        const newMeteors = [];

        for (let i = 0; i < numberOfMeteors; i++) {
            newMeteors.push({
                id: i,
                x: -10 + Math.random() * 100,
                y: Math.random() * 100,
                delay: Math.random() * 0,
                animationDuration: Math.random() * 3 + 3,
                scale: Math.random() * 1 + 0.7,
            });
        }

        setMeteors(newMeteors);
    };

    const generateMatrixRain = () => {
        const numberOfColumns = Math.floor(window.innerWidth / 25); // Column every 25px
        const newMatrixRain = [];
        const characters = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

        for (let i = 0; i < numberOfColumns; i++) {
            const columnHeight = Math.random() * 8 + 5; // 5-13 characters per column
            
            for (let j = 0; j < columnHeight; j++) {
                newMatrixRain.push({
                    id: `${i}-${j}`,
                    x: (i * 25 / window.innerWidth) * 100, // Convert to percentage
                    startY: -100 - (j * 25), // Start above screen
                    char: characters[Math.floor(Math.random() * characters.length)],
                    delay: Math.random() * 5, // 0-5 second delay
                    animationDuration: Math.random() * 8 + 6, // 6-14 seconds
                    opacity: j === 0 ? 1 : Math.max(0.1, 1 - (j * 0.15)), // Fade as we go up the trail
                });
            }
        }

        setMatrixRain(newMatrixRain);
    };

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Stars */}
            {stars.map((star) => (
                <div 
                    key={star.id} 
                    className="star animate-pulse-subtle" 
                    style={{
                        width: star.size + "px",
                        height: star.size + "px",
                        left: star.x + "%",
                        top: star.y + "%",
                        opacity: star.opacity,
                        animationDuration: star.animationDuration + "s",
                    }}
                />
            ))}

            {/* Meteors - only in dark mode */}
            {isDarkMode && meteors.map((meteor) => (
                <div 
                    key={meteor.id} 
                    className="meteor animate-meteor" 
                    style={{
                        left: meteor.x + "%",
                        top: meteor.y + "%",
                        animationDelay: meteor.delay + "s",
                        animationDuration: meteor.animationDuration + "s",
                        transform: `scale(${meteor.scale})`,
                    }}
                />
            ))}

            {/* Matrix Rain - only in light mode */}
            {!isDarkMode && matrixRain.map((drop) => (
                <div 
                    key={drop.id} 
                    className="matrix-char animate-matrix-fall text-green-800 font-mono text-lg font-bold select-none"
                    style={{
                        left: drop.x + "%",
                        top: drop.startY + "px",
                        opacity: drop.opacity,
                        animationDelay: drop.delay + "s",
                        animationDuration: drop.animationDuration + "s",
                    }}
                >
                    {drop.char}
                </div>
            ))}
        </div>
    );
};