import { ThemeToggle } from "../components/ThemeToggle";
import { Starbackground } from "@/components/Starbackground";
import { NavBar } from "@/components/NavBar";
import { ASL_speech } from "@/components/ASL_speech";

export const ASLSpeechPage = () => {
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
        <ASL_speech />
      </main>
    </div>
  );
};