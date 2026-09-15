import { Linkedin, Twitter, Github, Award, Sparkles, CheckCircle2 } from "lucide-react";

export function CeoSection() {
  return (
    <section id="ceo" className="py-16 md:py-24 border-t border-[#1e1e2e]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#00d4a0] mb-2 flex items-center justify-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>Leadership & Vision</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Meet the <span className="text-[#00d4a0]">Founder</span>
          </h2>
        </div>

        <div className="rounded-3xl border border-[#26263a] bg-gradient-to-b from-[#141420] to-[#0f0f18] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00d4a0]/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 text-center lg:text-left">
            {/* Avatar & Visual Frame */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#00d4a0] via-[#00b8d4] to-[#2563eb] flex items-center justify-center text-white text-5xl sm:text-6xl font-extrabold shadow-xl shadow-[#00d4a0]/25 ring-4 ring-[#00d4a0]/20">
                Y
              </div>
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
      </div>
    </section>
  );
}
