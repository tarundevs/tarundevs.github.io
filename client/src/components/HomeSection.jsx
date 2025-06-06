import { ArrowDown } from "lucide-react"
import { useEffect, useState } from "react"

export const HomeSection = () => {
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
        <section id="home" className="relative min-h-screen flex flex-col items-center justify-center px-4">
            <div className="container max-w-4xl mx-auto text-center z-10">
                <div className="space-y-6">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                        <span className="opacity-0 animate-fade-in text-foreground">Welcome to </span>
                        <span className={`opacity-0 animate-fade-in-delay-1 font-bold ${
                            isDarkMode 
                                ? 'text-primary' 
                                : 'bg-gradient-to-r from-black to-red-600 bg-clip-text text-transparent'
                        }`}>
                            Ethereal Stream
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-0 animate-fade-in-delay-3">
                        Where gestures become words, and silence finds its voice
                    </p>

                    <div className="pt-4 opacity-0 animate-fade-in-delay-4">
                    <a
                        href="#about"
                        className={`px-6 py-2 rounded-full border transition-all duration-300 transform 
                            ${
                            isDarkMode
                                ? 'border-blue-500 text-blue-500 hover:scale-110 hover:shadow-lg hover:-translate-y-1 hover:bg-blue-500 hover:text-white'
                                : 'bg-gradient-to-r from-black to-red-600 text-white hover:scale-110 hover:shadow-lg hover:-translate-y-1 hover:from-red-600 hover:to-black'
                            }`}
                        >
                            check it out
                        </a>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
                <span className="text-sm mb-2"> See More </span>
                <ArrowDown className={`h-5 w-5 ${
                    isDarkMode
                        ? 'text-primary'
                        : 'text-black-600'
                }`} />
            </div>
        </section>
    )
}