import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    }, []);

    const toggle = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        document.documentElement.classList.toggle("dark", newTheme);
        localStorage.setItem("theme", newTheme ? "dark" : "light");
    };

    return (
        <div
            onClick={toggle}
            className={cn(
                "fixed max-sm:hidden top-4 right-6 z-50 p-2 rounded-full cursor-pointer transition-colors duration-300",
                "bg-gray-800/20 backdrop-blur-sm"
            )}
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </div>
    );
};