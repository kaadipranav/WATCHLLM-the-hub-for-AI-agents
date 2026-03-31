import NavBar from "@/app/(landing)/components/NavBar";
import HeroSection from "@/app/(landing)/components/HeroSection";
import FrameworkStrip from "@/app/(landing)/components/FrameworkStrip";
import ProblemSection from "@/app/(landing)/components/ProblemSection";
import FeaturesSection from "@/app/(landing)/components/FeaturesSection";
import SDKSection from "@/app/(landing)/components/SDKSection";
import PricingSection from "@/app/(landing)/components/PricingSection";
import FinalCTA from "@/app/(landing)/components/FinalCTA";
import Footer from "@/app/(landing)/components/Footer";
import CustomCursor from "@/app/(landing)/components/CustomCursor";

export default function HomePage() {
  return (
    <div style={{ background: "var(--bg-void)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <CustomCursor />
      <NavBar />
      <main>
        <HeroSection />
        <FrameworkStrip />
        <ProblemSection />
        <FeaturesSection />
        <SDKSection />
        <PricingSection />
        <FinalCTA />
        <Footer />
      </main>
    </div>
  );
}
