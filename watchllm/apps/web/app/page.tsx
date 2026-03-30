import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Footer from "@/components/landing/Footer";


export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#060608", color: "#EDEDED" }}>
      <Nav />
      <main className="flex-1">
        <Hero />
        <Footer />
      </main>
    </div>
  );
}

