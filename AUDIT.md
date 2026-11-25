# AUDIT.md — وضعیت پروژه قبل از Refactor

> منبع: `mmmmosavi68/sanjeshp-payeh-frontend` (commit `f16c43f`) — Next.js 16 (App Router) + Tailwind 4 + next-intl (fa/en).
> Baseline: `tsc` سبز، `build` سبز، `lint` بدون خطا ولی ۴۱ هشدار.

## ۱) فایل‌های بزرگ / چندمسئولیتی (خط)
| فایل | خط |
|---|---|
| features/exam-capacities/components/exam-capacity-manager.tsx | 1271 |
| features/users/components/users-table.tsx | 950 |
| features/groups/components/group-members-dialog.tsx | 796 |
| features/audit-logs/components/audit-logs-table.tsx | 793 |
| features/users/components/user-form-dialog.tsx | 763 |
| features/users/components/user-menu-access-dialog.tsx | 644 |
| features/groups/components/group-menu-access-dialog.tsx | 594 |
| features/groups/components/groups-table.tsx | 544 |
| student-registrations (form-dialog / manager) | 499 / 493 |
| features/menus/components/menus-tree.tsx, menu-form-sheet.tsx | 496 / 474 |
| features/exams/components/exam-form-sheet.tsx | 422 |
| features/codes/components/codes-tree.tsx (**بدون Reference = کد مرده**) | 422 |
| app/[locale]/(dashboard)/codes/page.tsx | 422 (+۲۱ متن Hardcode) |
| app/[locale]/(dashboard)/exams/page.tsx, universities/page.tsx | 376 / 374 |

## ۲) کد تکراری
- ۴ الگوی جدول متفاوت (۴ جدول با `components/ui/table` + ۳ جدول با `<table>` خام) با هدر/وضعیت/عملیات هم‌شکل نبودند.
- هر صفحه فیلتر + Pagination + حالت‌های Loading/Empty/Error را جداگانه پیاده‌سازی کرده بود.
- Badge «فعال/غیرفعال» ≥ ۶ بار کپی شده بود.
- الگوی `error instanceof Error ? error.message : "..."` در ۱۳ فایل (نمایش مستقیم پیام سرور، بدون i18n / errorCode).
- ۳ نوع Select هم‌زمان: `<select>` native (۱۱ مورد)، Radix `Select` (۱۳ مورد)، `SearchableSelect` (فقط ۱ صفحه، بدون جستجوی ی/ي ک/ك و ارقام).

## ۳) مشکلات i18n
- ~۶۵ متن Hardcode (Validation schemaهای zod، placeholderها، تیتر/عنوان‌های `codes/page.tsx`، پیش‌فرض‌های SearchableSelect، `aria-label`ها).
- `dir="rtl"` ثابت در Dialog مدیریت ظرفیت مهمان (خراب شدن LTR).
- `scripts/check-i18n.mjs` فقط پارییتی کلید fa/en را چک می‌کرد، نه Hardcode.

## ۴) کدها / Optionها
- `exams/options.ts` و `universities/options.ts`: پیدا کردن گروه با `title.trim() === "نوع آزمون" | "نحوه برگزاری" | "نوع دانشگاه"` و مقدار Option = `id` (شکننده؛ تغییر عنوان = خرابی).
- `exam-capacity-manager`: تشخیص «الکترونیک» با `title.includes("الکترونیک")`.
- `sidebar/menu-tree.ts`: حذف ریشه با `menuTitle === "منوها"`.
- `users/user-form-dialog`: شماره گروه‌ها (۱..۵) inline در کامپوننت.

## ۵) مدیریت خطا
- `apiRequest` فیلد `errorCode` را نمی‌خواند؛ برای 401/403 بدنه خالی فرض نمی‌کرد؛ Timeout نداشت؛ خطاهای Validation فیلدی نداشت؛ پیام خطای Network یک `ApiError("network")` بدون ترجمه بود.
- BFF پاسخ 401/403/502 را بدون `errorCode` برمی‌گرداند.

## ۶) امنیت (بررسی)
| مورد | وضعیت |
|---|---|
| ذخیره توکن | ✅ HttpOnly Cookie از طریق BFF (`/api/bff/*`)، Access/Refresh در JS در دسترس نیست |
| CSRF | ✅ Double-submit + بررسی Origin در BFF |
| Open Redirect | ✅ `lib/security/return-url.ts` (Allowlist مسیر داخلی) |
| Route Guard | ✅ `proxy.ts` default-deny + `PermissionProvider/Can` برای منو/دکمه |
| CSP / Headers | ✅ nonce-based CSP، X-Frame-Options، Referrer-Policy، nosniff، Permissions-Policy، HSTS (prod) |
| XSS | ✅ تنها `dangerouslySetInnerHTML` در `theme-script.tsx` است (اسکریپت ثابت + `JSON.stringify` ثابت‌های داخلی، بدون داده کاربر) |
| `console.log` | ✅ نبود؛ فقط `console.error` با مسیر فیلد/پیام عمومی (بدون داده شخصی) |
| localStorage | فقط تم/پالت/وضعیت سایدبار (غیرحساس) |
| صفحه `api-test` | ✅ در production با `notFound()` بسته است (مگر `ENABLE_API_TEST=1`) |
| `npm audit` | ۴ مورد Moderate، همگی در `drizzle-kit → @esbuild-kit → esbuild` (devDependency قالب پلتفرم) — Fix فقط با Breaking |

## ۷) ناهماهنگی UI
- ارتفاع کنترل‌ها (h-8/h-9)، فرمت Badge، جای دکمه‌ها و Empty State بین صفحات متفاوت بود؛ `text-right` فیزیکی در جدول‌ها.
- Pagination سمت کلاینت فقط در بعضی جدول‌ها.
