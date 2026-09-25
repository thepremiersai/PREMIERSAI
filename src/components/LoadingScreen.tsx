import { useState, useEffect, useRef } from "react";
import { User, PlanId } from "../types";

export interface LoadingCompletePayload {
  user: User | null;
  planId: PlanId;
  isOffline?: boolean;
}

interface LoadingScreenProps {
  onComplete: (payload: LoadingCompletePayload) => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const completedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    // Detect user reduced motion preference
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const payload: LoadingCompletePayload = {
      user: null,
      planId: "free",
      isOffline: false,
    };

    const initializeApp = async () => {
      // 1. Fast parallel state loading (User, Plan, Theme, and Backend Health)
      try {
        // Read local storage fast
        const savedUserStr = localStorage.getItem("premiers_user");
        if (savedUserStr) {
          try {
            payload.user = JSON.parse(savedUserStr);
          } catch {
            // Ignore corrupted cached user
          }
        }

        const savedPlan = localStorage.getItem("premiers_plan");
        if (savedPlan && ["free", "standard", "premium", "starter"].includes(savedPlan)) {
          payload.planId = savedPlan as PlanId;
        }

        const savedTheme = localStorage.getItem("premiers_theme");
        if (savedTheme === "light") {
          document.documentElement.classList.add("theme-light");
        } else {
          document.documentElement.classList.remove("theme-light");
        }
      } catch {
        // Safe fallback
      }

      // Check server session & health in parallel with tight abort timeouts for instant feel
      const token = localStorage.getItem("premiers_auth_token");

      const healthPromise = (async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1200);
          const res = await fetch("/api/health", { signal: controller.signal }).catch(() => null);
          clearTimeout(timeoutId);
          if (!res || !res.ok) {
            payload.isOffline = true;
          }
        } catch {
          payload.isOffline = true;
        }
      })();

      const authPromise = (async () => {
        if (!token) return;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1400);
          const res = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }).catch(() => null);
          clearTimeout(timeoutId);

          if (res && res.ok) {
            const data = await res.json().catch(() => null);
            if (data?.user) {
              payload.user = data.user;
              localStorage.setItem("premiers_user", JSON.stringify(data.user));
              if (data.subscription?.planId) {
                payload.planId = data.subscription.planId;
                localStorage.setItem("premiers_plan", data.subscription.planId);
              }
            }
          }
        } catch {
          // Local fallback remains active
        }
      })();

      const fontsPromise = (async () => {
        if (typeof document !== "undefined" && document.fonts?.ready) {
          await document.fonts.ready.catch(() => {});
        }
      })();

      // Wait for all critical setup tasks to resolve
      await Promise.allSettled([healthPromise, authPromise, fontsPromise]);

      if (!isMounted || completedRef.current) return;

      // Natural, graceful settle (no artificial delay; smooth fade out)
      const minDisplayTime = prefersReducedMotion ? 50 : 260;
      await new Promise((resolve) => setTimeout(resolve, minDisplayTime));

      if (!isMounted || completedRef.current) return;

      setIsFadingOut(true);

      const fadeDuration = prefersReducedMotion ? 60 : 320;
      setTimeout(() => {
        if (!completedRef.current) {
          completedRef.current = true;
          sessionStorage.setItem("premiers_session_loaded", "true");
          onComplete(payload);
        }
      }, fadeDuration);
    };

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, [onComplete]);

  return (
    <aside
      id="premiers-loading-screen"
      aria-label="PREMIERS AI is loading"
      aria-busy="true"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0f] select-none transition-opacity duration-300 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Centered Brand Block */}
      <div className="flex flex-col items-center justify-center px-6 text-center anim-premiers-fade">
        {/* Brand Icon Mark */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 mb-5 rounded-2xl bg-gradient-to-br from-[#00d4a0] to-[#00b8d4] flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shadow-[0_0_35px_rgba(0,212,160,0.25)] select-none">
          P
        </div>

        {/* Brand Name */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2.5">
          PREMIERS <span className="text-[#00d4a0]">AI</span>
        </h1>

        {/* Original-Style Tagline */}
        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.32em] text-slate-400 uppercase anim-premiers-tagline-fade select-none">
          WE ARE HERE
        </p>

        {/* Minimal Animated Loading Indicator (•••) */}
        <div
          aria-hidden="true"
          className="flex items-center justify-center gap-2 mt-8 select-none"
        >
          <span className="w-2 h-2 rounded-full bg-[#00d4a0] anim-premiers-dot-1" />
          <span className="w-2 h-2 rounded-full bg-[#00d4a0] anim-premiers-dot-2" />
          <span className="w-2 h-2 rounded-full bg-[#00d4a0] anim-premiers-dot-3" />
        </div>
      </div>

      {/* Screen Reader Announcement */}
      <span className="sr-only">PREMIERS AI is loading. WE ARE HERE.</span>
    </aside>
  );
}
