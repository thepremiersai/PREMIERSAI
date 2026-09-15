import { Cpu, Languages, Eye, Palette, Layers, Compass } from "lucide-react";

export function AboutSection() {
  const pillars = [
    {
      icon: <Languages className="w-6 h-6 text-[#00d4a0]" />,
      title: "Truly Global Multilingual Architecture",
      desc: "Designed from the foundation to speak, comprehend, and reason in world languages. Whether in Urdu, Roman Urdu, Arabic, Persian, Hindi, Chinese, or European tongues, PREMIERS AI eliminates linguistic barriers.",
    },
    {
      icon: <Eye className="w-6 h-6 text-[#00b8d4]" />,
      title: "Multimodal Vision Intelligence",
      desc: "Inspect diagrams, screenshots, graphs, documents, and illustrations. Extract embedded text, critique aesthetics, and troubleshoot technical architectures seamlessly.",
    },
    {
      icon: <Palette className="w-6 h-6 text-amber-400" />,
      title: "Studio-Grade Creative Suite",
      desc: "From minimalist business logos to YouTube thumbnails, promotional banners, and social assets, generate production-ready visual concepts with one prompt.",
    },
    {
      icon: <Cpu className="w-6 h-6 text-purple-400" />,
      title: "Full-Stack Engineering & Code",
      desc: "Develop full-stack web applications, write secure backend services, debug tricky concurrency bugs, and architect databases across any modern tech stack.",
    },
    {
      icon: <Layers className="w-6 h-6 text-pink-400" />,
      title: "Universal Card Scrolling & Fluid Layout",
      desc: "Zero clipping, zero horizontal overflow. Every card, table, modal, and AI bubble is engineered with mathematical padding and responsive scroll bounds for all screens.",
    },
    {
      icon: <Compass className="w-6 h-6 text-emerald-400" />,
      title: "Seamless Context Preservation",
      desc: "Switch from English to Urdu, or from French to Roman Urdu inside the exact same chat without losing your task context, project specifications, or chat history.",
    },
  ];

  return (
    <section id="about" className="py-16 md:py-24 border-t border-[#1e1e2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-wider text-[#00d4a0] mb-2">
            The Mission
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            About <span className="text-[#00d4a0]">PREMIERS AI</span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            PREMIERS AI is a next-generation universal intelligence platform that merges real-time multilingual conversation, creative generative studios, computer vision analysis, and practical automation into a singular, cohesive experience. No mode switching — simply express your thought in any language.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-[#242436] bg-[#12121c] hover:border-[#00d4a0]/40 transition-all duration-300 hover:-translate-y-1 shadow-sm flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1a1a28] flex items-center justify-center mb-4 border border-[#2b2b3e]">
                {pillar.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed flex-1">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
