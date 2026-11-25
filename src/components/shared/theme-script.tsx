import Script from "next/script";

import {
  DEFAULT_PALETTE,
  PALETTE_IDS,
  PALETTE_STORAGE_KEY,
} from "@/lib/palettes";

// محتوای ثابت و بدون ورودی کاربر؛ با nonce اجرا می‌شود.
const script = `(function(){try{var r=document.documentElement;var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var ids=${JSON.stringify(
  PALETTE_IDS,
)};var p=localStorage.getItem(${JSON.stringify(PALETTE_STORAGE_KEY)});if(ids.indexOf(p)<0)p=${JSON.stringify(
  DEFAULT_PALETTE,
)};r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";r.dataset.palette=p;}catch(e){}})();`;

export function ThemeScript({ nonce }: { nonce?: string }) {
  return (
    <Script
      id="theme-initializer"
      strategy="beforeInteractive"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
