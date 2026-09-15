import { Globe, Image as ImageIcon, Sparkles, Code2, PenTool, ArrowRight, Check } from "lucide-react";

interface CapabilitiesSectionProps {
  onSelectAction: (actionType: "chat" | "image" | "analysis" | "creative", promptText?: string) => void;
}

export function CapabilitiesSection({ onSelectAction }: CapabilitiesSectionProps) {
  const capabilities = [
    {
      id: "multilingual",
      icon: <Globe className="w-6 h-6 text-[#00d4a0]" />,
      title: "Global Multilingual Intelligence",
      badge: "Worldwide",
      badgeColor: "bg-[#00d4a0]/15 text-[#00d4a0] border-[#00d4a0]/30",
      description: "Ask PREMIERS AI in English, Urdu (اردو), Roman Urdu, Arabic (العربية), Persian, Hebrew, Hindi, Chinese, or European languages. It detects the language, replies naturally, supports mid-conversation language switching, and mirrors layout with proper RTL typography.",
      features: [
        "Automatic language and script detection",
        "Fluent Roman Urdu comprehension & replies",
        "RTL text alignment for Urdu, Arabic, Persian, Hebrew",
        "Context preservation when switching languages mid-conversation",
        "Unicode & multi-script rendering without corruption",
      ],
      actionLabel: "Try Multilingual Chat",
      actionPrompt: "السلام علیکم! کیا آپ مجھے اردو میں جدید ٹیکنالوجی کے بارے میں بتا سکتے ہیں؟",
      actionType: "chat" as const,
      featured: false,
    },
    {
      id: "vision",
      icon: <ImageIcon className="w-6 h-6 text-[#00b8d4]" />,
      title: "AI Vision & Image Analysis",
      badge: "Vision",
      badgeColor: "bg-[#00b8d4]/15 text-[#00b8d4] border-[#00b8d4]/30",
      description: "Upload photos, screenshots, charts, architectural diagrams, or visual designs directly into chat. PREMIERS AI inspects details, transcribes text, interprets diagrams, and gives professional critique.",
      features: [
        "Object recognition and scene description",
        "OCR text extraction from screenshots & docs",
        "Chart, infographic, and workflow breakdown",
        "Design feedback for logos, UI, and branding",
        "Multimodal support across multiple attachments",
      ],
      actionLabel: "Upload & Analyze Image",
      actionPrompt: "Please inspect this attached visual and provide a detailed analysis of its elements and structure.",
      actionType: "analysis" as const,
      featured: false,
    },
    {
      id: "creative-graphics",
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      title: "AI Image & Graphic Creation",
      badge: "Core Feature",
      badgeColor: "bg-amber-400/15 text-amber-300 border-amber-400/30",
      description: "Generate production-quality visual assets right inside PREMIERS AI: sleek minimalist logos, high-CTR YouTube thumbnails, promotional event posters, social banners, and digital graphics.",
      features: [
        "Logos: modern geometric, monogram, emblem, and minimalist marks",
        "YouTube Thumbnails: 1280x720 high contrast & bold typography",
        "Posters & Banners: ready for social media & print campaigns",
        "Instant in-browser preview and PNG/SVG downloads",
        "Regenerate and refine with multiple color palettes",
      ],
      actionLabel: "Generate a Logo / Visual",
      actionPrompt: "Create a modern luxury logo for PREMIERS AI",
      actionType: "image" as const,
      featured: true,
    },
    {
      id: "creative-tools",
      icon: <PenTool className="w-6 h-6 text-purple-400" />,
      title: "Creative Writing & Marketing",
      badge: "Writing",
      badgeColor: "bg-purple-400/15 text-purple-300 border-purple-400/30",
      description: "Produce engaging social media captions, compelling sales copy, multi-chapter video scripts, academic research summaries, and international translations that resonate with target audiences.",
      features: [
        "Marketing copy for ad campaigns and websites",
        "High-retention YouTube scripts and hook outlines",
        "Professional translation and cultural localization",
        "Brainstorming brand names and slogans",
      ],
      actionLabel: "Start Creative Writing",
      actionPrompt: "Write a high-converting social media marketing plan with hooks and captions",
      actionType: "creative" as const,
      featured: false,
    },
    {
      id: "coding",
      icon: <Code2 className="w-6 h-6 text-emerald-400" />,
      title: "Full-Stack Development & Coding",
      badge: "Engineering",
      badgeColor: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
      description: "Receive production-ready code with complete syntax highlighting, copyable code blocks, error troubleshooting, and live website preview rendering right inside the chat window.",
      features: [
        "TypeScript, React, Node.js, Python, and SQL mastery",
        "Full website generation with sandbox live preview",
        "Algorithmic optimization and clean architectures",
        "Step-by-step bug explanations and unit tests",
      ],
      actionLabel: "Build & Code with AI",
      actionPrompt: "Build a responsive React component for an interactive data card with Tailwind CSS",
      actionType: "chat" as const,
      featured: false,
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 border-t border-[#1e1e2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-wider text-[#00d4a0] mb-2">
            AI Capabilities
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Studio-Grade <span className="text-[#00d4a0]">Intelligence</span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Every capability is fully responsive, supports multi-line text without clipping, and features vertical card scrolling so you never lose sight of your workflows on mobile or desktop.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap) => (
            <div
              key={cap.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 relative ${
                cap.featured
                  ? "bg-gradient-to-b from-[#161b26] to-[#12121c] border-[#00d4a0]/50 shadow-lg shadow-[#00d4a0]/10"
                  : "bg-[#12121c] border-[#242436] hover:border-[#00d4a0]/30"
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#1a1a28] border border-[#2b2b3e] flex items-center justify-center">
                  {cap.icon}
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${cap.badgeColor}`}>
                  {cap.badge}
                </span>
              </div>

              {/* Title & Desc */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2.5">{cap.title}</h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">{cap.description}</p>
              </div>

              {/* Features List with Card Scroll safety */}
              <div className="card-scroll border-t border-[#1e1e2e] pt-3 mb-4 space-y-2 max-h-40">
                {cap.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <Check className="w-3.5 h-3.5 text-[#00d4a0] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectAction(cap.actionType, cap.actionPrompt)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[42px] cursor-pointer ${
                  cap.featured
                    ? "bg-[#00d4a0] hover:bg-[#00e8b0] text-black font-bold shadow-md shadow-[#00d4a0]/20"
                    : "border border-[#2e2e44] bg-[#171724] hover:bg-[#1f1f30] text-white"
                }`}
              >
                <span>{cap.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
