import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Download,
  Layers,
  ShieldCheck,
  Palette,
  FileCode,
  Check,
  ChevronDown,
  ChevronUp,
  Maximize2,
  X,
} from "lucide-react";
import { VisualIntentResult, generateLogoSvg } from "../lib/visualIntentEngine";
import { generateCreativeGraphic } from "../lib/creativeGenerator";

interface BrandIdentityCardProps {
  intent: VisualIntentResult;
}

export function BrandIdentityCard({ intent }: BrandIdentityCardProps) {
  const [selectedConceptId, setSelectedConceptId] = useState<"emblem" | "monogram" | "combination" | "badge">("emblem");
  const [isTransparent, setIsTransparent] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [fullscreenModal, setFullscreenModal] = useState(false);

  // Generate real-time preview image based on active concept and transparency mode
  const activeImageUrl = useMemo(() => {
    return generateCreativeGraphic({
      title: intent.brandName,
      subtitle: intent.category === "gaming" ? "OFFICIAL ESPORTS BRAND IDENTITY" : "PREMIUM BRAND IDENTITY",
      category: "logo",
      theme: intent.theme as any,
      conceptId: selectedConceptId,
      initials: intent.initials,
      customPalette: intent.palette as any,
      transparentBg: isTransparent,
      width: 1024,
      height: 1024,
    });
  }, [intent, selectedConceptId, isTransparent]);

  // Generate SVG code
  const activeSvgCode = useMemo(() => {
    return generateLogoSvg(
      intent.brandName,
      intent.initials,
      intent.category,
      intent.palette,
      isTransparent
    );
  }, [intent, selectedConceptId, isTransparent]);

  // Active concept details
  const activeConcept = intent.concepts.find((c) => c.id === selectedConceptId) || intent.concepts[0];

  const handleCopySvg = () => {
    navigator.clipboard.writeText(activeSvgCode);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
  };

  const handleDownloadPng = (transparentOnly = false) => {
    const url = transparentOnly
      ? generateCreativeGraphic({
          title: intent.brandName,
          subtitle: intent.category === "gaming" ? "OFFICIAL ESPORTS BRAND IDENTITY" : "PREMIUM BRAND IDENTITY",
          category: "logo",
          theme: intent.theme as any,
          conceptId: selectedConceptId,
          initials: intent.initials,
          customPalette: intent.palette as any,
          transparentBg: true,
          width: 1024,
          height: 1024,
        })
      : activeImageUrl;

    const link = document.createElement("a");
    link.href = url;
    link.download = `${intent.brandName.toLowerCase().replace(/\s+/g, "-")}-${selectedConceptId}${transparentOnly ? "-transparent" : ""}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([activeSvgCode], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${intent.brandName.toLowerCase().replace(/\s+/g, "-")}-${selectedConceptId}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4 rounded-2xl border border-[#2d2d42] bg-[#0c0c16] overflow-hidden shadow-2xl transition-all duration-300">
      {/* Top Header Bar */}
      <div className="px-4 py-3 bg-[#131322] border-b border-[#26263b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00d4a0] to-[#00b8d4] flex items-center justify-center text-black font-extrabold text-xs shadow-md shadow-[#00d4a0]/25">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white tracking-wide">{intent.brandName}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00d4a0]/15 text-[#00d4a0] border border-[#00d4a0]/30">
                {intent.category.toUpperCase()} IDENTITY
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Professional Brand Intelligence Engine</p>
          </div>
        </div>

        {/* Background Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-[#1a1a2b] p-1 rounded-xl border border-[#2e2e46] text-xs">
          <button
            type="button"
            onClick={() => setIsTransparent(false)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              !isTransparent
                ? "bg-[#00d4a0] text-black shadow-sm font-bold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🌙 Studio Dark
          </button>
          <button
            type="button"
            onClick={() => setIsTransparent(true)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              isTransparent
                ? "bg-[#00d4a0] text-black shadow-sm font-bold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            ✨ Transparent PNG
          </button>
        </div>
      </div>

      {/* Concept Switcher Tabs */}
      <div className="px-4 py-2 bg-[#0e0e1a] border-b border-[#222236] flex items-center gap-2 overflow-x-auto card-scroll">
        <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 shrink-0 mr-1">
          <Layers className="w-3.5 h-3.5 text-[#00d4a0]" /> Concepts:
        </span>
        {intent.concepts.map((concept) => {
          const isActive = selectedConceptId === concept.id;
          return (
            <button
              key={concept.id}
              type="button"
              onClick={() => setSelectedConceptId(concept.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-gradient-to-r from-[#00d4a0] to-[#00b8d4] text-black shadow-md shadow-[#00d4a0]/25"
                  : "bg-[#181828] text-gray-300 hover:text-white hover:bg-[#222238] border border-[#2b2b40]"
              }`}
            >
              <span>{concept.badgeLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Main Preview Area */}
      <div className="p-4 sm:p-6 flex flex-col md:flex-row items-center gap-6">
        {/* Render Canvas / Image Display */}
        <div className="relative group w-full md:w-80 max-w-[340px] aspect-square rounded-2xl overflow-hidden border border-[#2a2a40] shadow-2xl flex items-center justify-center shrink-0">
          {/* Transparency grid backdrop when in transparent mode */}
          {isTransparent && (
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)`,
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
              }}
            />
          )}

          <img
            src={activeImageUrl}
            alt={`${intent.brandName} Logo Concept`}
            className="w-full h-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
          />

          {/* Quick Enlarge Button */}
          <button
            type="button"
            onClick={() => setFullscreenModal(true)}
            className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            title="View Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {isTransparent && (
            <div className="absolute bottom-2.5 left-2.5 z-20 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-[#00d4a0] border border-[#00d4a0]/30">
              Transparent Asset
            </div>
          )}
        </div>

        {/* Concept Analysis & Actions */}
        <div className="flex-1 w-full space-y-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{activeConcept.title}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1e1e30] text-gray-300 border border-[#303048]">
                {activeConcept.badgeLabel}
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">{activeConcept.description}</p>
          </div>

          {/* Specifications Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-300 bg-[#121220] p-3 rounded-xl border border-[#222236]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00d4a0] shrink-0" />
              <span>
                <strong className="text-white">Brand Name:</strong> {intent.brandName}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00d4a0] shrink-0" />
              <span>
                <strong className="text-white">Monogram:</strong> {intent.initials}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00d4a0] shrink-0" />
              <span>
                <strong className="text-white">Silhouette:</strong> 100% Optical Balance
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00d4a0] shrink-0" />
              <span>
                <strong className="text-white">Profile Ready:</strong> Discord, YT, Steam
              </span>
            </div>
          </div>

          {/* Color Swatches */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-[#00d4a0]" /> Palette:
            </span>
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                style={{ backgroundColor: intent.palette.primary }}
                title={`Primary: ${intent.palette.primary}`}
              />
              <div
                className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                style={{ backgroundColor: intent.palette.accent }}
                title={`Accent: ${intent.palette.accent}`}
              />
              <div
                className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                style={{ backgroundColor: intent.palette.bg1 }}
                title={`Dark Base: ${intent.palette.bg1}`}
              />
              <span className="text-[11px] text-gray-300 font-medium ml-1">{intent.palette.name}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownloadPng(false)}
              className="px-3.5 py-2 rounded-xl bg-[#00d4a0] hover:bg-[#00e8b0] text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-[#00d4a0]/25 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadPng(true)}
              className="px-3 py-2 rounded-xl bg-[#1b1b2c] hover:bg-[#25253c] text-white font-bold text-xs flex items-center gap-1.5 border border-[#303048] cursor-pointer transition-all active:scale-95"
              title="Download clean transparent background PNG"
            >
              <Download className="w-3.5 h-3.5 text-[#00d4a0]" />
              <span>Transparent PNG</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSvg}
              className="px-3 py-2 rounded-xl bg-[#1b1b2c] hover:bg-[#25253c] text-white font-bold text-xs flex items-center gap-1.5 border border-[#303048] cursor-pointer transition-all active:scale-95"
              title="Download scalable SVG vector file"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Vector SVG</span>
            </button>

            <button
              type="button"
              onClick={handleCopySvg}
              className="px-2.5 py-2 rounded-xl bg-[#1b1b2c] hover:bg-[#25253c] text-gray-300 hover:text-white text-xs flex items-center gap-1 border border-[#303048] cursor-pointer transition-all"
              title="Copy raw SVG markup"
            >
              {copiedSvg ? <Check className="w-3.5 h-3.5 text-green-400" /> : <FileCode className="w-3.5 h-3.5" />}
              <span>{copiedSvg ? "Copied" : "Copy SVG"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mini Brand Brief Accordion */}
      <div className="border-t border-[#222236] bg-[#090912]">
        <button
          type="button"
          onClick={() => setBriefOpen(!briefOpen)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#121220] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00d4a0]" />
            <span>Mini Brand Brief & Identity Strategy ({intent.brandName})</span>
          </div>
          {briefOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {briefOpen && (
          <div className="p-4 border-t border-[#1d1d2e] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300 animate-in fade-in duration-200">
            <div className="space-y-1">
              <span className="text-gray-400 font-bold block text-[11px] uppercase">Symbolism & Concept:</span>
              <p className="leading-relaxed text-gray-200">{intent.brief.symbolism}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-bold block text-[11px] uppercase">Typography Direction:</span>
              <p className="leading-relaxed text-gray-200">{intent.brief.typographyDirection}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-bold block text-[11px] uppercase">Brand Personality:</span>
              <p className="leading-relaxed text-gray-200">{intent.brief.brandPersonality}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-bold block text-[11px] uppercase">Scalability & Context:</span>
              <p className="leading-relaxed text-gray-200">{intent.brief.scalability}</p>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal View */}
      {fullscreenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200">
          <div className="relative max-w-2xl w-full bg-[#10101c] rounded-3xl border border-[#2d2d44] p-6 shadow-2xl flex flex-col items-center">
            <button
              type="button"
              onClick={() => setFullscreenModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-white mb-4 tracking-wide">{intent.brandName} — {activeConcept.title}</h3>
            <div className="w-full max-w-md aspect-square rounded-2xl overflow-hidden border border-[#2e2e44] bg-[#07070d] p-3 shadow-inner">
              <img src={activeImageUrl} alt="Fullscreen Logo Asset" className="w-full h-full object-contain" />
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => handleDownloadPng(false)}
                className="px-4 py-2 rounded-xl bg-[#00d4a0] text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#00d4a0]/30"
              >
                <Download className="w-4 h-4" /> Download PNG (High-Res)
              </button>
              <button
                type="button"
                onClick={() => handleDownloadPng(true)}
                className="px-4 py-2 rounded-xl bg-[#1f1f33] text-white font-bold text-xs flex items-center gap-1.5 border border-[#33334d] cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#00d4a0]" /> Transparent PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
