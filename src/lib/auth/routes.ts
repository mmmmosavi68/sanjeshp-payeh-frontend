/**
 * مسیرهای عمومی (بدون پیشوند زبان). همه‌ی مسیرهای دیگر «پیش‌فرض محافظت‌شده» هستند؛
 * پس صفحه‌ی جدید بدون اضافه‌کردن به لیست هم به‌اشتباه عمومی نمی‌شود (default-deny).
 * این فایل بین proxy (edge) و کد کلاینت مشترک است؛ از import سمت سرور در آن پرهیز کنید.
 */
export const PUBLIC_PATHS = ["/", "/login", "/forbidden"] as const;

export function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some(
    (prefix) => path === prefix || (prefix !== "/" && path.startsWith(`${prefix}/`)),
  );
}

export function isProtectedPath(path: string): boolean {
  return !isPublicPath(path);
}
