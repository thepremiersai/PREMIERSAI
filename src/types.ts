export type UserRole = "admin" | "user";

export interface User {
  id?: string;
  name: string;
  email: string;
  role?: UserRole;
  avatar?: string;
  phone?: string;
  country?: string;
  themePreference?: "dark" | "light" | "system";
  emailVerified?: boolean;
  token?: string;
  createdAt?: number;
}

export interface Attachment {
  name: string;
  type: string;
  data: string; // base64
  size: number;
  url?: string;
}

export interface MessageSource {
  title: string;
  url: string;
  domain?: string;
  date?: string;
  snippet?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  sources?: MessageSource[];
  searchQueries?: string[];
  isStreaming?: boolean;
  images?: string[];
  websiteHtml?: string;
  fileTree?: string;
  detectedLanguage?: string;
  languageCode?: string;
  isRTL?: boolean;
  attachments?: Attachment[];
  visualBrief?: any;
  isError?: boolean;
  statusMessage?: string;
}

export interface ChatSession {
  id: string;
  userId?: string;
  title: string;
  pinned: boolean;
  createdAt: number;
  updatedAt?: number;
  languageCode?: string;
  messageCount?: number;
}

export interface ServicePackage {
  id: string;
  serviceId: string;
  name: "Starter" | "Professional" | "Enterprise" | string;
  price: number;
  deliveryDays: number;
  revisions: number;
  features: string[];
}

export interface ServiceItem {
  id: string;
  slug?: string;
  title: string;
  category: string;
  description: string;
  features: string[];
  icon: string;
  badge?: string;
  price: string;
  startingPrice?: number;
  packages?: ServicePackage[];
  isFavorite?: boolean;
}

export type PlanId = "free" | "starter" | "standard" | "professional" | "premium" | "business" | "enterprise";

export interface PricingPlan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  popular?: boolean;
  features: string[];
  limits: {
    messages: number;
    images: number;
    searches: number;
    projects: number;
  };
}

export interface Subscription {
  id: string;
  userId: string;
  planId: PlanId;
  billingPeriod: "monthly" | "yearly";
  status: "active" | "cancelled" | "past_due" | "expired";
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}

export interface PaymentRecord {
  id: string;
  transactionId: string;
  userId: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  paymentMethod: "card" | "easypaisa" | "jazzcash" | "stripe" | "paypal";
  providerReference?: string;
  couponId?: string;
  discountAmount?: number;
  idempotencyKey?: string;
  createdAt: number;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "void";
  lineItems: InvoiceLineItem[];
  planTitle?: string;
  pdfUrl?: string;
  createdAt: number;
}

export type OrderStatus = "submitted" | "in_progress" | "review" | "completed" | "cancelled";
export type OrderPaymentStatus = "unpaid" | "paid" | "refunded";

export interface ServiceOrder {
  id: string;
  orderNumber: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  serviceId: string;
  serviceTitle?: string;
  packageId?: string;
  packageName?: string;
  packageTitle?: string;
  price?: number;
  currency?: string;
  title: string;
  requirements: string;
  deadline?: string;
  budget: number;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  files: { name: string; url: string; size?: number }[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "system" | "order" | "payment" | "security" | "promo";
  isRead: boolean;
  linkUrl?: string;
  createdAt: number;
}

export interface CouponItem {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses: number;
  usesCount: number;
  expiresAt: number;
  isActive: boolean;
}

export interface AuditLogItem {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  createdAt: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalOrders: number;
  completedOrders: number;
  grossRevenue: number;
  totalAiQueries: number;
  totalImagesGenerated: number;
  recentOrders: ServiceOrder[];
  recentUsers: User[];
  recentLogs: AuditLogItem[];
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
  script: string;
  samplePrompt?: string;
}
