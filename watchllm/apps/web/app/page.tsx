import NavBar from "./(landing)/components/NavBar";
import HeroSection from "./(landing)/components/HeroSection";
import ProblemSection from "./(landing)/components/ProblemSection";
import FeaturesSection from "./(landing)/components/FeaturesSection";
import SDKSection from "./(landing)/components/SDKSection";
import MetricsRow from "./(landing)/components/MetricsRow";
import PricingSection from "./(landing)/components/PricingSection";
import Footer from "./(landing)/components/Footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent text-foreground">
      <NavBar />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <SDKSection />
        <MetricsRow />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
