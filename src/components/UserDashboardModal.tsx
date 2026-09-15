import React, { useState, useEffect, FormEvent, useRef } from "react";
import { User, ServiceOrder, Invoice, NotificationItem } from "../types";
import {
  X,
  ShoppingBag,
  CreditCard,
  Sparkles,
  Bell,
  User as UserIcon,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Shield,
  Folder,
  Bookmark,
  Settings,
  Trash2,
  UploadCloud,
  FileText,
  Palette,
  HardDrive,
  Database,
} from "lucide-react";

interface UserDashboardModalProps {
  user: User;
  onClose: () => void;
  onUpgradePlan: () => void;
  onUserUpdated?: (updated: User) => void;
}

type TabType = "orders" | "invoices" | "subscription" | "notifications" | "favorites" | "files" | "settings" | "profile";

interface FavoriteItem {
  id: string;
  serviceId: string;
  title: string;
  category: string;
  startingPrice: number;
  icon: string;
  createdAt: number;
}

interface UserFileItem {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  publicUrl: string;
  category: string;
  createdAt: number;
}

export function UserDashboardModal({
  user,
  onClose,
  onUpgradePlan,
  onUserUpdated,
}: UserDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [files, setFiles] = useState<UserFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Profile form state
  const [name, setName] = useState(user.name || "");
  const [country, setCountry] = useState(user.country || "US");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Settings form state
  const [themePref, setThemePref] = useState<string>(() => localStorage.getItem("premiers_theme") || "dark");
  const [aiModelPref, setAiModelPref] = useState<string>(() => localStorage.getItem("premiers_model_pref") || "gemini-2.5-flash");

  const fileUploadInputRef = useRef<HTMLInputElement>(null);

  // Load tab data
  useEffect(() => {
    const token = localStorage.getItem("premiers_auth_token");
    if (!token) return;

    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    Promise.allSettled([
      fetch("/api/orders/my", { headers }).then((r) => r.json()),
      fetch("/api/payments/invoices/my", { headers }).then((r) => r.json()),
      fetch("/api/user/subscription", { headers }).then((r) => r.json()),
      fetch("/api/user/notifications", { headers }).then((r) => r.json()),
      fetch("/api/user/favorites", { headers }).then((r) => r.json()),
      fetch("/api/user/files", { headers }).then((r) => r.json()),
    ])
      .then(([ordersRes, invoicesRes, subRes, notifsRes, favRes, filesRes]) => {
        if (ordersRes.status === "fulfilled" && ordersRes.value?.orders) {
          setOrders(ordersRes.value.orders);
        }
        if (invoicesRes.status === "fulfilled" && invoicesRes.value?.invoices) {
          setInvoices(invoicesRes.value.invoices);
        }
        if (subRes.status === "fulfilled" && subRes.value?.subscription) {
          setSubscription(subRes.value.subscription);
        }
        if (notifsRes.status === "fulfilled" && notifsRes.value?.notifications) {
          setNotifications(notifsRes.value.notifications);
        }
        if (favRes.status === "fulfilled" && favRes.value?.favorites) {
          setFavorites(favRes.value.favorites);
        }
        if (filesRes.status === "fulfilled" && filesRes.value?.files) {
          setFiles(filesRes.value.files);
        }
      })
      .finally(() => setLoading(false));
  }, [activeTab]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setFeedbackMsg(null);
    const token = localStorage.getItem("premiers_auth_token");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, country }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({ text: "Profile updated successfully.", type: "success" });
        const updated = { ...user, name, country };
        localStorage.setItem("premiers_user", JSON.stringify(updated));
        if (onUserUpdated) onUserUpdated(updated);
      } else {
        setFeedbackMsg({ text: data.error || "Failed to update profile.", type: "error" });
      }
    } catch {
      setFeedbackMsg({ text: "Network error updating profile.", type: "error" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setFeedbackMsg(null);
    const token = localStorage.getItem("premiers_auth_token");

    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({ text: "Password changed successfully.", type: "success" });
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setFeedbackMsg({ text: data.error || "Failed to change password.", type: "error" });
      }
    } catch {
      setFeedbackMsg({ text: "Network error updating password.", type: "error" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    const token = localStorage.getItem("premiers_auth_token");
    try {
      await fetch(`/api/user/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order request?")) return;
    const token = localStorage.getItem("premiers_auth_token");
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
        );
        setFeedbackMsg({ text: "Order cancelled.", type: "success" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFavorite = async (serviceId: string) => {
    const token = localStorage.getItem("premiers_auth_token");
    try {
      await fetch("/api/user/favorites/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ serviceId }),
      });
      setFavorites((prev) => prev.filter((f) => f.serviceId !== serviceId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Delete this file from your account storage?")) return;
    const token = localStorage.getItem("premiers_auth_token");
    try {
      await fetch(`/api/user/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("premiers_auth_token");
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      try {
        const res = await fetch("/api/user/files", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filename: file.name,
            fileType: file.type || "application/octet-stream",
            fileSize: file.size,
            publicUrl: dataUrl,
            category: file.type.startsWith("image/") ? "graphic" : "document",
          }),
        });
        const data = await res.json();
        if (data.file) {
          setFiles((prev) => [data.file, ...prev]);
          setFeedbackMsg({ text: "File uploaded successfully.", type: "success" });
        }
      } catch {
        setFeedbackMsg({ text: "Failed to upload file.", type: "error" });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleClearLocalData = () => {
    if (!confirm("Clear local chat history and cache from this browser?")) return;
    localStorage.removeItem("premiers_chats_data");
    localStorage.removeItem("premiers_image_history");
    setFeedbackMsg({ text: "Local browser workspace cleared.", type: "success" });
  };

  const handleExportData = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        country: user.country,
        role: user.role,
      },
      orders,
      invoices,
      subscription,
      favorites,
      files,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `premiers-ai-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedbackMsg({ text: "Account data archive exported.", type: "success" });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-[#2b2b3e] bg-[#0d0d16] text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#202030] bg-[#12121c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00d4a0]/20 to-[#6366f1]/20 border border-[#00d4a0]/30 flex items-center justify-center text-[#00d4a0] font-bold">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>{user.name || "User Workspace"}</span>
                {user.role === "admin" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6366f1]/20 text-[#818cf8] border border-[#6366f1]/40 uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#2b2b3e] bg-[#1a1a28] flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 px-6 py-2 border-b border-[#1f1f2e] bg-[#0c0c14] overflow-x-auto card-scroll">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-[#00d4a0]/15 text-[#00d4a0] border border-[#00d4a0]/40"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Service Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "invoices"
                ? "bg-[#00d4a0]/15 text-[#00d4a0] border border-[#00d4a0]/40"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Billing ({invoices.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("subscription")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "subscription"
                ? "bg-[#00d4a0]/15 text-[#00d4a0] border border-[#00d4a0]/40"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plan & Quotas</span>
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "notifications"
                ? "bg-[#00d4a0]/15 text-[#00d4a0] border border-[#00d4a0]/40"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#ef4444] text-white text-[10px] flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "favorites"
                ? "bg-[#00d4a0]/15 text-[#00d4a0] border border-[#00d4a0]/40"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Favorites ({favorites.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "files"
                ? "bg-[#00d4a0]/15 text-[#00d4a0] border border-[#00d4a0]/40"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Files ({files.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#00d4a0]/15 text-[#00d4a0] border border-[#00d4a0]/40"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-[#00d4a0]/15 text-[#00d4a0] border border-[#00d4a0]/40"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl text-xs flex items-center justify-between ${
              feedbackMsg.type === "success"
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                : "bg-red-500/15 border border-red-500/30 text-red-300"
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 card-scroll">
          {loading && (
            <div className="py-12 text-center text-xs text-gray-400">
              Synchronizing workspace records…
            </div>
          )}

          {/* ORDERS TAB */}
          {!loading && activeTab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="p-8 text-center text-gray-400 border border-[#202030] rounded-2xl bg-[#0f0f18]">
                  <ShoppingBag className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No service orders placed yet.</p>
                  <p className="text-xs text-gray-500 mt-1">Explore our Agency Marketplace to commission custom AI development, branding, or marketing solutions.</p>
                </div>
              ) : (
                orders.map((o) => (
                  <div
                    key={o.id}
                    className="p-4 rounded-xl border border-[#242436] bg-[#12121c] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{o.serviceTitle}</span>
                        <span className="text-xs text-gray-400">({o.packageTitle})</span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            o.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : o.status === "in_progress"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                              : o.status === "cancelled"
                              ? "bg-red-500/20 text-red-400 border border-red-500/40"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          }`}
                        >
                          {o.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Order #{o.orderNumber} • Placed {new Date(o.createdAt).toLocaleDateString()} • ${o.price} {o.currency}
                      </div>
                      {o.requirements && (
                        <p className="text-xs text-gray-400 mt-2 bg-[#181826] p-2 rounded-lg border border-[#222234]">
                          <span className="text-gray-300 font-semibold">Requirements:</span> {o.requirements}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {o.status === "submitted" && (
                        <button
                          onClick={() => handleCancelOrder(o.id)}
                          className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold cursor-pointer"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* INVOICES TAB */}
          {!loading && activeTab === "invoices" && (
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <div className="p-8 text-center text-gray-400 border border-[#202030] rounded-2xl bg-[#0f0f18]">
                  <CreditCard className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No invoices found.</p>
                  <p className="text-xs text-gray-500 mt-1">Receipts and billing statements are automatically archived here upon payment confirmation.</p>
                </div>
              ) : (
                invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-xl border border-[#242436] bg-[#12121c] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-white">{inv.invoiceNumber}</div>
                      <div className="text-xs text-gray-400">
                        {inv.planTitle} • {new Date(inv.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-[#00d4a0]">
                        ${inv.amount} {inv.currency}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400">
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SUBSCRIPTION TAB */}
          {!loading && activeTab === "subscription" && (
            <div className="space-y-6 max-w-xl">
              <div className="p-5 rounded-2xl border border-[#2e2e44] bg-[#141422] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Active Plan</span>
                    <h3 className="text-xl font-extrabold text-white capitalize mt-0.5">
                      {subscription?.tier || "Free"} Membership
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onUpgradePlan();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#00d4a0] hover:bg-[#00e8b0] text-black font-bold text-xs shadow-md shadow-[#00d4a0]/20 cursor-pointer"
                  >
                    Upgrade Plan
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#1a1a2a] border border-[#28283c]">
                    <div className="text-[11px] text-gray-400">Monthly AI Queries</div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {subscription?.tier === "enterprise"
                        ? "Unlimited"
                        : subscription?.tier === "pro"
                        ? "5,000 / month"
                        : "50 / day"}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#1a1a2a] border border-[#28283c]">
                    <div className="text-[11px] text-gray-400">Vision & Creative Models</div>
                    <div className="text-base font-bold text-[#00d4a0] mt-0.5">
                      {subscription?.tier === "free" ? "Standard" : "Priority Ultra HD"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {!loading && activeTab === "notifications" && (
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 border border-[#202030] rounded-2xl bg-[#0f0f18]">
                  <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No notifications right now.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkNotificationRead(n.id)}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors cursor-pointer ${
                      n.isRead
                        ? "border-[#202030] bg-[#101018] text-gray-400"
                        : "border-[#00d4a0]/40 bg-[#141426] text-white"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold truncate">{n.title}</h4>
                        <span className="text-[10px] text-gray-500">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 mt-0.5">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* FAVORITES TAB */}
          {!loading && activeTab === "favorites" && (
            <div className="space-y-4">
              {favorites.length === 0 ? (
                <div className="p-8 text-center text-gray-400 border border-[#202030] rounded-2xl bg-[#0f0f18]">
                  <Bookmark className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No saved favorites yet.</p>
                  <p className="text-xs text-gray-500 mt-1">Bookmark agency services or custom models to access them directly here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="p-4 rounded-xl border border-[#252538] bg-[#12121e] flex items-center justify-between hover:border-[#00d4a0]/50 transition-colors"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-white">{fav.title}</h4>
                        <div className="text-xs text-[#00d4a0] font-semibold mt-0.5">
                          Starting at ${fav.startingPrice}
                        </div>
                        <span className="text-[10px] text-gray-500 uppercase">{fav.category}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFavorite(fav.serviceId)}
                        className="p-2 rounded-lg bg-[#1a1a2a] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FILES TAB */}
          {!loading && activeTab === "files" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#202030]">
                <div className="text-xs text-gray-400">
                  {files.length} documents and creative assets stored in your workspace.
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileUploadInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00d4a0] text-black font-bold text-xs cursor-pointer shadow-md hover:bg-[#00e8b0]"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                  <input
                    ref={fileUploadInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {files.length === 0 ? (
                <div className="p-8 text-center text-gray-400 border border-[#202030] rounded-2xl bg-[#0f0f18]">
                  <Folder className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No files stored yet.</p>
                  <p className="text-xs text-gray-500 mt-1">Upload brand guidelines, images, logos, or specifications for fast reuse across chat and orders.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="p-3.5 rounded-xl border border-[#252538] bg-[#12121e] flex flex-col justify-between space-y-2 hover:border-[#3a3a52]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-5 h-5 text-[#00d4a0] shrink-0" />
                          <div className="truncate text-xs font-bold text-white" title={file.filename}>
                            {file.filename}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteFile(file.id)}
                          className="text-gray-500 hover:text-red-400 cursor-pointer"
                          title="Delete file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-gray-400 flex items-center justify-between">
                        <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                        <span className="uppercase text-[10px] text-gray-500">{file.category}</span>
                      </div>

                      {file.publicUrl && (
                        <a
                          href={file.publicUrl}
                          download={file.filename}
                          className="w-full py-1.5 rounded-lg bg-[#1c1c2a] hover:bg-[#252538] text-center text-xs text-gray-200 font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Download className="w-3 h-3 text-[#00d4a0]" />
                          <span>Download</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {!loading && activeTab === "settings" && (
            <div className="space-y-6 max-w-xl">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#00d4a0]" />
                  <span>Interface & System Preferences</span>
                </h4>

                {/* Theme selection */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Visual Canvas Theme</label>
                  <select
                    value={themePref}
                    onChange={(e) => {
                      setThemePref(e.target.value);
                      localStorage.setItem("premiers_theme", e.target.value);
                      setFeedbackMsg({ text: "Theme preference saved.", type: "success" });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#2b2b3e] bg-[#141422] text-white text-xs focus:outline-none focus:border-[#00d4a0]"
                  >
                    <option value="dark">Dark High-Contrast Twilight (Default)</option>
                    <option value="light">Light Crisp Theme</option>
                    <option value="system">System Synchronized</option>
                  </select>
                </div>

                {/* Preferred Model */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Default AI Reasoning Engine</label>
                  <select
                    value={aiModelPref}
                    onChange={(e) => {
                      setAiModelPref(e.target.value);
                      localStorage.setItem("premiers_model_pref", e.target.value);
                      setFeedbackMsg({ text: "Model engine selection updated.", type: "success" });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#2b2b3e] bg-[#141422] text-white text-xs focus:outline-none focus:border-[#00d4a0]"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra Fast & Adaptive)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Multilingual & Code)</option>
                    <option value="premiers-enterprise">PREMIERS Enterprise Hybrid Cascade</option>
                  </select>
                </div>
              </div>

              <hr className="border-[#202030]" />

              {/* Data & Privacy */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#00d4a0]" />
                  <span>Data Portability & Workspace Storage</span>
                </h4>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="px-4 py-2.5 rounded-xl bg-[#1a1a2a] hover:bg-[#25253a] border border-[#2e2e44] text-xs font-semibold text-white flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#00d4a0]" />
                    <span>Export User Data (JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearLocalData}
                    className="px-4 py-2.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-xs font-semibold text-red-300 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Clear Browser Workspace Cache</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {!loading && activeTab === "profile" && (
            <div className="space-y-6 max-w-xl">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <h4 className="text-sm font-bold text-white">General Information</h4>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#2b2b3e] bg-[#141422] text-white text-xs focus:outline-none focus:border-[#00d4a0]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#2b2b3e] bg-[#12121c] text-gray-500 text-xs cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Country / Region</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#2b2b3e] bg-[#141422] text-white text-xs focus:outline-none focus:border-[#00d4a0]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#00d4a0] text-black hover:bg-[#00b887] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingProfile ? "Saving..." : "Save Profile Details"}
                </button>
              </form>

              <hr className="border-[#202030]" />

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <h4 className="text-sm font-bold text-white">Change Security Password</h4>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#2b2b3e] bg-[#141422] text-white text-xs focus:outline-none focus:border-[#00d4a0]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">New Password (min 8 chars)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#2b2b3e] bg-[#141422] text-white text-xs focus:outline-none focus:border-[#00d4a0]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile || !currentPassword || !newPassword}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#2b2b3e] bg-[#1a1a28] text-white hover:border-[#00d4a0]/50 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
