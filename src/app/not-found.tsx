import Link from "next/link";

// خارج از مسیر [locale] است و به next-intl دسترسی ندارد؛ پیام به هر دو زبان نمایش داده می‌شود.
export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#fafafa",
          color: "#18181b",
        }}
      >
        <main style={{ textAlign: "center", padding: "1rem" }}>
          <h1 style={{ fontSize: "4rem", margin: 0, fontWeight: 800 }}>404</h1>
          <p style={{ margin: "0.5rem 0 0" }}>Page not found · صفحه پیدا نشد</p>
          <p style={{ margin: "1.5rem 0 0" }}>
            <Link href="/" style={{ color: "#4338ca" }}>
              Home · صفحه اصلی
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
