import { useState, useEffect } from "react";
import { User, PricingPlan, ServiceItem, PlanId } from "./types";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { CapabilitiesSection } from "./components/CapabilitiesSection";
import { ServicesMarketplace } from "./components/ServicesMarketplace";
import { PricingSection, PRICING_PLANS } from "./components/PricingSection";
import { CeoSection } from "./components/CeoSection";
import { Footer } from "./components/Footer";
import { ChatDashboard } from "./components/ChatDashboard";
import { AuthModals } from "./components/AuthModals";
import { CheckoutModal } from "./components/CheckoutModal";
import { UserDashboardModal } from "./components/UserDashboardModal";
import { AdminPanelModal } from "./components/AdminPanelModal";
import { LoadingScreen, LoadingCompletePayload } from "./components/LoadingScreen";
import { CheckCircle2, X } from "lucide-react";

export default function App() {
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<"home" | "chat">("home");
  const [userPlan, setUserPlan] = useState<PlanId>("free");
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Auth Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // User Dashboard / Workspace Modal
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);

  // Admin Command Center Modal
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Checkout Modal
  const [checkoutModalPlan, setCheckoutModalPlan] = useState<PricingPlan | null>(null);
  const [checkoutPeriod, setCheckoutPeriod] = useState<"monthly" | "yearly">("monthly");

  // Toast notification
  const [toast, setToast] = useState<{ msg: string; type: "success" | "info" } | null>(null);

  // Initialize from API / localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("premiers_user");
      if (savedUser) setUser(JSON.parse(savedUser));

      const savedPlan = localStorage.getItem("premiers_plan");
      if (savedPlan && ["free", "standard", "premium", "starter"].includes(savedPlan)) {
        setUserPlan(savedPlan as PlanId);
      }

      const savedTheme = localStorage.getItem("premiers_theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }

      // Check real session from server
      const token = localStorage.getItem("premiers_auth_token");
      if (token) {
        fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.user) {
              setUser(data.user);
              localStorage.setItem("premiers_user", JSON.stringify(data.user));
              if (data.subscription?.planId) {
                setUserPlan(data.subscription.planId);
                localStorage.setItem("premiers_plan", data.subscription.planId);
              }
            }
          })
          .catch(() => {
            // Keep local fallback state if server offline
          });
      }
    } catch (e) {
      console.error("Failed to read initial local state", e);
    }
  }, []);

  const showToast = (msg: string, type: "success" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleToggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("premiers_theme", next);
  };

  const handleLogout = () => {
    localStorage.removeItem("premiers_auth_token");
    localStorage.removeItem("premiers_user");
    setUser(null);
    setCurrentView("home");
    setWorkspaceModalOpen(false);
    setAdminModalOpen(false);
    showToast("You have been logged out.", "info");
  };

  const handleAuthSuccess = (loggedUser: User) => {
    setUser(loggedUser);
    setAuthModalOpen(false);
    setCurrentView("chat");
    showToast(`Welcome, ${loggedUser.name}!`);
  };

  const handleOpenLogin = () => {
    setAuthMode("login");
    setAuthModalOpen(true);
  };

  const handleOpenSignup = () => {
    setAuthMode("signup");
    setAuthModalOpen(true);
  };

  const handleGetStarted = () => {
    if (user) {
      setCurrentView("chat");
    } else {
      // Create guest session automatically if user just wants to explore immediately
      const guestUser: User = { id: "usr_guest", name: "Explorer", email: "guest@premiers.ai", role: "user" };
      setUser(guestUser);
      localStorage.setItem("premiers_user", JSON.stringify(guestUser));
      setCurrentView("chat");
      showToast("Entered workspace as Guest Explorer");
    }
  };

  const handleSelectPrompt = (_promptText: string) => {
    if (!user) {
      const guestUser: User = { id: "usr_guest", name: "Explorer", email: "guest@premiers.ai", role: "user" };
      setUser(guestUser);
      localStorage.setItem("premiers_user", JSON.stringify(guestUser));
    }
    setCurrentView("chat");
    showToast("Prompt ready in chat!");
  };

  const handleSelectAction = (_actionType: string, promptText?: string) => {
    if (promptText) handleSelectPrompt(promptText);
    else handleGetStarted();
  };

  const handleSelectService = (service: ServiceItem) => {
    if (!user) {
      const guestUser: User = { id: "usr_guest", name: "Explorer", email: "guest@premiers.ai", role: "user" };
      setUser(guestUser);
      localStorage.setItem("premiers_user", JSON.stringify(guestUser));
    }
    setCurrentView("chat");
    showToast(`Launched ${service.title}`);
  };

  const handleSelectPlan = (plan: PricingPlan, billingPeriod: "monthly" | "yearly") => {
    if (plan.id === "free") {
      setUserPlan("free");
      localStorage.setItem("premiers_plan", "free");
      showToast("Free plan is active.");
      return;
    }
    setCheckoutModalPlan(plan);
    setCheckoutPeriod(billingPeriod);
  };

  const handleLoadingComplete = (payload: LoadingCompletePayload) => {
    if (payload.user) {
      setUser(payload.user);
    }
    if (payload.planId) {
      setUserPlan(payload.planId);
    }
    setIsAppLoading(false);
  };

  const handleCheckoutSuccess = (planId: PlanId) => {
    setUserPlan(planId);
    localStorage.setItem("premiers_plan", planId);
    setCheckoutModalPlan(null);
    showToast(`Successfully upgraded to ${planId.toUpperCase()} Plan!`);
  };

  // If chat view is active, render full-screen ChatDashboard
  if (currentView === "chat" && user) {
    return (
      <div className={theme === "light" ? "theme-light" : ""}>
        {/* Full-Screen Premium Cinematic Loading Page */}
        {isAppLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

        <ChatDashboard
          user={user}
          onLogout={handleLogout}
          onBackToHome={() => setCurrentView("home")}
          userPlan={userPlan}
          onUpgradeClick={() => {
            const standardPlan = PRICING_PLANS.find((p) => p.id === "standard") || PRICING_PLANS[1];
            setCheckoutModalPlan(standardPlan);
            setCheckoutPeriod("monthly");
          }}
          onOpenWorkspace={() => setWorkspaceModalOpen(true)}
          onOpenAdmin={() => setAdminModalOpen(true)}
        />

        {/* User Workspace Modal */}
        {workspaceModalOpen && (
          <UserDashboardModal
            user={user}
            onClose={() => setWorkspaceModalOpen(false)}
            onUpgradePlan={() => {
              const standardPlan = PRICING_PLANS.find((p) => p.id === "standard") || PRICING_PLANS[1];
              setCheckoutModalPlan(standardPlan);
              setCheckoutPeriod("monthly");
            }}
            onUserUpdated={(u) => setUser(u)}
          />
        )}

        {/* Admin Command Center Modal */}
        {adminModalOpen && (
          <AdminPanelModal
            currentUser={user}
            onClose={() => setAdminModalOpen(false)}
          />
        )}

        {checkoutModalPlan && (
          <CheckoutModal
            plan={checkoutModalPlan}
            initialPeriod={checkoutPeriod}
            user={user}
            onClose={() => setCheckoutModalPlan(null)}
            onSuccess={handleCheckoutSuccess}
          />
        )}

        {/* Global Toast */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141422] border border-[#00d4a0]/50 text-white shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-[#00d4a0]" />
            <span>{toast.msg}</span>
            <button onClick={() => setToast(null)} className="text-gray-400 hover:text-white ml-2">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Home Landing Page View
  return (
    <div className={`min-h-screen bg-[#0a0a0f] text-[#f0f0f5] selection:bg-[#00d4a0]/30 selection:text-white ${theme === "light" ? "theme-light" : ""}`}>
      {/* Full-Screen Premium Cinematic Loading Page */}
      {isAppLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141422] border border-[#00d4a0]/50 text-white shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#00d4a0]" />
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        user={user}
        onOpenLogin={handleOpenLogin}
        onOpenSignup={handleOpenSignup}
        onOpenDashboard={() => setCurrentView("chat")}
        onOpenWorkspace={() => setWorkspaceModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onLogout={handleLogout}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main>
        <HeroSection
          onGetStarted={handleGetStarted}
          onExploreCapabilities={() => {
            document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
          }}
          onSelectPrompt={handleSelectPrompt}
        />

        <AboutSection />

        <CapabilitiesSection onSelectAction={handleSelectAction} />

        <ServicesMarketplace onSelectService={handleSelectService} />

        <PricingSection
          currentPlan={userPlan}
          onSelectPlan={handleSelectPlan}
        />

        <CeoSection />
      </main>

      <Footer />

      {/* Auth Modals */}
      <AuthModals
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* User Workspace Modal */}
      {workspaceModalOpen && user && (
        <UserDashboardModal
          user={user}
          onClose={() => setWorkspaceModalOpen(false)}
          onUpgradePlan={() => {
            const standardPlan = PRICING_PLANS.find((p) => p.id === "standard") || PRICING_PLANS[1];
            setCheckoutModalPlan(standardPlan);
            setCheckoutPeriod("monthly");
          }}
          onUserUpdated={(u) => setUser(u)}
        />
      )}

      {/* Admin Command Center Modal */}
      {adminModalOpen && user && (
        <AdminPanelModal
          currentUser={user}
          onClose={() => setAdminModalOpen(false)}
        />
      )}

      {/* Checkout Modal */}
      {checkoutModalPlan && (
        <CheckoutModal
          plan={checkoutModalPlan}
          initialPeriod={checkoutPeriod}
          user={user}
          onClose={() => setCheckoutModalPlan(null)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
}
