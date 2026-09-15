import { useState, useEffect, useRef, useCallback } from "react";
import { User, PlanId } from "../types";
import { AlertCircle, RefreshCw, WifiOff, Sparkles, Check } from "lucide-react";

export interface LoadingCompletePayload {
  user: User | null;
  planId: PlanId;
  isOffline?: boolean;
}

interface LoadingScreenProps {
  onComplete: (payload: LoadingCompletePayload) => void;
}

interface InitStage {
  pct: number;
  status: string;
  action?: () => Promise<void>;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [displayPercent, setDisplayPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("INITIALIZING CORE INTELLIGENCE");
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Canvas ref for background particle starfield
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stored initialization payload to hand off to App.tsx
  const payloadRef = useRef<LoadingCompletePayload>({
    user: null,
    planId: "free",
    isOffline: false,
  });

  // Track target percentage for smooth, continuous micro-interpolation
  const targetPercentRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const particleAnimRef = useRef<number | null>(null);

  // Check if user prefers reduced motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Check if returning user in same browser tab session
  const isReturningUser =
    typeof window !== "undefined" &&
    sessionStorage.getItem("premiers_session_loaded") === "true";

  // Smooth numeric ticker loop: smoothly eases displayPercent towards targetPercentRef
  useEffect(() => {
    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      setDisplayPercent((prev) => {
        const target = targetPercentRef.current;
        if (prev >= target) return prev;

        // Smooth speed adjustment based on distance to target
        const speed = Math.max(0.4, (target - prev) * 0.12 * (delta / 16.6));
        const next = prev + speed;
        return next >= target ? target : next;
      });

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Background subtle canvas particle field with neural connection lines
  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle count scaled for performance
    const count = width < 768 ? 24 : 45;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 1.5 + 0.6,
      alpha: Math.random() * 0.45 + 0.15,
    }));

    let active = true;

    const render = () => {
      if (!active) return;
      ctx.clearRect(0, 0, width, height);

      // Draw faint connections between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 212, 160, ${lineAlpha})`;
            ctx.lineWidth = 0.65;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 160, ${p.alpha})`;
        ctx.fill();
      }

      particleAnimRef.current = requestAnimationFrame(render);
    };

    particleAnimRef.current = requestAnimationFrame(render);

    return () => {
      active = false;
      window.removeEventListener("resize", handleResize);
      if (particleAnimRef.current) cancelAnimationFrame(particleAnimRef.current);
    };
  }, [prefersReducedMotion]);

  // Main real application initialization sequence
  const startInitialization = useCallback(async () => {
    setHasError(false);
    setErrorMessage("");
    targetPercentRef.current = 0;
    setDisplayPercent(0);
    setIsReady(false);
    setIsFadingOut(false);

    // Timing profile: returning users get an accelerated, smooth startup
    const stepDelay = prefersReducedMotion ? 40 : isReturningUser ? 85 : 240;

    const stages: InitStage[] = [
      {
        pct: 14,
        status: "INITIALIZING PREMIERS AI",
        action: async () => {
          // Read cached local user/plan
          try {
            const savedUserStr = localStorage.getItem("premiers_user");
            if (savedUserStr) {
              payloadRef.current.user = JSON.parse(savedUserStr);
            }
            const savedPlan = localStorage.getItem("premiers_plan");
            if (savedPlan && ["free", "standard", "premium", "starter"].includes(savedPlan)) {
              payloadRef.current.planId = savedPlan as PlanId;
            }
          } catch {
            // Safe fallback
          }
        },
      },
      {
        pct: 32,
        status: "PREPARING YOUR WORKSPACE",
        action: async () => {
          // Verify theme & language setup
          try {
            const savedTheme = localStorage.getItem("premiers_theme") || "dark";
            if (savedTheme === "light") {
              document.documentElement.classList.add("theme-light");
            } else {
              document.documentElement.classList.remove("theme-light");
            }
          } catch {
            // Ignore
          }
        },
      },
      {
        pct: 54,
        status: "CONNECTING AI SERVICES",
        action: async () => {
          // Check backend /api/health with timeout
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const res = await fetch("/api/health", {
              signal: controller.signal,
            }).catch(() => null);

            clearTimeout(timeoutId);

            if (res && res.ok) {
              payloadRef.current.isOffline = false;
            } else {
              payloadRef.current.isOffline = true;
            }
          } catch {
            payloadRef.current.isOffline = true;
          }
        },
      },
      {
        pct: 73,
        status: "LOADING YOUR EXPERIENCE",
        action: async () => {
          // Check authenticated session from server
          const token = localStorage.getItem("premiers_auth_token");
          if (token && !payloadRef.current.isOffline) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 3000);

              const res = await fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal,
              }).catch(() => null);

              clearTimeout(timeoutId);

              if (res && res.ok) {
                const data = await res.json();
                if (data?.user) {
                  payloadRef.current.user = data.user;
                  localStorage.setItem("premiers_user", JSON.stringify(data.user));
                  if (data.subscription?.planId) {
                    payloadRef.current.planId = data.subscription.planId;
                    localStorage.setItem("premiers_plan", data.subscription.planId);
                  }
                }
              }
            } catch {
              // Local fallback intact
            }
          }
        },
      },
      {
        pct: 88,
        status: "PREPARING INTELLIGENT TOOLS",
        action: async () => {
          // Ensure DOM & fonts are rendered
          if (document.fonts && document.fonts.ready) {
            await document.fonts.ready.catch(() => {});
          }
        },
      },
      {
        pct: 97,
        status: "FINALIZING EXPERIENCE",
        action: async () => {
          // Tiny settling tick
          await new Promise((r) => setTimeout(r, 80));
        },
      },
      {
        pct: 100,
        status: "READY",
        action: async () => {
          setIsReady(true);
          sessionStorage.setItem("premiers_session_loaded", "true");
        },
      },
    ];

    try {
      for (const stage of stages) {
        targetPercentRef.current = stage.pct;
        setStatusMessage(stage.status);

        if (stage.action) {
          await stage.action();
        }

        await new Promise((resolve) => setTimeout(resolve, stepDelay));
      }

      // Allow visual percentage to settle exactly to 100%
      targetPercentRef.current = 100;
      setStatusMessage("READY");
      setIsReady(true);

      // Brief aesthetic pause to appreciate the READY 100% state, then cinematic exit
      const exitDelay = prefersReducedMotion ? 100 : 380;
      setTimeout(() => {
        setIsFadingOut(true);

        const fadeDuration = prefersReducedMotion ? 150 : 500;
        setTimeout(() => {
          onComplete(payloadRef.current);
        }, fadeDuration);
      }, exitDelay);
    } catch (err) {
      console.error("Initialization warning:", err);
      // If critical unexpected failure, provide clear recovery
      setHasError(true);
      setErrorMessage("We encountered an issue during PREMIERS AI initialization.");
    }
  }, [onComplete, isReturningUser, prefersReducedMotion]);

  // Run initialization once on mount
  useEffect(() => {
    startInitialization();
  }, [startInitialization]);

  // Handle continuing offline
  const handleContinueOffline = () => {
    payloadRef.current.isOffline = true;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete(payloadRef.current);
    }, 300);
  };

  // Formatted 2-3 digit percentage string (e.g., '01%', '17%', '89%', '100%')
  const roundedPercent = Math.min(100, Math.floor(displayPercent));
  const formattedPercent =
    roundedPercent < 10 ? `0${roundedPercent}%` : `${roundedPercent}%`;

  return (
    <div
      id="premiers-loading-screen"
      role="dialog"
      aria-modal="true"
      aria-label="PREMIERS AI Initialization Screen"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07080c] select-none overflow-hidden transition-all duration-500 ease-out ${
        isFadingOut
          ? "opacity-0 scale-[1.03] pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      {/* Background dynamic particle canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* Atmospheric radial glow layers (deep carbon + emerald/cyan rim) */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,212,160,0.11)_0%,rgba(0,184,212,0.05)_40%,transparent_70%)] pointer-events-none z-0 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(0,212,160,0.04),transparent_60%)] pointer-events-none z-0"
      />

      {/* Futuristic Corner Precision Reticles */}
      <div
        aria-hidden="true"
        className="absolute top-6 left-6 text-gray-600 font-mono text-[10px] tracking-widest pointer-events-none hidden sm:flex items-center gap-2"
      >
        <span className="w-2 h-2 border-t border-l border-indigo-400/40 inline-block" />
        <span>SYS // UNIVERSAL.CORE.V4</span>
      </div>
      <div
        aria-hidden="true"
        className="absolute top-6 right-6 text-gray-600 font-mono text-[10px] tracking-widest pointer-events-none hidden sm:flex items-center gap-2"
      >
        <span>STATUS // {isReady ? "READY" : "CALIBRATING"}</span>
        <span className="w-2 h-2 border-t border-r border-indigo-400/40 inline-block" />
      </div>
      <div
        aria-hidden="true"
        className="absolute bottom-6 left-6 text-gray-600 font-mono text-[10px] tracking-widest pointer-events-none hidden sm:flex items-center gap-2"
      >
        <span className="w-2 h-2 border-b border-l border-indigo-400/40 inline-block" />
        <span>STREAM ENGINE // ACTIVE</span>
      </div>
      <div
        aria-hidden="true"
        className="absolute bottom-6 right-6 text-gray-600 font-mono text-[10px] tracking-widest pointer-events-none hidden sm:flex items-center gap-2"
      >
        <span>GROUNDING // LIVE</span>
        <span className="w-2 h-2 border-b border-r border-indigo-400/40 inline-block" />
      </div>

      {/* Main Centered Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-lg w-full px-6 text-center">
        {!hasError ? (
          <>
            {/* LOGO & BRAND NAME */}
            <div className="flex flex-col items-center mb-2 anim-premiers-logo">
              {/* Brand Monogram with Glow Halo */}
              <div className="relative mb-4">
                <div
                  aria-hidden="true"
                  className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-indigo-500/25 via-cyan-500/25 to-teal-500/25 blur-xl anim-premiers-glow"
                />
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-[#12131d] via-[#1a1c2b] to-[#0c0d15] border border-indigo-500/40 shadow-2xl flex items-center justify-center text-white font-extrabold text-3xl sm:text-4xl tracking-tight">
                  <Sparkles className="w-8 h-8 text-indigo-400" />
                  {/* Micro corner accent */}
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                </div>
              </div>

              {/* Brand Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
                <span className="bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">NEXUS</span>
                <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
              </h1>
            </div>

            {/* TAGLINE */}
            <div className="mb-8 anim-premiers-tagline">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-gray-400 uppercase flex items-center justify-center gap-2">
                <span className="w-4 sm:w-6 h-px bg-gradient-to-r from-transparent to-indigo-400/60 inline-block" />
                <span className="text-gray-200">
                  UNIVERSAL INTELLIGENCE & CREATIVE ENGINE
                </span>
                <span className="w-4 sm:w-6 h-px bg-gradient-to-l from-transparent to-indigo-400/60 inline-block" />
              </p>
            </div>

            {/* 8: AI THINKING EFFECT (Concentric Orbital Intelligence Rings) */}
            <div
              aria-hidden="true"
              className="relative w-36 h-36 sm:w-40 sm:h-40 mb-8 flex items-center justify-center pointer-events-none"
            >
              {/* Outer Counter-Clockwise Orbital Ring with tick marks */}
              <div className="absolute inset-0 rounded-full border border-[#24273c]/70 anim-orbit-ccw flex items-center justify-center">
                <span className="absolute top-0 w-1.5 h-1.5 rounded-full bg-[#00b8d4] shadow-[0_0_8px_#00b8d4]" />
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-[#00b8d4]/60" />
              </div>

              {/* Inner Clockwise Orbital Ring with Satellite Node */}
              <div className="absolute inset-4 rounded-full border border-[#00d4a0]/35 anim-orbit-cw flex items-center justify-center">
                <span className="absolute top-0 w-2 h-2 rounded-full bg-[#00d4a0] shadow-[0_0_12px_#00d4a0]" />
              </div>

              {/* Concentric Pulse Wave */}
              <div className="absolute inset-8 rounded-full border border-[#00d4a0]/20 anim-pulse-ring" />

              {/* Central Glowing Intelligence Core */}
              <div className="relative w-12 h-12 rounded-full bg-[#0f111a] border border-[#00d4a0]/60 shadow-[0_0_20px_rgba(0,212,160,0.35)] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#00d4a0] animate-pulse" />
              </div>
            </div>

            {/* 5: PROGRESS PERCENTAGE DISPLAY */}
            <div className="mb-3">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                {formattedPercent}
              </span>
            </div>

            {/* 6: PROGRESS BAR */}
            <div
              role="progressbar"
              aria-valuenow={roundedPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="PREMIERS AI Initialization Progress"
              className="relative w-64 sm:w-80 md:w-96 h-2 rounded-full bg-[#151622] border border-[#26283b] overflow-hidden mb-4 shadow-[0_0_20px_rgba(0,0,0,0.6)]"
            >
              <div
                className="relative h-full rounded-full bg-gradient-to-r from-[#00d4a0] via-[#00b8d4] to-[#38bdf8] transition-all duration-200 ease-out shadow-[0_0_16px_rgba(0,212,160,0.5)]"
                style={{ width: `${roundedPercent}%` }}
              >
                {/* Gliding shimmer light reflection sweep across the active bar */}
                <span className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent anim-bar-shimmer" />
              </div>
            </div>

            {/* 7: LOADING STATUS MESSAGE */}
            <div
              aria-live="polite"
              className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-[#10111a]/80 backdrop-blur-md border border-[#23263a] text-xs font-semibold tracking-wider text-gray-300 uppercase shadow-lg"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isReady
                    ? "bg-[#00d4a0] shadow-[0_0_8px_#00d4a0]"
                    : "bg-[#00d4a0] animate-ping"
                }`}
              />
              <span className="text-gray-200">
                {isReady ? "SYSTEM READY" : statusMessage}
              </span>
            </div>
          </>
        ) : (
          /* 14: CLEAN ERROR RECOVERY STATE */
          <div className="flex flex-col items-center bg-[#10111a] border border-[#2b2533] p-8 rounded-2xl shadow-2xl text-center max-w-sm">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              {errorMessage || "We encountered an issue during startup initialization."}
            </p>
            <div className="flex flex-col w-full gap-2.5">
              <button
                type="button"
                onClick={() => startInitialization()}
                className="w-full py-2.5 px-4 rounded-xl bg-[#00d4a0] hover:bg-[#00e8b0] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#00d4a0]/20 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Initialization</span>
              </button>
              <button
                type="button"
                onClick={handleContinueOffline}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1b1d2b] hover:bg-[#25283b] text-gray-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#282b3d] active:scale-95"
              >
                <WifiOff className="w-4 h-4 text-gray-400" />
                <span>Continue Offline</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite">
        {isReady
          ? "PREMIERS AI initialized. System Ready."
          : `PREMIERS AI is initializing. ${roundedPercent} percent complete. Current status: ${statusMessage}`}
      </div>
    </div>
  );
}
