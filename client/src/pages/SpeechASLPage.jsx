import { ThemeToggle } from "../components/ThemeToggle";
import { Starbackground } from "@/components/Starbackground";
import { NavBar } from "@/components/NavBar";
import { Speech_ASL } from "@/components/speechASL";

export const SpeechASLPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Theme Toggle */}
      <ThemeToggle />
      {/* Background effects */}
      <Starbackground />
      {/* NavBar */}
      <NavBar />
      {/* Main Content */}
      <main>
        <Speech_ASL />
      </main>
    </div>
  );
};