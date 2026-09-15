import { useState } from "react";
import { ServiceItem } from "../types";
import { Search, Sparkles, Globe, Code, PenTool, Check, ArrowRight, X } from "lucide-react";

interface ServicesMarketplaceProps {
  onSelectService: (service: ServiceItem) => void;
}

const SERVICES_DATA: ServiceItem[] = [
  {
    id: "logo-branding",
    title: "Brand Identity & Vector Logo Suite",
    category: "AI Visuals",
    description: "Generate cohesive brand marks, geometric logos, typography pairings, and complete color palettes tailored to your global business.",
    features: [
      "Custom vector & geometric mark options",
      "Palette generation (Emerald, Cyber, Luxury, Sunset)",
      "High-resolution PNG/SVG download",
      "Social media avatar & favicon dimensions",
      "Multilingual typography guidance (Latin, Arabic, Urdu, CJK)",
    ],
    icon: "🎨",
    badge: "Most Popular",
    price: "Included with Standard",
  },
  {
    id: "yt-thumbnails",
    title: "High-CTR YouTube Thumbnails",
    category: "AI Visuals",
    description: "Catchy 1280x720 video thumbnails crafted for maximum viewer retention, high click-through rates, and bold readable text.",
    features: [
      "16:9 standard YouTube HD resolution",
      "High-contrast color styling & depth drop-shadows",
      "Bold multi-language headline typography",
      "Subject framing and gradient ambient orbs",
      "Direct in-chat preview and download",
    ],
    icon: "🎬",
    badge: "Trending",
    price: "Included with Standard",
  },
  {
    id: "multilingual-localization",
    title: "Global Multilingual Content Localization",
    category: "Multilingual AI",
    description: "Translate, localize, and adapt full marketing campaigns, technical documentation, and product descriptions across 100+ world languages.",
    features: [
      "Native tone translation in Urdu, Arabic, French, Spanish, Chinese",
      "Culturally sensitive idioms and nuance handling",
      "RTL / LTR format preservation",
      "Preserves technical terminology and brand names",
      "Bidirectional conversational validation",
    ],
    icon: "🌍",
    badge: "Global",
    price: "Included with Free",
  },
  {
    id: "image-vision-audit",
    title: "Multimodal Vision & Technical Inspection",
    category: "AI Visuals",
    description: "Upload screenshots of software UI, architecture blueprints, data charts, or error screens for instant diagnostic breakdown.",
    features: [
      "OCR text and code extraction from images",
      "UI/UX accessibility and hierarchy critique",
      "System flow diagram interpretation",
      "Document and spreadsheet data summaries",
    ],
    icon: "🔍",
    price: "Included with Free",
  },
  {
    id: "fullstack-website",
    title: "Rapid Website Prototyping & Live Sandbox",
    category: "Development",
    description: "Turn natural language prompts into complete, responsive HTML/CSS/JavaScript websites with interactive iframe sandboxes.",
    features: [
      "Clean modular code structures with file trees",
      "Interactive live preview directly inside chat",
      "Responsive layout for mobile, tablet, and desktop",
      "One-click full screen viewer",
    ],
    icon: "💻",
    badge: "Pro",
    price: "Included with Standard",
  },
  {
    id: "creative-copywriting",
    title: "Viral Copywriting & Script Studio",
    category: "Content Creation",
    description: "Produce high-converting ad copy, viral social media posts, hook-heavy video scripts, and long-form thought leadership blogs.",
    features: [
      "Viral hooks and retention framework formulas",
      "SEO optimized article drafts with headings",
      "Multi-platform format variants (X, LinkedIn, Instagram)",
      "Tone matching from playful to corporate elegance",
    ],
    icon: "✍️",
    price: "Included with Free",
  },
];

export function ServicesMarketplace({ onSelectService }: ServicesMarketplaceProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailModalService, setDetailModalService] = useState<ServiceItem | null>(null);

  const categories = ["All", "AI Visuals", "Multilingual AI", "Development", "Content Creation"];

  const filteredServices = SERVICES_DATA.filter((srv) => {
    const matchesCat = activeCategory === "All" || srv.category === activeCategory;
    const matchesSearch =
      srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <section id="marketplace" className="py-16 md:py-24 border-t border-[#1e1e2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-[#00d4a0] mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Marketplace & Solutions</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Services <span className="text-[#00d4a0]">Marketplace</span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Browse specialized AI creative, linguistic, and engineering services. All cards feature vertical scrolling to ensure no content is hidden on any screen size.
          </p>
        </div>

        {/* Filter Controls: Search & Category Pills */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all min-h-[38px] cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#00d4a0] text-black font-bold shadow-sm"
                    : "bg-[#141420] border border-[#26263a] text-gray-300 hover:text-white hover:bg-[#1c1c2c]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services & tools…"
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#2b2b3e] bg-[#141420] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4a0] transition-colors"
            />
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#2b2b3e] rounded-2xl bg-[#101018]">
            <p className="text-gray-400 text-sm">No services found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                className="rounded-2xl border border-[#242436] bg-[#12121c] p-6 flex flex-col justify-between hover:border-[#00d4a0]/40 transition-all duration-200 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-3xl">{srv.icon}</span>
                    {srv.badge && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#00d4a0]/15 text-[#00d4a0] border border-[#00d4a0]/30">
                        {srv.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{srv.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{srv.description}</p>
                </div>

                {/* Features list with Card Scroll for containment */}
                <div className="card-scroll border-t border-[#1e1e2e] pt-3 mb-4 space-y-1.5 max-h-36">
                  {srv.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                      <Check className="w-3.5 h-3.5 text-[#00d4a0] shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#1e1e2e] flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#00d4a0]">{srv.price}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDetailModalService(srv)}
                      className="px-2.5 py-1.5 text-xs text-gray-300 hover:text-white rounded-lg border border-[#2a2a3e] hover:bg-[#1a1a28] cursor-pointer"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => onSelectService(srv)}
                      className="px-3.5 py-1.5 text-xs rounded-lg bg-[#00d4a0] hover:bg-[#00e8b0] text-black font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Launch</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Service Detail Modal */}
        {detailModalService && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={() => setDetailModalService(null)}
          >
            <div
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#2e2e44] bg-[#12121c] p-6 sm:p-8 shadow-2xl card-scroll"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setDetailModalService(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#2e2e44] bg-[#1a1a28] flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{detailModalService.icon}</span>
                <div>
                  <div className="text-xs font-bold text-[#00d4a0] uppercase tracking-wider">
                    {detailModalService.category}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    {detailModalService.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                {detailModalService.description}
              </p>

              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Included Capabilities:
                </h4>
                <div className="space-y-2 card-scroll max-h-48 p-2 rounded-xl bg-[#0d0d14] border border-[#202030]">
                  {detailModalService.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-200">
                      <Check className="w-4 h-4 text-[#00d4a0] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#202030]">
                <div>
                  <div className="text-[11px] text-gray-400">Subscription Status</div>
                  <div className="text-sm font-bold text-[#00d4a0]">{detailModalService.price}</div>
                </div>
                <button
                  onClick={() => {
                    const selected = detailModalService;
                    setDetailModalService(null);
                    onSelectService(selected);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#00d4a0] hover:bg-[#00e8b0] text-black font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-[#00d4a0]/20"
                >
                  <span>Use Service in Chat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
