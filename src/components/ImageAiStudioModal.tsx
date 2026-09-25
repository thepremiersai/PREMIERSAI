import { useState, useRef, useEffect } from "react";
import {
  X,
  Sparkles,
  Download,
  Image as ImageIcon,
  Sliders,
  Palette,
  Layers,
  Wand2,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle2,
  UploadCloud,
  FileImage,
  Share2,
} from "lucide-react";
import { generateCreativeGraphic, GraphicOptions } from "../lib/creativeGenerator";
import { parseVisualIntent } from "../lib/visualIntentEngine";

interface ImageAiStudioModalProps {
  onClose: () => void;
  onSendToChat?: (prompt: string, imageUrl?: string) => void;
}

type StudioTab = "generate" | "enhance" | "history";

interface HistoryItem {
  id: string;
  url: string;
  title: string;
  category: string;
  createdAt: number;
}

export function ImageAiStudioModal({ onClose, onSendToChat }: ImageAiStudioModalProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>("generate");

  // Generator form
  const [category, setCategory] = useState<"logo" | "thumbnail" | "poster" | "banner">("logo");
  const [conceptId, setConceptId] = useState<"emblem" | "monogram" | "combination" | "badge">("emblem");
  const [isTransparent, setIsTransparent] = useState(false);
  const [title, setTitle] = useState("PREMIERS AI");
  const [subtitle, setSubtitle] = useState("Intelligent Creative Suite");
  const [palette, setPalette] = useState<"emerald" | "cyber" | "sunset" | "luxury" | "ocean">("emerald");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  // Enhancer form
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [filterMode, setFilterMode] = useState<"none" | "studio" | "cyber" | "bw" | "vibrant">("none");
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);

  // History
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("premiers_image_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Save history
  const saveToHistory = (url: string, itemTitle: string, itemCategory: string) => {
    const item: HistoryItem = {
      id: "img_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      url,
      title: itemTitle,
      category: itemCategory,
      createdAt: Date.now(),
    };
    const updated = [item, ...history].slice(0, 30);
    setHistory(updated);
    try {
      localStorage.setItem("premiers_image_history", JSON.stringify(updated));
    } catch {
      // Storage limits
    }
  };

  // Generate graphic
  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const intent = parseVisualIntent(title);
        const effectiveTitle = intent ? intent.brandName : (title.trim() || "PREMIERS AI");
        const effectiveTheme = intent ? (intent.theme as any) : undefined;
        const effectiveInitials = intent ? intent.initials : undefined;

        const url = generateCreativeGraphic({
          title: effectiveTitle,
          subtitle: subtitle.trim(),
          category,
          theme: effectiveTheme,
          conceptId: category === "logo" ? conceptId : undefined,
          initials: effectiveInitials,
          palette,
          transparentBg: isTransparent,
        });
        setGeneratedUrl(url);
        saveToHistory(url, effectiveTitle, category);
      } catch (err) {
        console.error("Image generation error:", err);
      } finally {
        setIsGenerating(false);
      }
    }, 600);
  };

  // Handle uploaded source image for enhancement
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSourceImage(result);
      setEnhancedUrl(result);
    };
    reader.readAsDataURL(file);
  };

  // Apply real-time canvas enhancement
  useEffect(() => {
    if (!sourceImage || activeTab !== "enhance") return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = sourceImage;
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Filter styling
      let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      if (filterMode === "bw") {
        filterString += " grayscale(100%)";
      } else if (filterMode === "vibrant") {
        filterString += " saturate(160%) contrast(115%)";
      } else if (filterMode === "cyber") {
        filterString += " hue-rotate(180deg) contrast(120%)";
      }

      ctx.filter = filterString;
      ctx.drawImage(img, 0, 0);

      if (filterMode === "studio") {
        // Apply soft vignette
        const grad = ctx.createRadialGradient(
          img.width / 2,
          img.height / 2,
          Math.min(img.width, img.height) * 0.3,
          img.width / 2,
          img.height / 2,
          Math.max(img.width, img.height) * 0.7
        );
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, "rgba(0,0,0,0.45)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, img.width, img.height);
      }

      try {
        setEnhancedUrl(canvas.toDataURL("image/png"));
      } catch (e) {
        // Canvas tainted
      }
    };
  }, [sourceImage, brightness, contrast, saturation, filterMode, activeTab]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in-50 duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-[#2b2b3e] bg-[#0d0d16] text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222234] bg-[#12121e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4a0] to-[#00b8d4] flex items-center justify-center text-black font-extrabold shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>PREMIERS Image AI Studio</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#00d4a0]/15 text-[#00d4a0] border border-[#00d4a0]/30">
                  Universal Visuals
                </span>
              </h2>
              <p className="text-xs text-gray-400">High-resolution procedural generator, vector-grade logos & visual enhancer</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1c1c2a] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#222234] bg-[#0f0f1a] select-none text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab("generate")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === "generate"
                ? "border-[#00d4a0] text-[#00d4a0] bg-[#161626]"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>Generate Graphic</span>
          </button>
          <button
            onClick={() => setActiveTab("enhance")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === "enhance"
                ? "border-[#00d4a0] text-[#00d4a0] bg-[#161626]"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Enhance & Filters</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === "history"
                ? "border-[#00d4a0] text-[#00d4a0] bg-[#161626]"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>History ({history.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: GENERATE */}
          {activeTab === "generate" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls Column */}
              <div className="lg:col-span-5 space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Visual Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "logo", label: "Logo", desc: "1:1 Square Brand Mark" },
                      { id: "thumbnail", label: "Thumbnail", desc: "16:9 HD 1280x720" },
                      { id: "poster", label: "Poster", desc: "4:5 Portrait 800x1000" },
                      { id: "banner", label: "Banner", desc: "3:1 Wide 1200x400" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCategory(item.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          category === item.id
                            ? "border-[#00d4a0] bg-[#00d4a0]/10 text-white"
                            : "border-[#252538] bg-[#141422] text-gray-400 hover:border-[#35354e]"
                        }`}
                      >
                        <div className="font-bold text-sm text-white">{item.label}</div>
                        <div className="text-[11px] text-gray-400">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Primary Brand Title / Headline
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. PREMIERS AI"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#2b2b3e] bg-[#141422] text-white text-sm focus:border-[#00d4a0] focus:outline-none"
                  />
                </div>

                {/* Subtitle Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Next-Generation Universal Intelligence"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#2b2b3e] bg-[#141422] text-white text-sm focus:border-[#00d4a0] focus:outline-none"
                  />
                </div>

                {/* Color Palette Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Atmosphere & Color Theme
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "emerald", name: "Emerald Cyber", hex: "#00d4a0" },
                      { id: "cyber", name: "Cyber Neon", hex: "#a855f7" },
                      { id: "sunset", name: "Sunset Gold", hex: "#f97316" },
                      { id: "luxury", name: "Royal Gold", hex: "#e2b144" },
                      { id: "ocean", name: "Deep Ocean", hex: "#38bdf8" },
                    ].map((pal) => (
                      <button
                        key={pal.id}
                        type="button"
                        onClick={() => setPalette(pal.id as any)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                          palette === pal.id
                            ? "border-[#00d4a0] bg-[#18182a]"
                            : "border-[#252538] bg-[#12121e] hover:border-[#35354e]"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: pal.hex }}
                        />
                        <span className="text-xs font-medium truncate">{pal.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Concept Selection (when logo is selected) */}
                {category === "logo" && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Logo Concept Strategy
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "emblem", label: "Primary Emblem", desc: "Dynamic Crest / Shield" },
                        { id: "monogram", label: "Monogram Mark", desc: "Faceted Lettermark" },
                        { id: "combination", label: "Combination Mark", desc: "Symbol + Typography" },
                        { id: "badge", label: "Tournament Badge", desc: "Hexagonal Insignia Seal" },
                      ].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setConceptId(c.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            conceptId === c.id
                              ? "border-[#00d4a0] bg-[#00d4a0]/15 text-white"
                              : "border-[#252538] bg-[#141422] text-gray-400 hover:border-[#35354e]"
                          }`}
                        >
                          <div className="font-bold text-xs text-white">{c.label}</div>
                          <div className="text-[10px] text-gray-400">{c.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Background Transparency Mode */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Background Output
                  </label>
                  <div className="flex items-center gap-2 bg-[#12121e] p-1 rounded-xl border border-[#252538] text-xs">
                    <button
                      type="button"
                      onClick={() => setIsTransparent(false)}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center ${
                        !isTransparent
                          ? "bg-[#00d4a0] text-black shadow-sm"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      🌙 Solid Dark Stage
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTransparent(true)}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center ${
                        isTransparent
                          ? "bg-[#00d4a0] text-black shadow-sm"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      ✨ Transparent PNG
                    </button>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-3 px-4 rounded-xl bg-[#00d4a0] hover:bg-[#00e8b0] text-black font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#00d4a0]/30 disabled:opacity-50 cursor-pointer transition-all btn-shimmer-neon btn-glow-pulse active:scale-95"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Graphic…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate High-Res Graphic</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preview Column */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl border border-[#222234] bg-[#0a0a10] min-h-[380px]">
                {isGenerating ? (
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 rounded-full border-3 border-[#00d4a0] border-t-transparent animate-spin mx-auto" />
                    <div className="text-sm font-semibold text-[#00d4a0]">PREMIERS AI Rendering Engine</div>
                    <div className="text-xs text-gray-400">Composing geometric vector grids and radial lighting…</div>
                  </div>
                ) : generatedUrl ? (
                  <div className="w-full space-y-4">
                    <div className="relative rounded-xl overflow-hidden border border-[#2b2b3e] shadow-2xl bg-black flex items-center justify-center max-h-[460px]">
                      <img
                        src={generatedUrl}
                        alt="Generated preview"
                        className="max-h-[420px] w-auto object-contain"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-gray-400">
                        Resolution: {category === "thumbnail" ? "1280 × 720 (16:9)" : category === "banner" ? "1200 × 400 (3:1)" : category === "poster" ? "800 × 1000 (4:5)" : "800 × 600 (Square)"}
                      </div>

                      <div className="flex items-center gap-2">
                        {onSendToChat && (
                          <button
                            type="button"
                            onClick={() => {
                              onSendToChat(`I generated a ${category} titled "${title}"`, generatedUrl);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg border border-[#2e2e44] bg-[#161626] text-xs font-semibold text-gray-200 hover:text-white hover:bg-[#1e1e32] cursor-pointer flex items-center gap-1.5 transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Attach to Chat</span>
                          </button>
                        )}

                        <a
                          href={generatedUrl}
                          download={`premiers-${category}-${Date.now()}.png`}
                          className="px-4 py-2 rounded-xl bg-[#00d4a0] hover:bg-[#00e8b0] text-black text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#00d4a0]/30 cursor-pointer transition-all btn-shimmer-neon btn-glow-pulse active:scale-95"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download PNG</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3 p-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#141422] border border-[#28283c] flex items-center justify-center mx-auto text-gray-500">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <div className="text-sm font-semibold text-gray-300">Ready to Create</div>
                    <div className="text-xs text-gray-500 max-w-sm">
                      Select your desired visual format, enter your brand title, choose an atmosphere, and click Generate.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ENHANCE */}
          {activeTab === "enhance" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                {/* Upload Button */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-[#2b2b3e] hover:border-[#00d4a0] bg-[#141422] text-center cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-8 h-8 text-[#00d4a0] mx-auto mb-2" />
                  <div className="text-sm font-semibold text-white">Click or Drop Image to Enhance</div>
                  <div className="text-xs text-gray-400 mt-1">Supports PNG, JPG, WebP</div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {sourceImage && (
                  <div className="space-y-4 pt-2">
                    {/* Filter Presets */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                        Studio Filter Presets
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "none", label: "Normal" },
                          { id: "studio", label: "Vignette" },
                          { id: "vibrant", label: "Vibrant" },
                          { id: "bw", label: "Mono B&W" },
                          { id: "cyber", label: "Cyberpunk" },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setFilterMode(f.id as any)}
                            className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              filterMode === f.id
                                ? "border-[#00d4a0] bg-[#00d4a0]/15 text-[#00d4a0]"
                                : "border-[#252538] bg-[#141422] text-gray-400 hover:text-white"
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sliders */}
                    <div className="space-y-3 p-4 rounded-xl border border-[#252538] bg-[#12121e]">
                      <div>
                        <div className="flex justify-between text-xs text-gray-300 mb-1">
                          <span>Brightness</span>
                          <span className="font-mono">{brightness}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="160"
                          value={brightness}
                          onChange={(e) => setBrightness(Number(e.target.value))}
                          className="w-full accent-[#00d4a0]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-300 mb-1">
                          <span>Contrast</span>
                          <span className="font-mono">{contrast}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="180"
                          value={contrast}
                          onChange={(e) => setContrast(Number(e.target.value))}
                          className="w-full accent-[#00d4a0]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-300 mb-1">
                          <span>Saturation</span>
                          <span className="font-mono">{saturation}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={saturation}
                          onChange={(e) => setSaturation(Number(e.target.value))}
                          className="w-full accent-[#00d4a0]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setBrightness(100);
                          setContrast(100);
                          setSaturation(100);
                          setFilterMode("none");
                        }}
                        className="w-full py-1.5 text-xs text-gray-400 hover:text-white border border-[#2b2b3e] rounded-lg cursor-pointer transition-colors"
                      >
                        Reset Adjustments
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Preview */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl border border-[#222234] bg-[#0a0a10] min-h-[380px]">
                {enhancedUrl ? (
                  <div className="w-full space-y-4">
                    <div className="relative rounded-xl overflow-hidden border border-[#2b2b3e] shadow-2xl bg-black flex items-center justify-center max-h-[460px]">
                      <img
                        src={enhancedUrl}
                        alt="Enhanced"
                        className="max-h-[420px] w-auto object-contain"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <a
                        href={enhancedUrl}
                        download={`premiers-enhanced-${Date.now()}.png`}
                        className="px-4 py-2 rounded-xl bg-[#00d4a0] hover:bg-[#00e8b0] text-black text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#00d4a0]/20 cursor-pointer transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Enhanced Image</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3 p-8">
                    <FileImage className="w-12 h-12 text-gray-600 mx-auto" />
                    <div className="text-sm font-semibold text-gray-300">No Image Uploaded</div>
                    <div className="text-xs text-gray-500">Upload a photo or design to adjust brightness, saturation, contrast, and apply studio filters.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Showing {history.length} generated visuals stored in your browser workspace.
                </div>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistory([]);
                      localStorage.removeItem("premiers_image_history");
                    }}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Visual History</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="p-12 text-center text-gray-500 border border-[#222234] rounded-2xl">
                  No visuals generated yet. Switch to the "Generate Graphic" tab to create your first asset!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-xl border border-[#242436] bg-[#12121e] overflow-hidden hover:border-[#00d4a0]/60 transition-all shadow-md"
                    >
                      <div className="aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white truncate max-w-[150px]">
                            {item.title}
                          </div>
                          <div className="text-[10px] uppercase font-semibold text-[#00d4a0]">
                            {item.category}
                          </div>
                        </div>
                        <a
                          href={item.url}
                          download={`premiers-${item.category}-${item.id}.png`}
                          className="p-1.5 rounded-lg bg-[#202032] hover:bg-[#00d4a0] hover:text-black text-gray-300 transition-colors cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
