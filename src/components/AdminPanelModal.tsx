import { useState, useEffect, type FormEvent } from "react";
import { User, AdminDashboardStats, AuditLogItem, CouponItem, ServiceOrder } from "../types";
import {
  X,
  LayoutDashboard,
  Users,
  ShoppingBag,
  Ticket,
  ShieldAlert,
  Search,
  DollarSign,
  TrendingUp,
  Cpu,
  Image as ImageIcon,
  Check,
  Edit2,
  RefreshCw,
} from "lucide-react";

interface AdminPanelModalProps {
  currentUser: User;
  onClose: () => void;
}

type AdminTab = "stats" | "orders" | "users" | "coupons" | "logs";

export function AdminPanelModal({ currentUser, onClose }: AdminPanelModalProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("stats");
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  // New coupon form state
  const [newCouponCode, setNewCouponCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(20);

  const fetchAdminData = () => {
    const token = localStorage.getItem("premiers_auth_token");
    if (!token) return;

    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    Promise.allSettled([
      fetch("/api/admin/stats", { headers }).then((r) => r.json()),
      fetch("/api/admin/orders", { headers }).then((r) => r.json()),
      fetch(`/api/admin/users?search=${encodeURIComponent(searchUser)}`, { headers }).then((r) => r.json()),
      fetch("/api/admin/coupons", { headers }).then((r) => r.json()),
      fetch("/api/admin/audit-logs", { headers }).then((r) => r.json()),
    ])
      .then(([statsRes, ordersRes, usersRes, couponsRes, logsRes]) => {
        if (statsRes.status === "fulfilled" && statsRes.value.stats) {
          setStats(statsRes.value.stats);
        }
        if (ordersRes.status === "fulfilled" && ordersRes.value.orders) {
          setOrders(ordersRes.value.orders);
        }
        if (usersRes.status === "fulfilled" && usersRes.value.users) {
          setUsers(usersRes.value.users);
        }
        if (couponsRes.status === "fulfilled" && couponsRes.value.coupons) {
          setCoupons(couponsRes.value.coupons);
        }
        if (logsRes.status === "fulfilled" && logsRes.value.logs) {
          setLogs(logsRes.value.logs);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab, searchUser]);

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const token = localStorage.getItem("premiers_auth_token");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setFeedback("Order status updated successfully.");
        fetchAdminData();
      }
    } catch {
      setFeedback("Failed to update order status.");
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole?: string) => {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    const token = localStorage.getItem("premiers_auth_token");
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: nextRole }),
      });
      if (res.ok) {
        setFeedback(`User role changed to ${nextRole}.`);
        fetchAdminData();
      }
    } catch {
      setFeedback("Failed to update user role.");
    }
  };

  const handleCreateCoupon = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("premiers_auth_token");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: newCouponCode,
          discountType,
          discountValue,
          maxUses: 200,
          durationDays: 30,
        }),
      });
      if (res.ok) {
        setFeedback(`Coupon ${newCouponCode.toUpperCase()} created!`);
        setNewCouponCode("");
        fetchAdminData();
      }
    } catch {
      setFeedback("Failed to create coupon.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col rounded-2xl border border-[#6366f1]/40 bg-[#0e0e18] text-[#f0f0f5] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f2e] bg-[#141424]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center text-[#818cf8]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">PREMIERS AI Admin Command Center</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#6366f1]/30 text-[#a5b4fc] uppercase border border-[#6366f1]/50">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-gray-400">Founder: Syed Muhammad Yasir Abbas Zaidi • System Controller</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              className="w-8 h-8 rounded-lg border border-[#2b2b3e] bg-[#1a1a28] flex items-center justify-center text-gray-400 hover:text-white"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#00d4a0]" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-[#2b2b3e] bg-[#1a1a28] flex items-center justify-center text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex items-center gap-1 sm:gap-2 px-6 py-2 border-b border-[#1f1f2e] bg-[#0c0c14] overflow-x-auto">
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "stats"
                ? "bg-[#6366f1]/20 text-[#a5b4fc] border border-[#6366f1]/50"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Platform Metrics</span>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "orders"
                ? "bg-[#6366f1]/20 text-[#a5b4fc] border border-[#6366f1]/50"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Customer Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "users"
                ? "bg-[#6366f1]/20 text-[#a5b4fc] border border-[#6366f1]/50"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Directory ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "coupons"
                ? "bg-[#6366f1]/20 text-[#a5b4fc] border border-[#6366f1]/50"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Coupons & Discounts ({coupons.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "logs"
                ? "bg-[#6366f1]/20 text-[#a5b4fc] border border-[#6366f1]/50"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Audit & Security Logs</span>
          </button>
        </div>

        {/* Feedback bar */}
        {feedback && (
          <div className="mx-6 mt-3 p-2.5 rounded-xl text-xs bg-[#6366f1]/20 border border-[#6366f1]/40 text-[#c7d2fe] flex items-center justify-between">
            <span>{feedback}</span>
            <button onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 card-scroll">
          {/* STATS TAB */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-[#232338] bg-[#141424]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-medium">Gross Revenue</span>
                    <DollarSign className="w-4 h-4 text-[#00d4a0]" />
                  </div>
                  <div className="text-2xl font-black text-white">${stats?.grossRevenue || 0} USD</div>
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Succeeded Transactions
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[#232338] bg-[#141424]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-medium">Registered Accounts</span>
                    <Users className="w-4 h-4 text-[#6366f1]" />
                  </div>
                  <div className="text-2xl font-black text-white">{stats?.totalUsers || 1}</div>
                  <p className="text-[10px] text-indigo-300 mt-1">
                    {stats?.activeSubscriptions || 1} Active Subscriptions
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[#232338] bg-[#141424]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-medium">Service Orders</span>
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{stats?.totalOrders || 0}</div>
                  <p className="text-[10px] text-amber-300 mt-1">
                    {stats?.completedOrders || 0} Delivered
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[#232338] bg-[#141424]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-medium">AI Invocations</span>
                    <Cpu className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{stats?.totalAiQueries || 0}</div>
                  <p className="text-[10px] text-pink-300 mt-1">Multilingual LLM Cascade Active</p>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="p-5 rounded-2xl border border-[#232338] bg-[#141424]">
                <h4 className="text-sm font-bold text-white mb-3">Latest Orders Activity</h4>
                {orders.length === 0 ? (
                  <p className="text-xs text-gray-400">No active customer orders currently.</p>
                ) : (
                  <div className="space-y-2">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="p-3 rounded-xl bg-[#0e0e18] flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono text-[#00d4a0] font-bold mr-2">{o.orderNumber}</span>
                          <span className="text-white font-semibold">{o.title}</span>
                          <span className="text-gray-400 ml-2">by {o.userName || o.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">${o.budget}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#6366f1]/20 text-[#a5b4fc]">
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Client Service Orders</h3>
                  <p className="text-xs text-gray-400">Manage deliverables, assign statuses, and track revenue.</p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">No client orders on record.</div>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="p-4 rounded-xl border border-[#232338] bg-[#141424] space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#00d4a0]">{o.orderNumber}</span>
                          <span className="text-xs text-gray-400">Client: {o.userName} ({o.userEmail})</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-0.5">{o.title}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-white">${o.budget} USD</div>
                        <span className={`text-[10px] font-bold uppercase ${o.paymentStatus === "paid" ? "text-emerald-400" : "text-amber-400"}`}>
                          Payment: {o.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 bg-[#0e0e18] p-2.5 rounded-lg border border-[#1f1f2e]">
                      {o.requirements}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#1f1f2e]">
                      <span className="text-[11px] text-gray-500">
                        Placed: {new Date(o.createdAt).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400 mr-1">Status:</span>
                        {(["submitted", "in_progress", "review", "completed", "cancelled"] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateOrderStatus(o.id, st)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                              o.status === st
                                ? "bg-[#00d4a0] text-black"
                                : "bg-[#1f1f2e] text-gray-400 hover:text-white"
                            }`}
                          >
                            {st.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#2b2b3e] bg-[#141424] text-xs text-white focus:outline-none focus:border-[#6366f1]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#232338]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141424] text-gray-400 uppercase tracking-wider font-semibold border-b border-[#232338]">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Country</th>
                      <th className="p-3">Registered</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f2e] bg-[#0e0e18]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#141424]/50">
                        <td className="p-3">
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-[11px] text-gray-400">{u.email}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === "admin"
                                ? "bg-[#6366f1]/20 text-[#a5b4fc] border border-[#6366f1]/40"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-gray-400">{u.country || "US"}</td>
                        <td className="p-3 text-gray-400">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active"}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleUserRole(u.id!, u.role)}
                            className="px-2.5 py-1 rounded text-[10px] font-bold border border-[#2b2b3e] bg-[#1a1a28] hover:border-[#6366f1] text-gray-300 hover:text-white"
                          >
                            {u.role === "admin" ? "Demote to User" : "Promote to Admin"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COUPONS TAB */}
          {activeTab === "coupons" && (
            <div className="space-y-6">
              {/* Create coupon */}
              <form onSubmit={handleCreateCoupon} className="p-4 rounded-xl border border-[#232338] bg-[#141424] flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SUMMER50"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    required
                    className="px-3 py-1.5 rounded-lg border border-[#2b2b3e] bg-[#0e0e18] text-xs text-white uppercase focus:outline-none focus:border-[#00d4a0]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-[#2b2b3e] bg-[#0e0e18] text-xs text-white focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 rounded-lg border border-[#2b2b3e] bg-[#0e0e18] text-xs text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#00d4a0] text-black hover:bg-[#00b887] transition-all"
                >
                  Create Promo Coupon
                </button>
              </form>

              {/* Coupons List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {coupons.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl border border-[#232338] bg-[#141424] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#00d4a0]">{c.code}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-white font-semibold">
                      {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `$${c.discountValue} USD OFF`}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Used: {c.usesCount} / {c.maxUses} times
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AUDIT LOGS TAB */}
          {activeTab === "logs" && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white">Security & Audit History</h3>
                <p className="text-xs text-gray-400">Immutable trace of auth, payments, orders, and admin changes.</p>
              </div>

              <div className="space-y-2">
                {logs.map((l) => (
                  <div key={l.id} className="p-3 rounded-xl border border-[#202030] bg-[#11111e] flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono">{l.action}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#6366f1]/20 text-[#a5b4fc]">
                          {l.resourceType}
                        </span>
                      </div>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        Actor: <span className="text-gray-200">{l.userName}</span> • IP: {l.ipAddress || "127.0.0.1"}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleTimeString()} {new Date(l.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
