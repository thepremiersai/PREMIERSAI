import { useState, useEffect, type FormEvent } from "react";
import { User } from "../types";
import { X, Lock, Mail, User as UserIcon, AlertCircle, Loader2 } from "lucide-react";

interface AuthModalsProps {
  isOpen: boolean;
  initialMode: "login" | "signup";
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const ACCOUNTS_KEY = "premiers_accounts_v1";

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function hashPassword(password: string, saltHex?: string) {
  const enc = new TextEncoder();
  const salt = saltHex ? hexToBuf(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as any, iterations: 150000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return { hash: bufToHex(derived), salt: bufToHex((salt as Uint8Array).buffer) };
}

export function AuthModals({ isOpen, initialMode, onClose, onSuccess }: AuthModalsProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg("");
  }, [initialMode, isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg("Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      const endpoint = mode === "signup" ? "/api/auth/register" : "/api/auth/login";
      const payload = mode === "signup" 
        ? { name: name.trim(), email: cleanEmail, password: cleanPassword }
        : { email: cleanEmail, password: cleanPassword };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Authentication failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("premiers_auth_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("premiers_user", JSON.stringify(data.user));
        onSuccess(data.user);
        setLoading(false);
        return;
      }

      // Fallback local storage
      const accountsRaw = localStorage.getItem(ACCOUNTS_KEY);
      const accounts: Record<string, any> = accountsRaw ? JSON.parse(accountsRaw) : {};

      if (mode === "signup") {
        const cleanName = name.trim();
        const { hash, salt } = await hashPassword(cleanPassword);
        accounts[cleanEmail] = { name: cleanName, hash, salt, createdAt: Date.now() };
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
        const newUser: User = { id: "usr_" + Date.now(), name: cleanName, email: cleanEmail, role: "user" };
        localStorage.setItem("premiers_user", JSON.stringify(newUser));
        onSuccess(newUser);
      } else {
        const account = accounts[cleanEmail];
        const loggedUser: User = { id: "usr_" + Date.now(), name: account?.name || "User", email: cleanEmail, role: "user" };
        localStorage.setItem("premiers_user", JSON.stringify(loggedUser));
        onSuccess(loggedUser);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-[#2b2b3e] bg-[#12121c] p-6 sm:p-8 shadow-2xl card-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#2b2b3e] bg-[#1a1a28] flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4a0] to-[#00b8d4] flex items-center justify-center text-white font-extrabold text-xl mx-auto mb-3 shadow-md shadow-[#00d4a0]/20">
            P
          </div>
          <h3 className="text-2xl font-extrabold text-white">
            {mode === "login" ? "Welcome Back" : "Join PREMIERS AI"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {mode === "login"
              ? "Access your universal multilingual workspace"
              : "Experience the world's most capable multilingual platform"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Syed Yasir"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#2b2b3e] bg-[#161622] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4a0]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#2b2b3e] bg-[#161622] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4a0]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#2b2b3e] bg-[#161622] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4a0]"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#00d4a0] hover:bg-[#00e8b0] text-black font-bold text-sm shadow-md shadow-[#00d4a0]/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 min-h-[44px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying…</span>
              </>
            ) : (
              <span>{mode === "login" ? "Log In" : "Create Account"}</span>
            )}
          </button>
        </form>

        <div className="text-center mt-5 text-xs text-gray-400">
          {mode === "login" ? (
            <span>
              Don't have an account yet?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setErrorMsg("");
                }}
                className="text-[#00d4a0] font-semibold hover:underline cursor-pointer ml-1"
              >
                Sign Up Free
              </button>
            </span>
          ) : (
            <span>
              Already registered?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setErrorMsg("");
                }}
                className="text-[#00d4a0] font-semibold hover:underline cursor-pointer ml-1"
              >
                Log In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
