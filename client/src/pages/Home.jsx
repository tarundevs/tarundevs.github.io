import { ThemeToggle } from "../components/ThemeToggle";
import {Starbackground} from "@/components/Starbackground";
import {NavBar} from "@/components/NavBar";
import {HomeSection} from "@/components/HomeSection";
import {AboutUs} from "@/components/AboutUs";
import { ASL_speech } from "@/components/ASL_speech";
import { Help } from "@/components/Help";
import {Footer} from "@/components/Footer"
export const Home = () => {
  return <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

    {/* Theme Toggle */}
    <ThemeToggle />
    {/* Background effects */}
    <Starbackground />
    {/* NavBar */}
    <NavBar />
    {/* Main Content */}
    <main>
        <HomeSection />
        <AboutUs />
        <Help />
    </main>
    {/* Footer */}
    <Footer />
  </div>
};