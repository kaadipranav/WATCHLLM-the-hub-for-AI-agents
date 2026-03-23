import Link from 'next/link';

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-white/5 h-14 flex items-center justify-between px-6 lg:px-12 bg-[#080808]/80">
      <div className="flex items-center gap-8">
        <Link href="/" className="font-bold font-mono tracking-wider text-accent">WatchLLM</Link>
        <nav className="hidden md:flex gap-6 text-sm text-gray-400">
          <Link href="/#features" className="hover:text-white transition">Product</Link>
          <Link href="/docs" className="hover:text-white transition">Docs</Link>
          <Link href="/#pricing" className="hover:text-white transition">Pricing</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/sign-in" className="text-gray-400 hover:text-white transition">Sign in</Link>
        <Link href="/sign-up" className="bg-accent text-black px-4 py-1.5 rounded-full font-medium hover:bg-accent/90 transition shadow-[0_0_15px_rgba(0,200,150,0.3)]">Get started</Link>
      </div>
    </header>
  );
}
