import { useState } from "react";
import { User } from "../types";
import { SUPPORTED_LANGUAGES } from "../lib/languages";
import { Globe, Menu, X, Sun, Moon, LogIn, UserPlus, LayoutDashboard, LogOut, ShieldAlert, ShoppingBag, Sparkles } from "lucide-react";

interface NavbarProps {
  user: User | null;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onOpenDashboard: () => void;
  onOpenWorkspace?: () => void;
  onOpenAdmin?: () => void;
  onLogout: () => void;
  selectedLanguage: string;
  onSelectLanguage: (code: string) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function Navbar({
  user,
  onOpenLogin,
  onOpenSignup,
  onOpenDashboard,
  onOpenWorkspace,
  onOpenAdmin,
  onLogout,
  selectedLanguage,
  onSelectLanguage,
  theme,
  onToggleTheme,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0a0a0f]/85 border-b border-[#242436] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4a0] to-[#00b8d4] flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-[#00d4a0]/30">
            P
          </div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            PREMIERS
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#00d4a0]/15 text-[#00d4a0] border border-[#00d4a0]/30 font-semibold tracking-normal hidden sm:inline-block">
              AI Global
            </span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-300">
          <button
            onClick={() => handleNavClick("about")}
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            About
          </button>
          <button
            onClick={() => handleNavClick("features")}
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            AI Capabilities
          </button>
          <button
            onClick={() => handleNavClick("marketplace")}
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            Marketplace
          </button>
          <button
            onClick={() => handleNavClick("pricing")}
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            Pricing
          </button>
          <button
            onClick={() => handleNavClick("ceo")}
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            Founder
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#2b2b3f] bg-[#14141f] text-xs sm:text-sm font-medium text-gray-300 hover:text-white hover:border-[#00d4a0]/40 transition-all min-h-[38px]"
              title="Select Global AI Language"
              aria-label="Language selector"
            >
              <Globe className="w-3.5 h-3.5 text-[#00d4a0]" />
              <span className="max-w-[70px] sm:max-w-[100px] truncate">{activeLang.name.split(" ")[0]}</span>
            </button>

            {langMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-60 max-h-72 overflow-y-auto rounded-xl border border-[#2e2e44] bg-[#12121c] p-1.5 shadow-2xl z-50 card-scroll"
                onMouseLeave={() => setLangMenuOpen(false)}
              >
                <div className="px-2.5 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-[#242436] mb-1">
                  Global Multilingual Support
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left ${
                      selectedLanguage === lang.code
                        ? "bg-[#00d4a0]/15 text-[#00d4a0] font-semibold"
                        : "text-gray-300 hover:bg-[#1a1a28] hover:text-white"
                    }`}
                  >
                    <span>{lang.name}</span>
                    <span className="text-gray-400 text-[11px]" dir={lang.isRTL ? "rtl" : "ltr"}>
                      {lang.nativeName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-lg border border-[#2b2b3f] bg-[#14141f] flex items-center justify-center text-gray-300 hover:text-white hover:border-[#00d4a0]/40 transition-all cursor-pointer"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-label="Theme toggle"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-300" />}
          </button>

          {/* Auth / Dashboard Controls */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {user.role === "admin" && onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#6366f1]/50 bg-[#6366f1]/20 text-[#a5b4fc] hover:bg-[#6366f1]/30 font-semibold text-xs transition-all min-h-[38px] cursor-pointer"
                  title="Admin Command Center"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#818cf8]" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}
              {onOpenWorkspace && (
                <button
                  onClick={onOpenWorkspace}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#2b2b3f] bg-[#14141f] hover:border-[#00d4a0]/40 text-gray-200 text-xs sm:text-sm font-medium transition-all min-h-[38px] cursor-pointer"
                  title="My Orders, Invoices & Profile"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#00d4a0]" />
                  <span className="hidden sm:inline">Workspace</span>
                </button>
              )}
              <button
                onClick={onOpenDashboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00d4a0] hover:bg-[#00e8b0] text-black font-semibold text-xs sm:text-sm shadow-sm transition-all min-h-[38px] cursor-pointer btn-shimmer-neon btn-glow-pulse"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>AI Chat</span>
              </button>
              <button
                onClick={onLogout}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs transition-colors min-h-[38px]"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLogin}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2b2b3f] bg-[#14141f] hover:border-gray-400 text-gray-200 text-xs sm:text-sm font-medium transition-all min-h-[38px] cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
              <button
                onClick={onOpenSignup}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00d4a0] hover:bg-[#00e8b0] text-black font-semibold text-xs sm:text-sm transition-all shadow-sm min-h-[38px] cursor-pointer btn-shimmer-neon btn-glow-pulse"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-lg border border-[#2b2b3f] bg-[#14141f] flex items-center justify-center text-gray-200 hover:text-white transition-all cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#242436] bg-[#0e0e16] px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2 text-sm font-medium text-gray-300">
            <button
              onClick={() => handleNavClick("about")}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-[#1a1a28] hover:text-white transition-colors"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick("features")}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-[#1a1a28] hover:text-white transition-colors"
            >
              AI Capabilities
            </button>
            <button
              onClick={() => handleNavClick("marketplace")}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-[#1a1a28] hover:text-white transition-colors"
            >
              Services Marketplace
            </button>
            <button
              onClick={() => handleNavClick("pricing")}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-[#1a1a28] hover:text-white transition-colors"
            >
              Pricing Plans
            </button>
            <button
              onClick={() => handleNavClick("ceo")}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-[#1a1a28] hover:text-white transition-colors"
            >
              Founder & CEO
            </button>
          </div>

          <div className="pt-3 border-t border-[#242436] flex flex-col gap-2">
            {!user ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full py-2.5 rounded-lg border border-[#2b2b3f] bg-[#14141f] text-center text-sm font-medium text-gray-200"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSignup();
                  }}
                  className="w-full py-2.5 rounded-lg bg-[#00d4a0] text-center text-sm font-semibold text-black"
                >
                  Create Free Account
                </button>
              </>
            ) : (
              <>
                {user.role === "admin" && onOpenAdmin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full py-2.5 rounded-lg border border-[#6366f1]/50 bg-[#6366f1]/20 text-[#a5b4fc] text-center text-sm font-semibold"
                  >
                    Admin Command Center
                  </button>
                )}
                {onOpenWorkspace && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenWorkspace();
                    }}
                    className="w-full py-2.5 rounded-lg border border-[#2b2b3f] bg-[#14141f] text-center text-sm font-medium text-gray-200"
                  >
                    Client Workspace & Orders
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDashboard();
                  }}
                  className="w-full py-2.5 rounded-lg bg-[#00d4a0] text-center text-sm font-semibold text-black"
                >
                  Open AI Chat
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2 rounded-lg border border-red-500/30 text-center text-xs text-red-400"
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
