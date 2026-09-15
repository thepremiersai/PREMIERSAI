import React, { useEffect, useRef } from "react";
import { Sparkles, ArrowRight, Globe, ShieldCheck, Zap, Code2, Flame, PlaySquare, Compass } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
  onExploreCapabilities: () => void;
  onSelectPrompt: (promptText: string) => void;
}

export function HeroSection({
  onGetStarted,
  onExploreCapabilities,
  onSelectPrompt,
}: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Realistic Cinematic Ambient Starfield / Particle Mesh
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
      color: string;
    }> = [];

    const colors = ["#00d4a0", "#00b8d4", "#ff4d00", "#a855f7", "#ffd700"];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle connective filaments
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;
        if (p1.x < 0) p1.x = width;
        if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        if (p1.y > height) p1.y = 0;

        ctx.fillStyle = p1.color;
        ctx.globalAlpha = p1.alpha;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 100) {
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = (1 - dist / 100) * 0.15;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const samplePrompts = [
    { text: "Create a modern tech company logo with cyan and emerald gradient", label: "🏢 Company Logo", isHot: true },
    { text: "Build an interactive SaaS landing page with working cart", label: "⚡ Web Sandbox", isHot: true },
    { text: "Design a luxury coffee brand identity and logo", label: "☕ Brand Identity", isHot: true },
    { text: "Generate a photorealistic supercar in neon cyberpunk city", label: "🏎️ 4K Vision", isHot: false },
    { text: "Aap mere liye modern company logo aur website bana dein", label: "🌐 Roman Urdu", isHot: false },
    { text: "مصنوعی ذہانت اور جدید ٹیکنالوجی کے لیے ایک باوقار کارپوریٹ لوگو ڈیزائن کریں", label: "اردو", isRTL: true, isHot: false },
  ];

  return (
    <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-20 text-center">
      {/* Cinematic particle canvas layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none -z-10 opacity-70"
      />

      {/* Cinematic ambient background lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] h-[340px] sm:h-[600px] bg-gradient-to-tr from-[#00d4a0]/15 via-[#ff4d00]/10 to-[#00b8d4]/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse duration-1000" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Cinematic Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#00d4a0]/30 bg-[#0e1614]/80 text-[#00d4a0] text-xs sm:text-sm font-semibold mb-6 shadow-lg shadow-[#00d4a0]/10 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4a0] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d4a0]"></span>
          </span>
          <span>Universal Multilingual AI & Procedural Visual Studio</span>
        </div>

        {/* Shortened, Punchy Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-5 leading-tight sm:leading-none">
          Universal AI for{" "}
          <span className="bg-gradient-to-r from-[#00d4a0] via-[#00e8b0] to-[#00b8d4] bg-clip-text text-transparent">
            Every Language & Vision
          </span>
        </h1>

        {/* Shortened, Clear Hero Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Speak 100+ languages, craft custom company logos, generate photorealistic visual art, and build interactive web apps with live code.
        </p>

        {/* Action Buttons - Fully Animated */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00d4a0] via-[#00e8b0] to-[#00b8d4] text-black font-extrabold text-base shadow-xl shadow-[#00d4a0]/30 btn-animated-primary btn-shimmer flex items-center justify-center gap-2 cursor-pointer min-h-[48px] group"
          >
            <span>Start Generating Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onExploreCapabilities}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#2e2e44] bg-[#14141f]/90 hover:bg-[#1c1c2b] text-gray-200 hover:text-white text-base font-semibold btn-animated-pill min-h-[48px] cursor-pointer backdrop-blur"
          >
            Explore Capabilities
          </button>
        </div>

        {/* Live Instant-Prompt Showcase */}
        <div className="border border-[#242436] rounded-2xl bg-[#0e0e16]/85 p-4 sm:p-5 backdrop-blur-md shadow-2xl">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00d4a0]" />
            <span>Try Instant High-Impact Prompts</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPrompt(prompt.text)}
                className={`group inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs text-left max-w-full cursor-pointer btn-animated-pill ${
                  prompt.isHot
                    ? "border-[#00d4a0]/50 bg-gradient-to-r from-[#00d4a0]/15 to-[#141420] text-white hover:border-[#00d4a0] shadow-sm shadow-[#00d4a0]/15"
                    : "border-[#26263a] bg-[#141420] hover:border-[#00d4a0]/50 hover:bg-[#1c1c2e] text-gray-300 hover:text-white"
                }`}
                title={`Click to try: "${prompt.text}"`}
              >
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    prompt.isHot ? "bg-[#00d4a0]/25 text-[#00d4a0]" : "bg-[#252538] text-gray-300"
                  }`}
                >
                  {prompt.label}
                </span>
                <span className="truncate max-w-[220px] sm:max-w-[300px]" dir={prompt.isRTL ? "rtl" : "ltr"}>
                  "{prompt.text}"
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Highlights Trust Row with Realistic Connection Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mt-10 pt-8 border-t border-[#1e1e2e] text-left">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#11111a]/50 border border-[#222234]">
            <div className="w-9 h-9 rounded-lg bg-[#00d4a0]/15 flex items-center justify-center text-[#00d4a0] shrink-0 font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white">100+ Languages</div>
              <div className="text-[11px] text-gray-400">Urdu, Arabic, Roman</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#11111a]/50 border border-[#222234]">
            <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center text-orange-400 shrink-0 font-bold">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white">Smart Visuals</div>
              <div className="text-[11px] text-gray-400">Company & Brand Logos</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#11111a]/50 border border-[#222234]">
            <div className="w-9 h-9 rounded-lg bg-[#00b8d4]/15 flex items-center justify-center text-[#00b8d4] shrink-0 font-bold">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white">Live Web Sandbox</div>
              <div className="text-[11px] text-gray-400">Instant Interactive UI</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#11111a]/50 border border-[#222234]">
            <div className="w-9 h-9 rounded-lg bg-[#a855f7]/15 flex items-center justify-center text-[#a855f7] shrink-0 font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white">Secure Persistence</div>
              <div className="text-[11px] text-gray-400">Relational SQLite Core</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
