import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Terminal, Code2 } from "lucide-react";
import { isTextRTL } from "../lib/languages";

interface MarkdownRendererProps {
  content: string;
  isRTL?: boolean;
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function CodeBlock({ inline, className, children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeString = String(children || "").replace(/\n$/, "");

  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#1f1f2e] text-[#00d4a0] font-mono text-[13px] border border-[#2e2e42]"
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
    }
  };

  return (
    <div className="my-3 rounded-xl border border-[#2b2b3e] bg-[#0c0c14] overflow-hidden text-left" dir="ltr">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#161622] border-b border-[#252536] text-xs text-gray-400 select-none">
        <div className="flex items-center gap-2 font-mono">
          <Code2 className="w-3.5 h-3.5 text-[#00d4a0]" />
          <span className="font-semibold text-gray-300 uppercase tracking-wider text-[11px]">
            {language || "code"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#222234] hover:bg-[#2e2e46] text-gray-300 hover:text-white transition-all text-[11px] font-medium cursor-pointer"
          title="Copy code to clipboard"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#00d4a0]" />
              <span className="text-[#00d4a0]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content Body */}
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-[#e4e4ed] leading-relaxed selection:bg-[#00d4a0]/30">
        <code>{codeString}</code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ content, isRTL }: MarkdownRendererProps) {
  const rtl = isRTL ?? isTextRTL(content);

  return (
    <div
      className={`markdown-body space-y-2.5 text-sm sm:text-base leading-relaxed break-words max-w-full ${
        rtl ? "font-urdu text-right text-base sm:text-lg leading-loose" : "text-left"
      }`}
      dir={rtl ? "rtl" : "ltr"}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock as any,
          p: ({ children }) => <p className="mb-2.5 last:mb-0 text-[#e4e4ee]">{children}</p>,
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-4 mb-2 pb-1 border-b border-[#2b2b3e]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-bold text-white mt-3.5 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-semibold text-[#00d4a0] mt-3 mb-1.5">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className={`my-2 space-y-1 text-[#d8d8e6] ${rtl ? "list-inside list-disc mr-2" : "list-inside list-disc ml-2"}`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`my-2 space-y-1 text-[#d8d8e6] ${rtl ? "list-inside list-decimal mr-2" : "list-inside list-decimal ml-2"}`}>
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote
              className={`my-3 pl-3 pr-2 py-1 rounded-r-lg border-l-3 border-[#00d4a0] bg-[#12121e] text-gray-300 italic text-sm ${
                rtl ? "border-l-0 border-r-3 pl-2 pr-3 rounded-l-lg rounded-r-none" : ""
              }`}
            >
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-[#2b2b3e]">
              <table className="min-w-full text-xs sm:text-sm text-left border-collapse" dir="ltr">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[#181826] text-white border-b border-[#2b2b3e]">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-[#222232] bg-[#0f0f18]">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-[#151522] transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-3.5 py-2.5 font-semibold text-gray-200">{children}</th>,
          td: ({ children }) => <td className="px-3.5 py-2 text-gray-300">{children}</td>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00d4a0] hover:text-[#00f0b5] underline underline-offset-2 transition-colors cursor-pointer"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
          hr: () => <hr className="my-4 border-[#28283a]" />,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
