/**
 * PREMIERS AI - Production Logger
 * Enforces zero-leakage of sensitive credentials, passwords, tokens, and payment secrets.
 */

export type LogLevel = "info" | "warn" | "error" | "debug";

const SENSITIVE_KEYS = new Set([
  "password",
  "password_hash",
  "newpassword",
  "currentpassword",
  "cardnumber",
  "cvv",
  "cvc",
  "token",
  "jwt",
  "authorization",
  "secret",
  "apikey",
  "gemini_api_key",
  "stripe_secret_key",
  "private_key",
]);

/**
 * Recursively sanitize objects to prevent leaking credentials in log files.
 */
export function sanitizeLogData(data: any): any {
  if (!data) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeLogData);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lower = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lower) || lower.includes("secret") || lower.includes("password") || lower.includes("cvv") || lower.includes("card")) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function logInfo(message: string, meta?: any) {
  const sanitized = meta ? sanitizeLogData(meta) : "";
  console.log(`[${new Date().toISOString()}] [INFO] ${message}`, sanitized || "");
}

export function logWarn(message: string, meta?: any) {
  const sanitized = meta ? sanitizeLogData(meta) : "";
  console.warn(`[${new Date().toISOString()}] [WARN] ${message}`, sanitized || "");
}

export function logError(message: string, error?: any, meta?: any) {
  const sanitizedMeta = meta ? sanitizeLogData(meta) : "";
  const errText = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack}` : String(error || "");
  console.error(`[${new Date().toISOString()}] [ERROR] ${message}`, {
    error: errText,
    meta: sanitizedMeta,
  });
}
