import React, { useState, useRef, useEffect, FormEvent, MouseEvent, ChangeEvent } from "react";
import { User, Message, ChatSession, Attachment, PlanId } from "../types";
import { SUPPORTED_LANGUAGES, isTextRTL } from "../lib/languages";
import { generateCreativeGraphic, GraphicOptions } from "../lib/creativeGenerator";
import { detectCreativeIntent, detectWebsiteIntent } from "../lib/promptSenseEngine";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ImageAiStudioModal } from "./ImageAiStudioModal";
import {
  Send,
  Paperclip,
  X,
  Plus,
  Pin,
  PinOff,
  Trash2,
  Globe,
  Download,
  ExternalLink,
  MessageSquare,
  Search,
  Sparkles,
  Code2,
  Play,
  RefreshCw,
  LogOut,
  ArrowLeft,
  ShoppingBag,
  ShieldAlert,
  Copy,
  Check,
  RotateCcw,
  Square,
  Edit2,
  ChevronDown,
  Wand2,
  AlertCircle,
  Terminal,
  Smartphone,
  Tablet,
  Monitor,
} from "lucide-react";

function WebsiteSandboxCard({ html }: { html: string }) {
  const [activeTab, setActiveTab] = useState<"preview" | "terminal" | "code">("terminal");
  const [copied, setCopied] = useState(false);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [iframeKey, setIframeKey] = useState(0);
  const [displayedCode, setDisplayedCode] = useState("");
  const [isCompiling, setIsCompiling] = useState(true);
  const [buildStep, setBuildStep] = useState(0);

  // Live code streaming simulation on generation
  useEffect(() => {
    let charIndex = 0;
    const streamSpeed = 120; // characters per tick
    const totalLength = Math.min(html.length, 3200);

    const timer = setInterval(() => {
      charIndex += streamSpeed;
      if (charIndex >= totalLength) {
        setDisplayedCode(html);
        setIsCompiling(false);
        setBuildStep(4);
        clearInterval(timer);
      } else {
        setDisplayedCode(html.slice(0, charIndex));
        if (charIndex > totalLength * 0.75) setBuildStep(3);
        else if (charIndex > totalLength * 0.5) setBuildStep(2);
        else if (charIndex > totalLength * 0.25) setBuildStep(1);
      }
    }, 35);

    return () => clearInterval(timer);
  }, [html]);

  const handleCopy = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInNewTab = () => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="mt-4 rounded-2xl border border-[#28283c] bg-[#0c0c14] overflow-hidden shadow-2xl">
      {/* Top Bar with Tabs and Controls */}
      <div className="px-3 py-2.5 bg-[#141420] border-b border-[#28283c] flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-[#00d4a0] text-black shadow-md shadow-[#00d4a0]/25 btn-shimmer-neon"
                : "text-gray-400 hover:text-white hover:bg-[#202030]"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>⚡ Live App</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("terminal")}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "terminal"
                ? "bg-[#00d4a0] text-black shadow-md shadow-[#00d4a0]/25 btn-shimmer-neon"
                : "text-gray-400 hover:text-white hover:bg-[#202030]"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>🚀 Live Code Stream {isCompiling && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "code"
                ? "bg-[#00d4a0] text-black shadow-md shadow-[#00d4a0]/25 btn-shimmer-neon"
                : "text-gray-400 hover:text-white hover:bg-[#202030]"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>💻 Full Source</span>
          </button>
        </div>

        {/* Viewport Devices & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === "preview" && (
            <div className="flex items-center bg-[#1c1c2b] p-0.5 rounded-lg border border-[#2b2b40]">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={`p-1.5 rounded-md transition ${device === "desktop" ? "bg-[#00d4a0] text-black font-bold" : "text-gray-400 hover:text-white"}`}
                title="Desktop View (100%)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("tablet")}
                className={`p-1.5 rounded-md transition ${device === "tablet" ? "bg-[#00d4a0] text-black font-bold" : "text-gray-400 hover:text-white"}`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                className={`p-1.5 rounded-md transition ${device === "mobile" ? "bg-[#00d4a0] text-black font-bold" : "text-gray-400 hover:text-white"}`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {activeTab === "preview" && (
            <button
              type="button"
              onClick={handleReload}
              className="p-1.5 rounded-lg bg-[#202032] hover:bg-[#2a2a44] text-gray-300 hover:text-white transition cursor-pointer"
              title="Reload sandbox session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded-lg bg-[#202032] hover:bg-[#2a2a44] text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95 btn-glow-pulse"
            title="Copy entire website source code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#00d4a0]" />
                <span className="text-[#00d4a0]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenInNewTab}
            className="px-2.5 py-1.5 rounded-lg bg-[#00d4a0]/15 hover:bg-[#00d4a0]/25 text-[#00d4a0] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer btn-glow-pulse active:scale-95"
            title="Open in a standalone browser tab"
          >
            <span>Open New Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "terminal" ? (
        <div className="p-4 bg-[#07070c] font-mono text-xs text-gray-300 leading-relaxed max-h-[520px] overflow-y-auto card-scroll">
          {/* Real-time Compiler Console */}
          <div className="mb-3 pb-3 border-b border-[#1f1f33] flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>PREMIERS AI WebEngine v4.2 • Live Coding Stream</span>
            </div>
            <span className="text-[11px] text-gray-500">HTML5 • CSS3 • Tailwind • Vanilla JS</span>
          </div>

          <div className="space-y-1 mb-4 text-[11px]">
            <div className="text-gray-400">[INIT] Synthesizing high-performance client architecture...</div>
            {buildStep >= 1 && <div className="text-cyan-400">[STEP 1/4] Constructing semantic HTML hierarchy & responsive viewports...</div>}
            {buildStep >= 2 && <div className="text-amber-400">[STEP 2/4] Injecting Tailwind CSS layouts, glassmorphic cards & typography...</div>}
            {buildStep >= 3 && <div className="text-purple-400">[STEP 3/4] Wiring interactive event handlers, modals, search filters & cart mechanics...</div>}
            {buildStep >= 4 && <div className="text-emerald-400 font-bold">[READY] Interactive sandbox execution complete! Click "Live App" tab to explore.</div>}
          </div>

          {/* Streaming code display */}
          <div className="rounded-xl bg-[#030307] p-3 border border-[#1a1a2b] relative">
            <pre className="whitespace-pre-wrap break-all text-emerald-400/90 font-mono text-[11px] max-h-72 overflow-y-auto card-scroll">
              <code>{displayedCode}</code>
              {isCompiling && <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-0.5 align-middle" />}
            </pre>
          </div>

          <div className="mt-3 flex justify-between items-center text-[11px] text-gray-500">
            <span>Streaming {displayedCode.length.toLocaleString()} / {html.length.toLocaleString()} chars</span>
            <button
              onClick={() => setActiveTab("preview")}
              className="px-3 py-1 rounded-lg bg-[#00d4a0] hover:bg-[#00f0b5] text-black font-bold text-xs transition cursor-pointer btn-shimmer-neon"
            >
              Switch to Live Interactive App →
            </button>
          </div>
        </div>
      ) : activeTab === "preview" ? (
        <div className="bg-[#101018] p-2 flex justify-center items-center min-h-[520px]">
          <div
            className={`w-full transition-all duration-300 ${
              device === "mobile"
                ? "max-w-[375px] rounded-3xl border-4 border-zinc-700 shadow-2xl overflow-hidden"
                : device === "tablet"
                ? "max-w-[768px] rounded-2xl border-4 border-zinc-700 shadow-2xl overflow-hidden"
                : "w-full"
            }`}
          >
            <iframe
              key={iframeKey}
              srcDoc={html}
              title="Interactive Web Sandbox"
              className="w-full h-[540px] border-none bg-white"
              sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
            />
          </div>
        </div>
      ) : (
        <div className="relative max-h-[540px] overflow-y-auto p-4 bg-[#09090f] font-mono text-xs text-gray-300 leading-relaxed card-scroll">
          <div className="flex justify-between items-center pb-2 mb-2 border-b border-[#1c1c2b] text-[11px] text-gray-500">
            <span>HTML5 • Tailwind CSS • Vanilla JavaScript</span>
            <span>{html.length.toLocaleString()} characters</span>
          </div>
          <pre className="whitespace-pre-wrap break-all text-[#34d399] font-mono selection:bg-[#00d4a0]/30 selection:text-white">
            <code>{html}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

interface ChatDashboardProps {
  user: User;
  onLogout: () => void;
  onBackToHome: () => void;
  userPlan: PlanId;
  onUpgradeClick: () => void;
  onOpenWorkspace?: () => void;
  onOpenAdmin?: () => void;
}

export function ChatDashboard({
  user,
  onLogout,
  onBackToHome,
  userPlan,
  onUpgradeClick,
  onOpenWorkspace,
  onOpenAdmin,
}: ChatDashboardProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchHistoryQuery, setSearchHistoryQuery] = useState("");

  // Inline renaming state
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Target reply language selector: "auto" or specific code
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [langPickerOpen, setLangPickerOpen] = useState(false);

  // Input & attachments
  const [inputText, setInputText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Modals & UI states
  const [imageStudioOpen, setImageStudioOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load chats on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("premiers_chats_data");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.sessions && parsed.sessions.length > 0) {
          setSessions(parsed.sessions);
          setActiveSessionId(parsed.sessions[0].id);
          setMessagesMap(parsed.messagesMap || {});
          return;
        }
      }
    } catch (e) {
      console.warn("Storage load issue, bootstrapping fresh session:", e);
    }

    // Default first session
    const defaultId = "chat_" + Date.now();
    const defaultSession: ChatSession = {
      id: defaultId,
      title: "Welcome to PREMIERS AI",
      pinned: true,
      createdAt: Date.now(),
    };
    setSessions([defaultSession]);
    setActiveSessionId(defaultId);
    setMessagesMap({
      [defaultId]: [
        {
          id: "msg_welcome",
          role: "assistant",
          content: `👋 **Welcome to PREMIERS AI!**\n\nI am your universal multilingual AI assistant. You can speak to me in **English**, **Urdu (اردو)**, **Roman Urdu**, **Arabic (العربية)**, **Persian**, **Hindi**, **French**, **Spanish**, **Chinese**, or any other world language.\n\n* **Try asking:** *"Mujhe ek technology company ke liye modern logo ka concept do"* or *"مصنوعی ذہانت کے اہم فوائد کیا ہیں؟"*\n* **Upload an image or document** using the 📎 paperclip button for visual vision inspection.\n* Ask for **logos, YouTube thumbnails, posters, code, or marketing plans** in any language.\n* Use the **Image AI Studio** (top bar) to design and enhance graphics with one click!`,
          timestamp: Date.now(),
          detectedLanguage: "English & Multilingual",
          isRTL: false,
        },
      ],
    });
  }, []);

  // Save chats when updated
  const saveChatsToStorage = (updatedSessions: ChatSession[], updatedMessages: Record<string, Message[]>) => {
    try {
      localStorage.setItem(
        "premiers_chats_data",
        JSON.stringify({
          sessions: updatedSessions,
          messagesMap: updatedMessages,
        })
      );
    } catch (e) {
      console.error("Failed to save chats", e);
    }
  };

  // Track scroll position to show/hide "scroll to bottom" button
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isUp);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom on new message if not scrolled way up
  useEffect(() => {
    scrollToBottom();
  }, [messagesMap, activeSessionId, isAiThinking]);

  // Current session messages
  const currentMessages = activeSessionId ? messagesMap[activeSessionId] || [] : [];

  // Create New Chat
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: "chat_" + Date.now(),
      title: "New Conversation",
      pinned: false,
      createdAt: Date.now(),
    };
    const updatedSessions = [newSession, ...sessions];
    const updatedMap = {
      ...messagesMap,
      [newSession.id]: [],
    };
    setSessions(updatedSessions);
    setActiveSessionId(newSession.id);
    setMessagesMap(updatedMap);
    saveChatsToStorage(updatedSessions, updatedMap);
    setSidebarOpen(false);

    // Call backend to persist session if logged in
    const token = localStorage.getItem("premiers_auth_token");
    if (token) {
      fetch("/api/chat/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: "New Conversation" }),
      }).catch((e) => console.warn("Session backend sync error:", e));
    }
  };

  // Delete Chat
  const handleDeleteChat = (id: string, e?: MouseEvent) => {
    e?.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    const remainingSessions = sessions.filter((s) => s.id !== id);
    const updatedMap = { ...messagesMap };
    delete updatedMap[id];

    if (remainingSessions.length === 0) {
      const fresh: ChatSession = {
        id: "chat_" + Date.now(),
        title: "New Conversation",
        pinned: false,
        createdAt: Date.now(),
      };
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      setMessagesMap({ [fresh.id]: [] });
      saveChatsToStorage([fresh], { [fresh.id]: [] });
    } else {
      setSessions(remainingSessions);
      if (activeSessionId === id) {
        setActiveSessionId(remainingSessions[0].id);
      }
      setMessagesMap(updatedMap);
      saveChatsToStorage(remainingSessions, updatedMap);
    }

    // Backend deletion
    const token = localStorage.getItem("premiers_auth_token");
    if (token) {
      fetch(`/api/chat/sessions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch((err) => console.warn("Backend session delete error:", err));
    }
  };

  // Clear Conversation Messages
  const handleClearMessages = () => {
    if (!activeSessionId) return;
    if (!confirm("Clear all messages in this conversation? The conversation title will remain.")) return;

    const updatedMap = {
      ...messagesMap,
      [activeSessionId]: [],
    };
    setMessagesMap(updatedMap);
    saveChatsToStorage(sessions, updatedMap);

    const token = localStorage.getItem("premiers_auth_token");
    if (token) {
      fetch(`/api/chat/sessions/${activeSessionId}/messages`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch((e) => console.warn("Backend clear messages error:", e));
    }
  };

  // Rename Chat
  const handleStartRename = (session: ChatSession, e: MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (id: string) => {
    const finalTitle = editingTitle.trim() || "Untitled Conversation";
    const updated = sessions.map((s) => (s.id === id ? { ...s, title: finalTitle } : s));
    setSessions(updated);
    setEditingSessionId(null);
    saveChatsToStorage(updated, messagesMap);

    const token = localStorage.getItem("premiers_auth_token");
    if (token) {
      fetch(`/api/chat/sessions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: finalTitle }),
      }).catch((e) => console.warn("Backend rename sync error:", e));
    }
  };

  // Pin / Unpin Chat
  const handleTogglePin = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const target = sessions.find((s) => s.id === id);
    if (!target) return;
    const newPinned = !target.pinned;

    const updated = sessions.map((s) => (s.id === id ? { ...s, pinned: newPinned } : s));
    updated.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt - a.createdAt;
    });
    setSessions(updated);
    saveChatsToStorage(updated, messagesMap);

    const token = localStorage.getItem("premiers_auth_token");
    if (token) {
      fetch(`/api/chat/sessions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pinned: newPinned }),
      }).catch((e) => console.warn("Backend pin sync error:", e));
    }
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsAiThinking(false);
  };

  // Copy assistant response
  const handleCopyResponse = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Handle file uploads
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files: File[] = Array.from(e.target.files);

    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const base64Data = (loadEvent.target?.result as string).split(",")[1];
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64Data,
            url: loadEvent.target?.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  // Send Message Core
  const executeSendMessage = async (textToSend: string, customAttachments?: Attachment[]) => {
    const trimmed = textToSend.trim();
    const effectiveAttachments = customAttachments || attachments;
    if (!trimmed && effectiveAttachments.length === 0) return;
    if (isAiThinking) return;

    const userIsRTL = isTextRTL(trimmed);
    const userMsg: Message = {
      id: "msg_" + Date.now(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
      isRTL: userIsRTL,
      attachments: effectiveAttachments,
    };

    const currentChat = sessions.find((s) => s.id === activeSessionId);
    let updatedSessions = sessions;
    if (currentChat && (currentChat.title === "New Conversation" || currentChat.title === "New Chat") && trimmed) {
      const truncatedTitle = trimmed.length > 28 ? trimmed.slice(0, 28) + "…" : trimmed;
      updatedSessions = sessions.map((s) => (s.id === activeSessionId ? { ...s, title: truncatedTitle } : s));
      setSessions(updatedSessions);
    }

    const updatedCurrentMessages = [...currentMessages, userMsg];
    const newMap = {
      ...messagesMap,
      [activeSessionId]: updatedCurrentMessages,
    };
    setMessagesMap(newMap);
    setInputText("");
    setAttachments([]);
    setIsAiThinking(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Set abort controller for Stop Generation
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // 1. Intelligent Sense Engine for Creative Visuals (Logos, Free Fire, YouTube, etc.)
      const creativeReq = detectCreativeIntent(trimmed);
      let generatedImage: string | null = null;
      if (creativeReq) {
        generatedImage = generateCreativeGraphic({
          title: creativeReq.title,
          subtitle: creativeReq.subtitle,
          category: creativeReq.category,
          theme: creativeReq.theme,
        });
      }

      // 2. Intelligent Sense Engine for Dynamic Interactive Websites
      const websiteReq = detectWebsiteIntent(trimmed);
      const websiteCode = websiteReq ? websiteReq.htmlCode : null;

      // 3. Call backend /api/chat with Gemini & Multilingual cascade
      const token = localStorage.getItem("premiers_auth_token");
      const response = await fetch("/api/chat", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sessionId: activeSessionId,
          message: trimmed,
          conversationHistory: updatedCurrentMessages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          attachments: effectiveAttachments,
          targetLanguage: selectedLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();

      // Synthesize intelligent, contextual description if creative or website was requested
      let assistantContent = data.content || "I have received your request.";
      if (creativeReq) {
        const themeLabel =
          creativeReq.theme === "car"
            ? "🏎️ Aerodynamic Supercar High-Definition Render"
            : creativeReq.theme === "landscape"
            ? "🌄 Cinematic Alpine Sunset Landscape Artwork"
            : creativeReq.theme === "cyber_city"
            ? "🌃 Cyberpunk Metropolis 2099 Skyline"
            : creativeReq.theme === "space"
            ? "🪐 Deep Space Odyssey & Cosmic Nebula"
            : creativeReq.theme === "animal"
            ? "🦁 Majestic Wildlife Artwork"
            : creativeReq.theme === "anime"
            ? "⚔️ Manga & Anime Cyber Character Art"
            : creativeReq.theme === "architecture"
            ? "🏛️ Modern Luxury Architectural Design"
            : creativeReq.theme === "food"
            ? "☕ Artisanal Gourmet Culinary Visual"
            : creativeReq.theme === "abstract"
            ? "🔮 Prismatic 3D Holographic Geometry"
            : creativeReq.theme === "company_logo"
            ? "🏢 Modern Corporate Brand Logo"
            : creativeReq.theme === "fitness"
            ? "🏋️ Elite Fitness & Athletic Brand"
            : creativeReq.theme === "crypto"
            ? "⛓️ Web3 & Crypto Protocol Identity"
            : creativeReq.theme === "medical"
            ? "🏥 Modern Healthcare & Medical Clinic"
            : creativeReq.theme === "robotics"
            ? "🤖 Cybernetic Robotics & AI Core"
            : creativeReq.theme === "fantasy"
            ? "🏰 Epic Fantasy & Mythic Artwork"
            : creativeReq.theme === "portrait"
            ? "👤 Stylized Character Portrait"
            : creativeReq.theme === "universal"
            ? "🌌 Universal Creative Artwork"
            : creativeReq.theme === "luxury"
            ? "👑 Royal Luxury Gold Heritage Crest"
            : creativeReq.theme === "youtube"
            ? "🔴 YouTube Creator Studio Brand Identity"
            : creativeReq.theme === "cyber_gaming"
            ? "⚡ Cybernetic Esports Clan Crest"
            : creativeReq.theme === "free_fire"
            ? "🔥 Championship Esports Mascot Emblem"
            : "🎨 High-Resolution Visual Artwork";

        assistantContent = `### ${themeLabel}: ${creativeReq.title}\n\nI have created your high-definition visual asset with custom geometry, atmospheric lighting, and composition:\n\n- **Subject / Entity**: \`${creativeReq.title}\`\n- **Theme Style**: ${creativeReq.theme.replace(/_/g, " ").toUpperCase()}\n- **Asset Category**: ${creativeReq.category.toUpperCase()}\n- **Subtitle Tag**: *${creativeReq.subtitle}*\n- **Visual Direction**: ${creativeReq.promptDescription}\n\n*Your asset is rendered below in high definition. Click **Download PNG** below to save the file:*`;
      } else if (websiteReq) {
        assistantContent = `### 💻 Full-Stack Web Development: ${websiteReq.title}\n\nI have started coding and engineered a full, production-ready interactive web application for **${websiteReq.title}** featuring dynamic state management, search/category filtering, modal dialogues, shopping cart/booking calculations, and responsive mobile-first layouts.\n\n#### 📦 Complete Generated Source Code (\`index.html\`):\n\`\`\`html\n${websiteReq.htmlCode}\n\`\`\`\n\n---\n⚡ **Live Sandbox Online:**\nYou can preview and interact with the live functional app directly below in the interactive sandbox, test the buttons, modals, and filters, or switch tabs to view and copy the full source code!`;
      }

      const assistantMsg: Message = {
        id: data.messageId || "msg_" + (Date.now() + 1),
        role: "assistant",
        content: assistantContent,
        timestamp: Date.now(),
        detectedLanguage: data.detectedLanguage || "Multilingual",
        languageCode: data.languageCode || "en",
        isRTL: data.isRTL ?? false,
        images: generatedImage ? [generatedImage] : data.images || [],
        websiteHtml: websiteCode || data.websiteHtml || undefined,
      };

      const finalMessages = [...updatedCurrentMessages, assistantMsg];
      const finalMap = {
        ...messagesMap,
        [activeSessionId]: finalMessages,
      };
      setMessagesMap(finalMap);
      saveChatsToStorage(updatedSessions, finalMap);
    } catch (err: any) {
      if (err?.name === "AbortError") {
        // User deliberately aborted generation
        const stoppedMsg: Message = {
          id: "msg_stopped_" + Date.now(),
          role: "assistant",
          content: "*(Generation stopped by user)*",
          timestamp: Date.now(),
          isRTL: false,
        };
        const finalMessages = [...updatedCurrentMessages, stoppedMsg];
        const finalMap = {
          ...messagesMap,
          [activeSessionId]: finalMessages,
        };
        setMessagesMap(finalMap);
        saveChatsToStorage(updatedSessions, finalMap);
        return;
      }

      console.error("Chat communication error:", err);
      const fallbackMsg: Message = {
        id: "msg_err_" + Date.now(),
        role: "assistant",
        content: "⚠️ I encountered a temporary network or server issue. Please click **Retry** below to resend your query.",
        timestamp: Date.now(),
        isRTL: false,
        isError: true,
      };
      const finalMessages = [...updatedCurrentMessages, fallbackMsg];
      const finalMap = {
        ...messagesMap,
        [activeSessionId]: finalMessages,
      };
      setMessagesMap(finalMap);
      saveChatsToStorage(updatedSessions, finalMap);
    } finally {
      setIsAiThinking(false);
      abortControllerRef.current = null;
    }
  };

  const handleSendMessage = () => {
    executeSendMessage(inputText);
  };

  // Regenerate last assistant response
  const handleRegenerate = () => {
    if (isAiThinking || currentMessages.length === 0) return;

    // Find the last user message
    let lastUserIndex = -1;
    for (let i = currentMessages.length - 1; i >= 0; i--) {
      if (currentMessages[i].role === "user") {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const lastUserMessage = currentMessages[lastUserIndex];
    // Remove messages after this user message
    const trimmedMessages = currentMessages.slice(0, lastUserIndex);
    const newMap = {
      ...messagesMap,
      [activeSessionId]: trimmedMessages,
    };
    setMessagesMap(newMap);

    // Re-execute user message
    executeSendMessage(lastUserMessage.content, lastUserMessage.attachments);
  };

  // Retry a specific failed message
  const handleRetry = (msg: Message) => {
    if (isAiThinking) return;
    // Remove the error assistant bubble
    const filtered = currentMessages.filter((m) => m.id !== msg.id);
    setMessagesMap({
      ...messagesMap,
      [activeSessionId]: filtered,
    });

    // Re-run last user message
    const lastUserMsg = [...filtered].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      executeSendMessage(lastUserMsg.content, lastUserMsg.attachments);
    }
  };

  // Format message time
  const formatMessageTime = (timestamp: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Filtered sidebar sessions
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchHistoryQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-[#0a0a0f] text-[#f0f0f5] overflow-hidden">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Responsive Left Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 sm:w-80 flex flex-col bg-[#0e0e16] border-r border-[#202030] transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#202030] flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal</span>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden w-8 h-8 rounded-lg bg-[#181824] flex items-center justify-center text-gray-400 hover:text-white"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00d4a0] to-[#00b8d4] text-black font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-md shadow-[#00d4a0]/25 transition-all cursor-pointer btn-glow-pulse btn-shimmer-neon active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Search Conversations Input */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchHistoryQuery}
              onChange={(e) => setSearchHistoryQuery(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-[#242436] bg-[#141420] text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#00d4a0]"
            />
            {searchHistoryQuery && (
              <button
                onClick={() => setSearchHistoryQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 card-scroll">
          <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Conversations</span>
            <span className="text-[10px] font-mono text-gray-400">{filteredSessions.length}</span>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400">
              {searchHistoryQuery ? "No matching conversations found." : "No conversations yet. Start one!"}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = editingSessionId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    setActiveSessionId(session.id);
                    setSidebarOpen(false);
                  }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#181826] border border-[#2e2e44] text-white font-medium"
                      : "text-gray-300 hover:bg-[#141420] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#00d4a0]" : "text-gray-400"}`} />

                    {isEditing ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleSaveRename(session.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(session.id);
                          if (e.key === "Escape") setEditingSessionId(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-[#0f0f18] text-white text-xs px-2 py-1 rounded border border-[#00d4a0] focus:outline-none"
                      />
                    ) : (
                      <span className="truncate">{session.title}</span>
                    )}
                  </div>

                  {/* Actions & Pin Icon */}
                  <div className="flex items-center gap-1 shrink-0">
                    {session.pinned && !isEditing && (
                      <Pin className="w-3 h-3 text-amber-400 fill-amber-400" />
                    )}

                    {!isEditing && (
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(session, e)}
                          title="Rename conversation"
                          className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#202030]"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleTogglePin(session.id, e)}
                          title={session.pinned ? "Unpin" : "Pin to top"}
                          className="p-1 rounded text-gray-400 hover:text-amber-400 hover:bg-[#202030]"
                        >
                          {session.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteChat(session.id, e)}
                          title="Delete conversation"
                          className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-[#202030]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* User Card Bottom Sidebar */}
        <div className="p-3 border-t border-[#202030] bg-[#0c0c14] space-y-2">
          {/* Plan badge & Upgrade button */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#141422] border border-[#242436]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00d4a0]" />
              <span className="text-xs font-bold capitalize text-white">
                {userPlan} Tier
              </span>
            </div>
            {userPlan === "free" && (
              <button
                onClick={onUpgradeClick}
                className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-[#00d4a0] text-black hover:bg-[#00e8b0] transition-colors cursor-pointer"
              >
                Upgrade
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00d4a0]/20 to-[#6366f1]/20 border border-[#00d4a0]/30 flex items-center justify-center text-[#00d4a0] font-bold text-xs shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate max-w-[130px]">
                  {user.name || "PREMIERS Member"}
                </div>
                <div className="text-[10px] text-gray-400 truncate max-w-[130px]">
                  {user.email}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-[#1a1a26] transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <main className="flex-1 flex flex-col h-full bg-[#0a0a0f] overflow-hidden relative">
        {/* Chat Header */}
        <div className="h-14 sm:h-16 px-4 sm:px-6 border-b border-[#202030] bg-[#0e0e16] flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#181824] transition-colors"
              aria-label="Open sidebar"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[180px] sm:max-w-md">
                  {sessions.find((s) => s.id === activeSessionId)?.title || "PREMIERS AI"}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00d4a0]/10 text-[#00d4a0] border border-[#00d4a0]/30 uppercase tracking-wider">
                  Universal AI
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                Powered by Gemini Multi-Engine with Multilingual Language Cascade
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Image AI Studio Modal Launcher */}
            <button
              type="button"
              onClick={() => setImageStudioOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00d4a0]/15 to-[#a855f7]/15 border border-[#00d4a0]/40 hover:border-[#00d4a0] text-xs font-bold text-white transition-all cursor-pointer shadow-sm btn-glow-pulse active:scale-95"
              title="Open Image AI Studio"
            >
              <Wand2 className="w-3.5 h-3.5 text-[#00d4a0]" />
              <span className="hidden sm:inline">Image AI Studio</span>
            </button>

            {/* Clear Conversation */}
            {currentMessages.length > 0 && (
              <button
                type="button"
                onClick={handleClearMessages}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#2b2b3e] bg-[#141420] text-xs font-medium text-gray-400 hover:text-red-400 hover:border-red-500/40 transition-colors cursor-pointer"
                title="Clear current messages"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Clear</span>
              </button>
            )}

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangPickerOpen(!langPickerOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#2b2b3e] bg-[#141420] text-xs font-semibold text-gray-300 hover:text-white cursor-pointer min-h-[34px]"
                title="Target Reply Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#00d4a0]" />
                <span className="hidden sm:inline">Reply:</span>
                <span className="text-[#00d4a0]">
                  {selectedLanguage === "auto"
                    ? "Auto"
                    : SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.name.split(" ")[0]}
                </span>
              </button>

              {langPickerOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 max-h-64 overflow-y-auto rounded-xl border border-[#2e2e44] bg-[#12121c] p-1.5 shadow-2xl z-50 card-scroll"
                  onMouseLeave={() => setLangPickerOpen(false)}
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#242436] mb-1">
                    Force Reply Language
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        setLangPickerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                        selectedLanguage === lang.code
                          ? "bg-[#00d4a0]/15 text-[#00d4a0] font-bold"
                          : "text-gray-300 hover:bg-[#1a1a28] hover:text-white"
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-gray-400 text-[10px]">{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Admin or Workspace Quick Launch */}
            {user.role === "admin" && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#6366f1]/40 bg-[#6366f1]/15 text-[#818cf8] text-xs font-bold hover:bg-[#6366f1]/25 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            {onOpenWorkspace && (
              <button
                onClick={onOpenWorkspace}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2b2b3e] bg-[#141420] text-xs font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#00d4a0]" />
                <span className="hidden sm:inline">Workspace</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages Stream Container */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 card-scroll relative"
        >
          {currentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#00d4a0]/10 border border-[#00d4a0]/30 flex items-center justify-center text-[#00d4a0] text-3xl mb-4">
                ✦
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Ask PREMIERS Anything</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6">
                Type in English, Urdu (اردو), Roman Urdu, Arabic, Persian, Hindi, French, Spanish, or Chinese. Attach images for visual inspection, request logos, banners, posters, and code.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                <button
                  onClick={() => executeSendMessage("Aap mujhe ek modern technology logo ka concept bana kar dein")}
                  className="p-3 rounded-xl border border-[#242436] bg-[#141420] text-xs text-gray-300 hover:text-white hover:border-[#00d4a0]/50 text-left cursor-pointer transition-all"
                >
                  <span className="text-[#00d4a0] font-bold block mb-1">Roman Urdu Prompt</span>
                  "Aap mujhe modern technology logo ka concept dein"
                </button>
                <button
                  onClick={() => executeSendMessage("مصنوعی ذہانت کے بارے میں جامع خلاصہ پیش کریں")}
                  className="p-3 rounded-xl border border-[#242436] bg-[#141420] text-xs text-gray-300 hover:text-white hover:border-[#00d4a0]/50 text-right cursor-pointer transition-all font-urdu"
                  dir="rtl"
                >
                  <span className="text-[#00d4a0] font-bold block mb-1">اردو سوال</span>
                  "مصنوعی ذہانت کے بارے میں جامع خلاصہ پیش کریں"
                </button>
              </div>
            </div>
          ) : (
            currentMessages.map((msg, index) => {
              const isAssistant = msg.role === "assistant";
              const isRtl = msg.isRTL ?? isTextRTL(msg.content);
              const isLatestAssistant = isAssistant && index === currentMessages.length - 1;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${
                    isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 shadow-sm ${
                      isAssistant
                        ? "bg-gradient-to-br from-[#00d4a0] to-[#00b8d4] text-black"
                        : "bg-[#28283c] text-white"
                    }`}
                  >
                    {isAssistant ? "P" : user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>

                  {/* Bubble Content */}
                  <div
                    className={`rounded-2xl p-4 sm:p-5 text-sm leading-relaxed max-w-full overflow-hidden shadow-sm group ${
                      isAssistant
                        ? msg.isError
                          ? "bg-red-950/30 border border-red-500/40 text-red-200"
                          : "bg-[#141420] border border-[#242436] text-gray-200"
                        : "bg-[#00d4a0]/15 border border-[#00d4a0]/30 text-white"
                    }`}
                  >
                    {/* Assistant Bubble Meta Bar: Language badge, timestamp, copy button */}
                    <div className="flex items-center justify-between gap-3 text-[11px] text-gray-400 mb-2 pb-2 border-b border-[#202030]">
                      <div className="flex items-center gap-2">
                        {isAssistant ? (
                          <>
                            <span className="font-semibold text-white">PREMIERS AI</span>
                            {msg.detectedLanguage && (
                              <span className="flex items-center gap-1 text-[#00d4a0]">
                                <Globe className="w-3 h-3" />
                                <span>{msg.detectedLanguage}</span>
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="font-semibold text-white">{user.name || "You"}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">{formatMessageTime(msg.timestamp)}</span>

                        {isAssistant && !msg.isError && (
                          <button
                            type="button"
                            onClick={() => handleCopyResponse(msg.content, msg.id)}
                            className="p-1 rounded hover:bg-[#202032] text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                            title="Copy response"
                          >
                            {copiedMessageId === msg.id ? (
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
                        )}
                      </div>
                    </div>

                    {/* Main Markdown & Code Body */}
                    <MarkdownRenderer content={msg.content} isRTL={isRtl} />

                    {/* Retry button if this message encountered an error */}
                    {msg.isError && (
                      <div className="mt-3 pt-2 border-t border-red-500/20 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRetry(msg)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retry Query</span>
                        </button>
                      </div>
                    )}

                    {/* Regenerate button on latest assistant message */}
                    {isLatestAssistant && !isAiThinking && !msg.isError && (
                      <div className="mt-3 pt-2 border-t border-[#202030] flex items-center justify-end">
                        <button
                          type="button"
                          onClick={handleRegenerate}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a1a28] hover:bg-[#252538] text-gray-400 hover:text-white text-xs transition-colors cursor-pointer"
                          title="Regenerate this response"
                        >
                          <RotateCcw className="w-3 h-3 text-[#00d4a0]" />
                          <span>Regenerate</span>
                        </button>
                      </div>
                    )}

                    {/* Embedded Generated Images */}
                    {msg.images && msg.images.length > 0 && (
                      <div className="mt-4 space-y-3 pt-3 border-t border-[#202030]">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#00d4a0]" />
                          <span>Generated Creative Visual (Ready to Download)</span>
                        </div>
                        {msg.images.map((imgUrl, i) => (
                          <div key={i} className="rounded-xl overflow-hidden border border-[#28283c] bg-[#0c0c14] p-2">
                            <img
                              src={imgUrl}
                              alt="Generated Visual Asset"
                              className="w-full max-h-96 object-contain rounded-lg mb-2"
                            />
                            <div className="flex items-center justify-between gap-2 pt-2 px-1">
                              <span className="text-[11px] text-gray-400">High-Resolution Asset</span>
                              <a
                                href={imgUrl}
                                download={`premiers-creative-${Date.now()}.png`}
                                className="px-3 py-1.5 rounded-lg bg-[#00d4a0] hover:bg-[#00e8b0] text-black font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-[#00d4a0]/25 btn-glow-pulse active:scale-95"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download PNG</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Embedded Live Website Sandbox Preview & Code Viewer */}
                    {msg.websiteHtml && (
                      <WebsiteSandboxCard html={msg.websiteHtml} />
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Colorful AI Thinking / Loading Animation Bubble */}
          {isAiThinking && (
            <div className="flex gap-3 max-w-3xl mr-auto animate-in fade-in-50 duration-200">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00d4a0] to-[#00b8d4] flex items-center justify-center text-black font-extrabold text-xs shrink-0 shadow-sm">
                P
              </div>
              <div className="rounded-2xl p-4 bg-[#141420] border border-[#242436] space-y-2.5 max-w-sm">
                {/* Gradient Shimmer Bar */}
                <div className="w-48 h-2 rounded-full thinking-glow overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent thinking-sweep" />
                </div>
                {/* Pulsating Dots */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                    <div className="flex gap-1 items-center">
                      <span className="w-2 h-2 rounded-full bg-[#00d4a0] thinking-dot-1" />
                      <span className="w-2 h-2 rounded-full bg-[#00b8d4] thinking-dot-2" />
                      <span className="w-2 h-2 rounded-full bg-purple-400 thinking-dot-3" />
                    </div>
                    <span>PREMIERS AI is composing…</span>
                  </div>

                  {/* Stop Generation Button on thinking bubble */}
                  <button
                    type="button"
                    onClick={handleStopGeneration}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-900/40 hover:bg-red-800/60 border border-red-500/30 text-red-300 text-[11px] font-semibold cursor-pointer transition-colors"
                  >
                    <Square className="w-2.5 h-2.5 fill-red-400" />
                    <span>Stop</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Scroll-to-Bottom Button */}
        {showScrollBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 z-20 w-10 h-10 rounded-full bg-[#1e1e2f] border border-[#3b3b55] text-white flex items-center justify-center shadow-2xl hover:bg-[#28283e] hover:border-[#00d4a0] transition-all cursor-pointer"
            title="Scroll to latest message"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="w-5 h-5 text-[#00d4a0]" />
          </button>
        )}

        {/* Input Bar pinned to bottom */}
        <div className="p-3 sm:p-4 border-t border-[#202030] bg-[#0e0e16] shrink-0">
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Attachment preview tags */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-1">
                {attachments.map((att, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-[#2b2b3e] bg-[#161624] text-xs text-gray-200"
                  >
                    {att.type.startsWith("image/") && att.url && (
                      <img src={att.url} alt="thumbnail" className="w-5 h-5 rounded object-cover" />
                    )}
                    <span className="max-w-[140px] truncate">{att.name}</span>
                    <button
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                      className="text-gray-400 hover:text-red-400 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Row */}
            <div className="flex items-end gap-2 p-2 rounded-2xl border border-[#2b2b3e] bg-[#141420] focus-within:border-[#00d4a0]/70 focus-within:ring-2 focus-within:ring-[#00d4a0]/15 transition-all">
              {/* File Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1f1f2e] transition-colors cursor-pointer shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Attach image or file for AI vision analysis"
                aria-label="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask PREMIERS anything in any language (English, Urdu, Arabic, etc.)…"
                dir={isTextRTL(inputText) ? "rtl" : "ltr"}
                rows={1}
                className={`flex-1 bg-transparent text-sm text-white placeholder-gray-500 resize-none focus:outline-none py-2 px-1 max-h-44 ${
                  isTextRTL(inputText) ? "font-urdu text-base text-right" : "text-left"
                }`}
              />

              {/* Send or Stop Button */}
              {isAiThinking ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center shadow-md shadow-red-600/30 cursor-pointer"
                  title="Stop generation"
                  aria-label="Stop generation"
                >
                  <Square className="w-4 h-4 fill-white" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() && attachments.length === 0}
                  className="p-2.5 rounded-xl bg-[#00d4a0] hover:bg-[#00e8b0] text-black font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center shadow-md shadow-[#00d4a0]/25 cursor-pointer btn-shimmer-neon active:scale-95"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Bottom footnote */}
            <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
              <span>PREMIERS AI Universal Engine</span>
              <span>Press Enter to send • Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      </main>

      {/* Image AI Studio Modal */}
      {imageStudioOpen && (
        <ImageAiStudioModal
          onClose={() => setImageStudioOpen(false)}
          onSendToChat={(prompt, imageUrl) => {
            if (imageUrl) {
              setAttachments((prev) => [
                ...prev,
                {
                  name: "ai-generated-asset.png",
                  type: "image/png",
                  size: 50000,
                  data: imageUrl.split(",")[1] || "",
                  url: imageUrl,
                },
              ]);
            }
            setInputText(prompt);
          }}
        />
      )}
    </div>
  );
}
