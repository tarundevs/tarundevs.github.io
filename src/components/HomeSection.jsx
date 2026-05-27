import { ArrowDown } from "lucide-react"
import { useEffect, useState } from "react"

export const HomeSection = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    return (
        <section id="home" className="relative min-h-screen flex flex-col items-center justify-center px-4">
            <div className="container max-w-4xl mx-auto text-center z-10">
                <div className="space-y-6">


                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                        <span className="opacity-0 animate-fade-in text-foreground">Hi, I'm </span>
                        <span className={`opacity-0 animate-fade-in-delay-1 font-bold ${
                            isDarkMode
                                ? 'text-primary'
                                : 'bg-gradient-to-r from-black to-red-600 bg-clip-text text-transparent'
                        }`}>
                            Tarun Warrier
                        </span>
                    </h1>



                    <p className="text-base md:text-lg max-w-2xl mx-auto opacity-0 animate-fade-in-delay-3 text-muted-foreground">
                        Building AI systems that solve real issues from 3D volumetric imaging to edge inference
                    </p>

                    <div className="pt-4 opacity-0 animate-fade-in-delay-4 flex flex-wrap justify-center gap-3">
                        <a
                            href="#portfolio"
                            className={`px-6 py-2 rounded-full border transition-all duration-300 transform
                                ${isDarkMode
                                    ? 'border-blue-500 text-blue-500 hover:scale-110 hover:shadow-lg hover:-translate-y-1 hover:bg-blue-500 hover:text-white'
                                    : 'bg-gradient-to-r from-black to-red-600 text-white hover:scale-110 hover:shadow-lg hover:-translate-y-1 hover:from-red-600 hover:to-black'
                                }`}
                        >
                            See my projects
                        </a>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
                <span className="text-sm mb-2 text-muted-foreground">Scroll down</span>
                <ArrowDown className={`h-5 w-5 ${isDarkMode ? 'text-primary' : 'text-black/60'}`} />
            </div>
        </section>
    )
}