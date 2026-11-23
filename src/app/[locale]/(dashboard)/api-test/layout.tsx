import { notFound } from "next/navigation";

/**
 * صفحه‌ی تشخیصی API فقط در توسعه یا با ENABLE_API_TEST=1 در دسترس است
 * تا در محیط تولید سطح حمله‌ی اضافه ایجاد نکند.
 */
export default function ApiTestLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_API_TEST !== "1") notFound();
  return children;
}
