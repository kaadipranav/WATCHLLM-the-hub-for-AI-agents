import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="font-bold font-mono tracking-wider text-accent text-xl">WatchLLM</Link>
          <p className="text-sm text-gray-500 mt-4 max-w-sm">
            Continuous evaluation, stress testing, and debugging for AI agents. Stop guessing, start measuring.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-medium mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/#features" className="hover:text-white transition">Features</Link></li>
            <li><Link href="/#pricing" className="hover:text-white transition">Pricing</Link></li>
            <li><Link href="/docs" className="hover:text-white transition">Documentation</Link></li>
            <li><Link href="/changelog" className="hover:text-white transition">Changelog</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-medium mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/about" className="hover:text-white transition">About</Link></li>
            <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
            <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-sm text-gray-600 flex justify-between items-center">
        <span>© {new Date().getFullYear()} WatchLLM Inc. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition">Twitter</a>
          <a href="#" className="hover:text-white transition">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
