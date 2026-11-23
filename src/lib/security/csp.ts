export type CspMode = "enforce" | "report-only" | "off";

/**
 * CSP_MODE=enforce | report-only | off
 * پیش‌فرض: روی build تولید «enforce»، و در توسعه «report-only» (فقط گزارش در کنسول).
 */
export function cspMode(): CspMode {
  const value = process.env.CSP_MODE;
  if (value === "enforce" || value === "report-only" || value === "off") {
    return value;
  }
  return process.env.NODE_ENV === "production" ? "enforce" : "report-only";
}

export function cspHeaderName(mode: Exclude<CspMode, "off">): string {
  return mode === "enforce" ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only";
}

/**
 * reCAPTCHA فقط وقتی مجاز می‌شود که NEXT_PUBLIC_RECAPTCHA_ENABLED=1 باشد
 * (ویجت فعلی در مسیر لاگین استفاده نمی‌شود؛ کپچا تصویری از backend است).
 */
function recaptchaSources() {
  const enabled = process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED === "1";
  return {
    frames: enabled ? ["https://www.recaptcha.net", "https://www.google.com/recaptcha/"] : [],
    scripts: enabled ? ["https://www.recaptcha.net", "https://www.gstatic.com/recaptcha/"] : [],
    connect: enabled ? ["https://www.recaptcha.net"] : [],
  };
}

export function buildCsp(nonce: string, isDev: boolean): string {
  const recaptcha = recaptchaSources();
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // 'strict-dynamic': اسکریپت‌هایی که اسکریپتِ دارای nonce بارگذاری می‌کند (مثل کپچا) مجازند.
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...recaptcha.scripts, ...(isDev ? ["'unsafe-eval'"] : [])],
    // production: بدون unsafe-inline برای <style>؛ فقط فایل‌های خودی و استایل‌های دارای nonce.
    // (sonner و Radix استایل خود را از CSS استاتیک می‌گیرند، نک. globals.css.)
    // در توسعه Next.js/HMR تگ style تزریق می‌کند، پس unsafe-inline فقط در dev مجاز است.
    "style-src": ["'self'", ...(isDev ? ["'unsafe-inline'"] : [`'nonce-${nonce}'`])],
    // ویژگی style="" روی المان‌ها (SSR و کتابخانه‌ها) قابل اجرای کد نیست؛ ریسک آن بسیار کم است.
    "style-src-attr": ["'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", ...recaptcha.connect, ...(isDev ? ["ws:", "wss:"] : [])],
    "frame-src": ["'none'", ...recaptcha.frames],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "manifest-src": ["'self'"],
    "worker-src": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  const policy = Object.entries(directives)
    .map(([name, values]) => [name, ...values].join(" "))
    .join("; ");

  return policy;
}
