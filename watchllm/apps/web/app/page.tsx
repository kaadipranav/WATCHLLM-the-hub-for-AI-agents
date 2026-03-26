import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import SocialProof from "@/components/landing/SocialProof";
import Problem from "@/components/landing/Problem";
import Features from "@/components/landing/Features";
import SDKSection from "@/components/landing/SDKSection";
import Metrics from "@/components/landing/Metrics";
import Pricing from "@/components/landing/Pricing";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#060608", color: "#EDEDED" }}>
      <Nav />
      <main className="flex-1">
        <Hero />
        <SocialProof />
        <Problem />
        <Features />
        <SDKSection />
        <Metrics />
        <Pricing />
        <FinalCTA />
        <Footer />
      </main>
    </div>
  );
}
