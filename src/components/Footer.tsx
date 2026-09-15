import { Globe, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#1e1e2e] bg-[#0c0c14] py-12 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00d4a0] to-[#00b8d4] flex items-center justify-center text-white font-extrabold text-base">
                P
              </div>
              <span className="text-xl font-bold tracking-tight text-white">PREMIERS AI</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md">
              The universal intelligence platform uniting multilingual conversations, vision inspections, creative generative studios, and full-stack development.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Globe className="w-4 h-4 text-[#00d4a0]" />
              <span>Fluent in 100+ World Languages including Urdu, Arabic, and Roman Urdu</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" className="hover:text-[#00d4a0] transition-colors">
                  About Platform
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#00d4a0] transition-colors">
                  AI Capabilities
                </a>
              </li>
              <li>
                <a href="#marketplace" className="hover:text-[#00d4a0] transition-colors">
                  Services Marketplace
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#00d4a0] transition-colors">
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="#ceo" className="hover:text-[#00d4a0] transition-colors">
                  Founder & CEO
                </a>
              </li>
            </ul>
          </div>

          {/* Multilingual Scripts */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Supported Scripts
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-1 rounded bg-[#161622] border border-[#242436] text-gray-300">
                اردو (Urdu)
              </span>
              <span className="px-2 py-1 rounded bg-[#161622] border border-[#242436] text-gray-300">
                Roman Urdu
              </span>
              <span className="px-2 py-1 rounded bg-[#161622] border border-[#242436] text-gray-300">
                العربية (Arabic)
              </span>
              <span className="px-2 py-1 rounded bg-[#161622] border border-[#242436] text-gray-300">
                English
              </span>
              <span className="px-2 py-1 rounded bg-[#161622] border border-[#242436] text-gray-300">
                Français
              </span>
              <span className="px-2 py-1 rounded bg-[#161622] border border-[#242436] text-gray-300">
                Español
              </span>
              <span className="px-2 py-1 rounded bg-[#161622] border border-[#242436] text-gray-300">
                हिंदी (Hindi)
              </span>
              <span className="px-2 py-1 rounded bg-[#161622] border border-[#242436] text-gray-300">
                中文 (Chinese)
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-[#1e1e2e] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            © {currentYear} PREMIERS AI. Created and Founded by{" "}
            <strong className="text-gray-300 font-semibold">Syed Muhammad Yasir Abbas Zaidi</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
            <span>for the global multilingual web</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
