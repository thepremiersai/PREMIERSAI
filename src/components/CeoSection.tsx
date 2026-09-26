import { Linkedin, Twitter, Github, Award, Sparkles, CheckCircle2, Code2, ArrowDown } from "lucide-react";

/**
 * Image configuration for PREMIERS AI Founders.
 * If/when real photograph files are added to the project (e.g. in /public/founders/),
 * simply set the path strings below (e.g. "/founders/hasaan-abid.jpg").
 */
export const FOUNDER_IMAGES = {
  ceo: null as string | null,
  coo: null as string | null,
};

export function CeoSection() {
  return (
    <section id="founders" className="py-16 md:py-24 border-t border-[#1e1e2e] relative scroll-mt-12">
      {/* Anchor alias so #ceo continues to work */}
      <span id="ceo" className="absolute -top-12 opacity-0 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#00d4a0] mb-2 flex items-center justify-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>Leadership & Vision</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Meet the <span className="text-[#00d4a0]">Founders</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mt-3">
            The visionary executive and technical leadership driving the digital innovation of PREMIERS AI.
          </p>
        </div>

        <div className="flex flex-col gap-6 w-full">
          {/* ==================================================
              FOUNDER 1 — CEO (Primary / Highlighted Founder)
              ================================================== */}
          <div className="rounded-3xl border border-[#00d4a0]/30 bg-gradient-to-b from-[#141420] to-[#0f0f18] p-6 sm:p-10 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-[#00d4a0]/50">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#00d4a0]/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 text-center lg:text-left">
              {/* Avatar & Visual Frame with replaceable image support */}
              <div className="relative shrink-0">
                {FOUNDER_IMAGES.ceo ? (
                  <img
                    src={FOUNDER_IMAGES.ceo}
                    alt="Syed Muhammad Yasir Abbas Zaidi - CEO & Founder"
                    referrerPolicy="no-referrer"
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover shadow-xl shadow-[#00d4a0]/25 ring-4 ring-[#00d4a0]/20"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#00d4a0] via-[#00b8d4] to-[#2563eb] flex items-center justify-center text-white text-5xl sm:text-6xl font-extrabold shadow-xl shadow-[#00d4a0]/25 ring-4 ring-[#00d4a0]/20 select-none">
                    Y
                  </div>
                )}
                <div className="absolute bottom-1 right-1 p-2 rounded-full bg-[#0a0a0f] border border-[#00d4a0] text-[#00d4a0] shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="inline-block px-3 py-1 rounded-full bg-[#00d4a0]/15 text-[#00d4a0] text-xs font-bold tracking-wide uppercase mb-2">
                  CEO & Founder — PREMIERS
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
                  Syed Muhammad Yasir Abbas Zaidi
                </h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                  Syed Muhammad Yasir Abbas Zaidi is the CEO and creator of PREMIERS, bringing dedicated expertise in full-stack web development, video editing, creative design, and AI-powered digital solutions. His core mission is to bring powerful, modern, accessible, and multilingual technology together in one universal platform.
                </p>

                {/* Founder Pillars & Skills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 text-left">
                  <div className="p-2.5 rounded-xl bg-[#1a1a28] border border-[#2b2b3e] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00d4a0] shrink-0" />
                    <span className="text-xs font-semibold text-gray-200">Web Development</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#1a1a28] border border-[#2b2b3e] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00b8d4] shrink-0" />
                    <span className="text-xs font-semibold text-gray-200">AI Architectures</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#1a1a28] border border-[#2b2b3e] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-semibold text-gray-200">Creative Design</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#1a1a28] border border-[#2b2b3e] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-xs font-semibold text-gray-200">Video & Graphics</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl border border-[#2b2b3e] bg-[#1a1a28] flex items-center justify-center text-gray-300 hover:text-[#00d4a0] hover:border-[#00d4a0]/50 transition-all cursor-pointer"
                    title="LinkedIn"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl border border-[#2b2b3e] bg-[#1a1a28] flex items-center justify-center text-gray-300 hover:text-[#00d4a0] hover:border-[#00d4a0]/50 transition-all cursor-pointer"
                    title="Twitter / X"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl border border-[#2b2b3e] bg-[#1a1a28] flex items-center justify-center text-gray-300 hover:text-[#00d4a0] hover:border-[#00d4a0]/50 transition-all cursor-pointer"
                    title="GitHub"
                    aria-label="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <span className="text-xs text-gray-400 pl-2">syasirabbas1214@gmail.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              VERTICAL FLOW INDICATOR
              ================================================== */}
          <div className="flex items-center justify-center -my-1" aria-hidden="true">
            <div className="flex items-center gap-3">
              <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent to-[#00d4a0]/30" />
              <div className="w-8 h-8 rounded-full border border-[#2b2b3e] bg-[#141420] flex items-center justify-center text-[#00d4a0] shadow-md shadow-[#00d4a0]/10">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>
              <div className="w-16 sm:w-24 h-px bg-gradient-to-l from-transparent to-[#00b8d4]/30" />
            </div>
          </div>

          {/* ==================================================
              FOUNDER 2 — COO (Hasaan Abdullah Abid)
              ================================================== */}
          <div className="rounded-3xl border border-[#26263a] bg-gradient-to-b from-[#141420] to-[#0f0f18] p-6 sm:p-10 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-[#00b8d4]/40">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#00b8d4]/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 text-center lg:text-left">
              {/* Avatar & Visual Frame with clean placeholder & easy image replacement */}
              <div className="relative shrink-0">
                {FOUNDER_IMAGES.coo ? (
                  <img
                    src={FOUNDER_IMAGES.coo}
                    alt="Hasaan Abdullah Abid - COO & Co-Founder"
                    referrerPolicy="no-referrer"
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover shadow-xl shadow-[#00b8d4]/25 ring-4 ring-[#00b8d4]/20"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#00b8d4] via-[#2563eb] to-[#7c3aed] flex items-center justify-center text-white text-4xl sm:text-5xl font-extrabold shadow-xl shadow-[#00b8d4]/25 ring-4 ring-[#00b8d4]/20 select-none tracking-tight">
                    HA
                  </div>
                )}
                <div className="absolute bottom-1 right-1 p-2 rounded-full bg-[#0a0a0f] border border-[#00b8d4] text-[#00b8d4] shadow-md">
                  <Code2 className="w-4 h-4" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="inline-block px-3 py-1 rounded-full bg-[#00b8d4]/15 text-[#00b8d4] text-xs font-bold tracking-wide uppercase mb-2">
                  COO & Co-Founder — PREMIERS AI
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
                  Hasaan Abdullah Abid
                </h3>
                
                {/* Short Professional Bio */}
                <p className="text-[#00b8d4] text-xs sm:text-sm font-medium mb-3">
                  Web Developer & Technology Professional focused on modern web development, digital solutions, product development, and the technical growth of PREMIERS AI.
                </p>

                {/* Full Professional Description */}
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                  Hasaan Abdullah Abid is a Web Developer and technology professional who contributes to the development, digital infrastructure, and technical growth of PREMIERS AI. As COO & Co-Founder, he works alongside the leadership team to support product development, operational execution, and the continuous improvement of the platform. His focus on modern web technologies, practical problem-solving, and scalable digital solutions helps transform ideas into reliable and user-focused experiences.
                </p>

                {/* Technical & Operational Focus Pillars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 text-left">
                  <div className="p-2.5 rounded-xl bg-[#1a1a28] border border-[#2b2b3e] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00b8d4] shrink-0" />
                    <span className="text-xs font-semibold text-gray-200">Web Development</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#1a1a28] border border-[#2b2b3e] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00d4a0] shrink-0" />
                    <span className="text-xs font-semibold text-gray-200">Digital Infrastructure</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#1a1a28] border border-[#2b2b3e] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0" />
                    <span className="text-xs font-semibold text-gray-200">Product Development</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#1a1a28] border border-[#2b2b3e] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#818cf8] shrink-0" />
                    <span className="text-xs font-semibold text-gray-200">Operational Execution</span>
                  </div>
                </div>

                {/* Professional Links */}
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl border border-[#2b2b3e] bg-[#1a1a28] flex items-center justify-center text-gray-300 hover:text-[#00b8d4] hover:border-[#00b8d4]/50 transition-all cursor-pointer"
                    title="LinkedIn"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl border border-[#2b2b3e] bg-[#1a1a28] flex items-center justify-center text-gray-300 hover:text-[#00b8d4] hover:border-[#00b8d4]/50 transition-all cursor-pointer"
                    title="GitHub"
                    aria-label="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <span className="text-xs text-gray-400 pl-2">Executive & Operations • PREMIERS AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Export FoundersSection alias for convenience
export const FoundersSection = CeoSection;

