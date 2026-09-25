import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Sparkles,
  Download,
  Share2,
  Copy,
  Check,
  Maximize2,
  RefreshCw,
  Wand2,
  ArrowRight,
  Eye,
} from "lucide-react";
import { generateCreativeGraphic } from "../lib/creativeGenerator";
import {
  parseVisualIntent,
  generateLogoSvg,
  detectCategory,
  detectDesignStyle,
  detectTypographyStyle,
  extractAccurateBrandName,
  extractColorPalette,
} from "../lib/visualIntentEngine";

interface ImageAiStudioModalProps {
  onClose: () => void;
  onSendToChat?: (prompt: string, imageUrl?: string) => void;
  initialPrompt?: string;
}

interface CreativeResult {
  id: string;
  url: string;
  svgCode?: string;
  title: string;
  designType: string;
  categoryLabel: string;
  aspectRatioLabel: string;
  resolutionLabel: string;
  userPrompt: string;
  createdAt: number;
}

const INSPIRATION_PROMPTS = [
  "Create a professional gaming logo for YASIR FF",
  "Make a YouTube thumbnail about AI revolution",
  "Create a luxury perfume advertisement",
  "Create a futuristic website hero image",
  "Create a realistic image of a futuristic city",
  "Create a cartoon character wearing a black hoodie",
  "Design a modern restaurant poster",
  "Create a professional business logo for PREMIERS",
];

export function ImageAiStudioModal({
  onClose,
  onSendToChat,
  initialPrompt = "",
}: ImageAiStudioModalProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<string>("Analyzing intent...");
  const [currentResult, setCurrentResult] = useState<CreativeResult | null>(null);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [fullscreenView, setFullscreenView] = useState(false);

  // Session history for quick recall
  const [sessionHistory, setSessionHistory] = useState<CreativeResult[]>(() => {
    try {
      const saved = localStorage.getItem("premiers_auto_creations");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Save history helper
  const saveCreation = (item: CreativeResult) => {
    const updated = [item, ...sessionHistory.filter((h) => h.id !== item.id)].slice(0, 20);
    setSessionHistory(updated);
    try {
      localStorage.setItem("premiers_auto_creations", JSON.stringify(updated));
    } catch {
      // Storage quota safety
    }
  };

  /**
   * AUTOMATIC CREATIVE INTELLIGENCE PIPELINE
   * The user never selects fonts, backgrounds, colors, aspect ratio, or style.
   * PREMIERS AI decides everything autonomously from the user prompt.
   */
  const handleCreate = (overridePrompt?: string) => {
    const rawPrompt = (overridePrompt || prompt).trim();
    if (!rawPrompt || isGenerating) return;

    setIsGenerating(true);
    setGenerationStage("Understanding creative intent & context...");

    // Staged progression for smooth UX
    const t1 = setTimeout(() => {
      setGenerationStage("Synthesizing typography, lighting & color palette...");
    }, 280);

    const t2 = setTimeout(() => {
      setGenerationStage("Composing visual hierarchy & rendering high-resolution asset...");
    }, 550);

    setTimeout(() => {
      clearTimeout(t1);
      clearTimeout(t2);

      try {
        // STEP 1 & 2: Understand actual intent & identify visual category
        const parsedIntent = parseVisualIntent(rawPrompt);

        // STEP 3: Entity extraction
        const { category: detectedCat, industry, theme } = detectCategory(rawPrompt);
        const style = detectDesignStyle(rawPrompt, detectedCat);
        const typography = detectTypographyStyle(rawPrompt, style);
        const { brandName, initials } = extractAccurateBrandName(rawPrompt, detectedCat);
        const palette = extractColorPalette(rawPrompt, detectedCat, style);

        // STEP 4: Automatic design brief decisions
        const effectiveDesignType = parsedIntent ? parsedIntent.designType : "image";
        const isLogo = [
          "logo",
          "wordmark",
          "lettermark",
          "monogram",
          "emblem",
          "badge",
          "mascot",
          "app_icon",
          "favicon",
        ].includes(effectiveDesignType);

        // Determine aspect ratio, resolution and concept strategy automatically
        let aspectLabel = "1:1 Square";
        let resLabel = "1024 × 1024";
        let transparentBg = false;

        if (effectiveDesignType === "thumbnail") {
          aspectLabel = "16:9 Landscape";
          resLabel = "1280 × 720 (HD)";
        } else if (effectiveDesignType === "banner") {
          aspectLabel = "21:9 Widescreen";
          resLabel = "1200 × 450 (Ultra-Wide)";
        } else if (effectiveDesignType === "poster" || effectiveDesignType === "flyer") {
          aspectLabel = "4:5 Portrait";
          resLabel = "900 × 1200 (Poster)";
        } else if (effectiveDesignType === "social_post" || effectiveDesignType === "product_photo") {
          aspectLabel = "1:1 Social";
          resLabel = "1080 × 1080 (HD)";
        } else if (effectiveDesignType === "app_icon" || effectiveDesignType === "favicon") {
          transparentBg = false;
        }

        // Subtitle generation automatically matching brand personality
        let autoSubtitle = "PREMIUM BRAND IDENTITY";
        if (style === "gaming") {
          autoSubtitle = "OFFICIAL ESPORTS CREST";
        } else if (style === "luxury") {
          autoSubtitle = "HAUTE PARFUMERIE & LUXURY";
        } else if (effectiveDesignType === "thumbnail") {
          autoSubtitle = "AI REVOLUTION MASTERCLASS";
        } else if (effectiveDesignType === "poster") {
          autoSubtitle = "ARTISAN CULINARY EXPERIENCE";
        } else if (effectiveDesignType === "banner") {
          autoSubtitle = "NEXT-GENERATION ARTIFICIAL INTELLIGENCE";
        }

        // STEP 8: Generate procedural visual
        const generatedUrl = generateCreativeGraphic({
          title: brandName,
          subtitle: autoSubtitle,
          category: effectiveDesignType === "logo" ? "logo" : (effectiveDesignType as any),
          theme: (parsedIntent?.theme as any) || (theme as any),
          conceptId: parsedIntent?.selectedConceptId || "emblem",
          style,
          typography,
          initials,
          customPalette: palette as any,
          transparentBg,
        });

        // Generate vector SVG if logo
        let generatedSvg: string | undefined;
        if (isLogo) {
          try {
            generatedSvg = generateLogoSvg(
              brandName,
              initials,
              parsedIntent?.selectedConceptId || "emblem",
              palette,
              transparentBg,
              style
            );
          } catch {
            // SVG fallback
          }
        }

        const categoryHumanLabel = isLogo
          ? `${style.charAt(0).toUpperCase() + style.slice(1)} ${effectiveDesignType.toUpperCase()}`
          : effectiveDesignType === "thumbnail"
          ? "YouTube Thumbnail"
          : effectiveDesignType === "banner"
          ? "Website Hero Graphic"
          : effectiveDesignType === "product_photo"
          ? "Product Advertisement"
          : effectiveDesignType === "poster"
          ? "Design Poster"
          : effectiveDesignType === "character"
          ? "Character Concept Art"
          : "Creative Graphic";

        const newResult: CreativeResult = {
          id: "cr_" + Date.now(),
          url: generatedUrl,
          svgCode: generatedSvg,
          title: brandName,
          designType: effectiveDesignType,
          categoryLabel: categoryHumanLabel,
          aspectRatioLabel: aspectLabel,
          resolutionLabel: resLabel,
          userPrompt: rawPrompt,
          createdAt: Date.now(),
        };

        setCurrentResult(newResult);
        saveCreation(newResult);
      } catch (err) {
        console.error("Creative generation error:", err);
      } finally {
        setIsGenerating(false);
      }
    }, 750);
  };

  const handleCopySvg = () => {
    if (!currentResult?.svgCode) return;
    navigator.clipboard.writeText(currentResult.svgCode);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in-50 duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-[#26263b] bg-[#0c0c16] text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f33] bg-[#0f0f1c]/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4a0] to-[#00b8d4] flex items-center justify-center text-black font-extrabold shadow-sm">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  PREMIERS AI
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#00d4a0]/15 text-[#00d4a0] border border-[#00d4a0]/30">
                  Universal Creative Intelligence
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">
                Fully automatic creative generation — simply describe what you want
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1c1c2e] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 flex flex-col justify-center">
          {/* STATE 1: GENERATION IN PROGRESS */}
          {isGenerating && (
            <div className="py-14 sm:py-20 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in-50 duration-300">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-3 border-[#00d4a0]/20 animate-ping" />
                <div className="w-16 h-16 rounded-full border-3 border-[#00d4a0] border-t-transparent animate-spin" />
                <Sparkles className="w-6 h-6 text-[#00d4a0] absolute" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-bold text-white">PREMIERS AI Creative Engine</h3>
                <p className="text-sm text-[#00d4a0] font-medium animate-pulse">
                  {generationStage}
                </p>
                <p className="text-xs text-gray-500">
                  Automatically determining typography, color harmony, composition, and visual style.
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: EMPTY STATE / PROMPT INPUT */}
          {!isGenerating && !currentResult && (
            <div className="max-w-2xl w-full mx-auto space-y-6 py-4 sm:py-8">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18182a] border border-[#2b2b40] text-xs font-semibold text-gray-300 mb-2">
                  <Wand2 className="w-3.5 h-3.5 text-[#00d4a0]" />
                  <span>Autonomous Visual Synthesis</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  What would you like to create?
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
                  Logos, YouTube thumbnails, luxury advertisements, posters, or cinematic scenes.
                  No manual settings required — PREMIERS AI decides everything automatically.
                </p>
              </div>

              {/* Conversational Generation Input Card */}
              <div className="rounded-2xl border border-[#28283e] bg-[#12121f] p-3 sm:p-4 shadow-xl focus-within:border-[#00d4a0] transition-colors">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                  rows={3}
                  placeholder="Describe what you want to create... (e.g. 'Create a professional gaming logo for YASIR FF' or 'Make a YouTube thumbnail about AI revolution')"
                  className="w-full bg-transparent text-white text-sm sm:text-base placeholder-gray-500 resize-none focus:outline-none"
                />

                <div className="flex items-center justify-between pt-2 border-t border-[#1e1e30] mt-2">
                  <span className="text-[11px] text-gray-500 hidden sm:inline">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-[#1e1e30] text-gray-400 font-mono text-[10px]">Enter</kbd> to create
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCreate()}
                    disabled={!prompt.trim() || isGenerating}
                    className="ml-auto px-5 py-2.5 rounded-xl bg-[#00d4a0] hover:bg-[#00e8b0] text-black font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#00d4a0]/25 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Create</span>
                  </button>
                </div>
              </div>

              {/* Inspiration Prompts */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00d4a0]" />
                  <span>Try an example</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INSPIRATION_PROMPTS.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => {
                        setPrompt(ex);
                        handleCreate(ex);
                      }}
                      className="text-left px-3.5 py-2.5 rounded-xl border border-[#202034] bg-[#121220] hover:bg-[#18182b] hover:border-[#00d4a0]/40 text-xs text-gray-300 hover:text-white transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">{ex}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#00d4a0] shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: RESULT DISPLAY */}
          {!isGenerating && currentResult && (
            <div className="max-w-3xl w-full mx-auto space-y-5 animate-in fade-in-50 duration-300">
              {/* Asset Badge & Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#00d4a0]/15 text-[#00d4a0] border border-[#00d4a0]/30 text-xs font-bold">
                    {currentResult.categoryLabel}
                  </span>
                  <span className="text-xs text-gray-400">
                    {currentResult.resolutionLabel} • {currentResult.aspectRatioLabel}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentResult(null)}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>New Creation</span>
                </button>
              </div>

              {/* Artwork Container */}
              <div className="relative rounded-2xl overflow-hidden border border-[#2b2b40] bg-[#07070e] shadow-2xl flex items-center justify-center group min-h-[320px] max-h-[480px]">
                <img
                  src={currentResult.url}
                  alt={currentResult.title}
                  className="max-h-[460px] w-auto max-w-full object-contain select-none"
                />

                {/* Lightbox / Fullscreen trigger */}
                <button
                  type="button"
                  onClick={() => setFullscreenView(true)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/90 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                  title="View Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="text-xs text-gray-400 truncate max-w-xs">
                  Prompt: <span className="text-gray-200 font-medium">"{currentResult.userPrompt}"</span>
                </div>

                <div className="flex items-center gap-2">
                  {currentResult.svgCode && (
                    <button
                      type="button"
                      onClick={handleCopySvg}
                      className="px-3.5 py-2 rounded-xl border border-[#2a2a40] bg-[#141424] hover:bg-[#1c1c30] text-xs font-semibold text-gray-200 hover:text-white cursor-pointer flex items-center gap-1.5 transition-colors"
                      title="Copy vector SVG code"
                    >
                      {copiedSvg ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#00d4a0]" />
                          <span className="text-[#00d4a0]">Copied SVG</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                          <span>Copy SVG</span>
                        </>
                      )}
                    </button>
                  )}

                  {onSendToChat && (
                    <button
                      type="button"
                      onClick={() => {
                        onSendToChat(
                          `Here is the ${currentResult.categoryLabel.toLowerCase()} created for "${currentResult.title}":`,
                          currentResult.url
                        );
                        onClose();
                      }}
                      className="px-3.5 py-2 rounded-xl border border-[#2a2a40] bg-[#141424] hover:bg-[#1c1c30] text-xs font-semibold text-gray-200 hover:text-white cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Attach to Chat</span>
                    </button>
                  )}

                  <a
                    href={currentResult.url}
                    download={`premiers-${currentResult.designType}-${Date.now()}.png`}
                    className="px-4 py-2 rounded-xl bg-[#00d4a0] hover:bg-[#00e8b0] text-black text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#00d4a0]/25 cursor-pointer transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4 text-black" />
                    <span>Download PNG</span>
                  </a>
                </div>
              </div>

              {/* Conversational Iteration / Next Prompt Bar */}
              <div className="rounded-2xl border border-[#242438] bg-[#10101c] p-2.5 shadow-lg flex items-center gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                  placeholder="Describe an adjustment or create another visual..."
                  className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCreate()}
                  disabled={!prompt.trim() || isGenerating}
                  className="px-4 py-2 rounded-xl bg-[#00d4a0] hover:bg-[#00e8b0] text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#00d4a0]/20 cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span>Create</span>
                </button>
              </div>

              {/* Session History Strip */}
              {sessionHistory.length > 1 && (
                <div className="pt-2 border-t border-[#1c1c2e]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Recent Creations
                  </div>
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                    {sessionHistory.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setCurrentResult(item);
                          setPrompt(item.userPrompt);
                        }}
                        className={`w-14 h-14 rounded-xl overflow-hidden border shrink-0 transition-all cursor-pointer ${
                          currentResult.id === item.id
                            ? "border-[#00d4a0] ring-2 ring-[#00d4a0]/30"
                            : "border-[#252538] opacity-70 hover:opacity-100 hover:border-[#3a3a52]"
                        }`}
                        title={item.title}
                      >
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {fullscreenView && currentResult && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setFullscreenView(false)}
        >
          <button
            onClick={() => setFullscreenView(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={currentResult.url}
            alt={currentResult.title}
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
