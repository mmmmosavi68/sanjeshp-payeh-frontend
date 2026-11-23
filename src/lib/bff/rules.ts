import "server-only";

/**
 * Allowlist مسیر و متد BFF. هر چیزی که اینجا نباشد 404 می‌گیرد؛
 * بنابراین SSRF، path traversal و دسترسی به مسیرهای دلخواه backend ممکن نیست.
 */
export type Method = "GET" | "POST" | "PUT" | "DELETE";
export type SessionEffect = "none" | "create" | "clear" | "preserve";

export type Rule = {
  method: Method;
  pattern: RegExp;
  auth: boolean;
  session: SessionEffect;
};

export const GUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

const rules: Rule[] = [
  { method: "GET", pattern: /^auth\/config$/i, auth: false, session: "none" },
  { method: "GET", pattern: /^auth\/captcha$/i, auth: false, session: "none" },
  { method: "POST", pattern: /^auth\/otp\/request$/i, auth: false, session: "none" },
  { method: "POST", pattern: /^auth\/otp\/verify$/i, auth: false, session: "create" },
  { method: "POST", pattern: /^auth\/login$/i, auth: false, session: "create" },
  { method: "POST", pattern: /^auth\/login\/verify$/i, auth: false, session: "create" },
  { method: "POST", pattern: /^auth\/login\/resend$/i, auth: false, session: "none" },

  // خروج از دستگاه جاری
  { method: "POST", pattern: /^auth\/logout$/i, auth: true, session: "clear" },

  // خروج از سایر دستگاه‌ها
  { method: "POST", pattern: /^auth\/logout-all$/i, auth: true, session: "preserve" },
  { method: "GET", pattern: /^auth\/me$/i, auth: true, session: "none" },
  { method: "GET", pattern: /^auth\/sessions$/i, auth: true, session: "none" },
  { method: "DELETE", pattern: new RegExp(`^auth/sessions/${GUID}$`, "i"), auth: true, session: "none" },

  { method: "GET", pattern: /^roles$/i, auth: true, session: "none" },
  { method: "GET", pattern: /^permissions\/me$/i, auth: true, session: "none" },
  { method: "GET", pattern: /^auditlogs$/i, auth: true, session: "none" },
  { method: "GET", pattern: /^home\/Test$/i, auth: true, session: "none" },
  { method: "POST", pattern: /^home\/Test$/i, auth: true, session: "none" },

  // Users
  { method: "GET", pattern: /^users$/i, auth: true, session: "none" },
  { method: "POST", pattern: /^users$/i, auth: true, session: "none" },
  { method: "GET", pattern: new RegExp(`^users/${GUID}$`, "i"), auth: true, session: "none" },
  { method: "PUT", pattern: new RegExp(`^users/${GUID}$`, "i"), auth: true, session: "none" },
  { method: "DELETE", pattern: new RegExp(`^users/${GUID}$`, "i"), auth: true, session: "none" },

  // Codes - اطلاعات پایه
  { method: "GET", pattern: /^codes\/groups$/i, auth: true, session: "none" },
  { method: "GET", pattern: /^codes\/groups\/\d{1,12}\/items$/i, auth: true, session: "none" },
  { method: "GET", pattern: /^codes$/i, auth: true, session: "none" },
  { method: "GET", pattern: /^codes\/\d{1,12}$/i, auth: true, session: "none" },
  { method: "POST", pattern: /^codes$/i, auth: true, session: "none" },
  { method: "PUT", pattern: /^codes\/\d{1,12}$/i, auth: true, session: "none" },
  { method: "DELETE", pattern: /^codes\/\d{1,12}$/i, auth: true, session: "none" },

  // User Management
  {
    method: "GET",
    pattern: /^user-management\/available-menus$/i,
    auth: true,
    session: "none",
  },
  {
    method: "GET",
    pattern: new RegExp(`^user-management/${GUID}/menu-access$`, "i"),
    auth: true,
    session: "none",
  },
  {
    method: "PUT",
    pattern: new RegExp(`^user-management/${GUID}/menu-access$`, "i"),
    auth: true,
    session: "none",
  },
  {
    method: "POST",
    pattern: /^user-management\/bulk\/deactivate$/i,
    auth: true,
    session: "none",
  },
  {
    method: "DELETE",
    pattern: /^user-management\/bulk$/i,
    auth: true,
    session: "none",
  },
  { method: "POST", pattern: /^UserManagement\/bulk\/deactivate$/i, auth: true, session: "none" },
  { method: "DELETE", pattern: /^UserManagement\/bulk$/i, auth: true, session: "none" },

  // Groups
  { method: "GET", pattern: /^groups$/i, auth: true, session: "none" },
  { method: "POST", pattern: /^groups$/i, auth: true, session: "none" },
  { method: "GET", pattern: new RegExp(`^groups/${GUID}$`, "i"), auth: true, session: "none" },
  { method: "PUT", pattern: new RegExp(`^groups/${GUID}$`, "i"), auth: true, session: "none" },
  { method: "DELETE", pattern: new RegExp(`^groups/${GUID}$`, "i"), auth: true, session: "none" },
  { method: "GET", pattern: new RegExp(`^groups/${GUID}/users$`, "i"), auth: true, session: "none" },
  { method: "POST", pattern: new RegExp(`^groups/${GUID}/users$`, "i"), auth: true, session: "none" },
  { method: "DELETE", pattern: new RegExp(`^groups/${GUID}/users/${GUID}$`, "i"), auth: true, session: "none" },
  { method: "POST", pattern: new RegExp(`^groups/${GUID}/users/bulk$`, "i"), auth: true, session: "none" },
  { method: "DELETE", pattern: new RegExp(`^groups/${GUID}/users/bulk$`, "i"), auth: true, session: "none" },
  { method: "GET", pattern: /^groups\/available-menus$/i, auth: true, session: "none" },
  { method: "GET", pattern: new RegExp(`^groups/${GUID}/menu-access$`, "i"), auth: true, session: "none" },
  { method: "PUT", pattern: new RegExp(`^groups/${GUID}/menu-access$`, "i"), auth: true, session: "none" },

  // Menus
  { method: "GET", pattern: /^menus$/i, auth: true, session: "none" },
  { method: "POST", pattern: /^menus$/i, auth: true, session: "none" },
  { method: "GET", pattern: new RegExp(`^menus/${GUID}$`, "i"), auth: true, session: "none" },
  { method: "PUT", pattern: new RegExp(`^menus/${GUID}$`, "i"), auth: true, session: "none" },
  { method: "DELETE", pattern: new RegExp(`^menus/${GUID}$`, "i"), auth: true, session: "none" },

  // Universities
  { method: "GET", pattern: /^universities$/i, auth: true, session: "none" },
  { method: "GET", pattern: /^universities\/\d{1,12}$/i, auth: true, session: "none" },
  { method: "POST", pattern: /^universities$/i, auth: true, session: "none" },
  { method: "PUT", pattern: /^universities\/\d{1,12}$/i, auth: true, session: "none" },
  { method: "DELETE", pattern: /^universities\/\d{1,12}$/i, auth: true, session: "none" },

  // Exam Sessions
  { method: "GET", pattern: /^examSessions$/i, auth: true, session: "none" },
  { method: "GET", pattern: new RegExp(`^examSessions/${GUID}$`, "i"), auth: true, session: "none" },
  { method: "POST", pattern: /^examSessions$/i, auth: true, session: "none" },
  { method: "PUT", pattern: new RegExp(`^examSessions/${GUID}$`, "i"), auth: true, session: "none" },
  { method: "DELETE", pattern: new RegExp(`^examSessions/${GUID}$`, "i"), auth: true, session: "none" },

  // Exams
  { method: "GET", pattern: /^exams$/i, auth: true, session: "none" },
  { method: "GET", pattern: new RegExp(`^exams/${GUID}$`, "i"), auth: true, session: "none" },
  { method: "POST", pattern: /^exams$/i, auth: true, session: "none" },
  { method: "PUT", pattern: new RegExp(`^exams/${GUID}$`, "i"), auth: true, session: "none" },
  { method: "DELETE", pattern: new RegExp(`^exams/${GUID}$`, "i"), auth: true, session: "none" },

  // University Access
  {
    method: "GET",
    pattern: /^user-management\/available-universities$/i,
    auth: true,
    session: "none",
  },
  {
    method: "GET",
    pattern: new RegExp(`^user-management/${GUID}/university-access$`, "i"),
    auth: true,
    session: "none",
  },
  {
    method: "PUT",
    pattern: new RegExp(`^user-management/${GUID}/university-access$`, "i"),
    auth: true,
    session: "none",
  },

  // University Exam Capacities
  {
    method: "GET",
    pattern: /^universityExamCapacities\/my-universities$/i,
    auth: true,
    session: "none",
  },
  {
    method: "GET",
    pattern: /^universityExamCapacities\/universities\/\d{1,12}\/active-exams$/i,
    auth: true,
    session: "none",
  },
  {
    method: "PUT",
    pattern: new RegExp(`^universityExamCapacities/universities/\\d{1,12}/exams/${GUID}/capacity$`, "i"),
    auth: true,
    session: "none",
  },

  // دریافت ظرفیت دانشگاه‌های مهمان
  {
    method: "GET",
    pattern: new RegExp(`^universityExamCapacities/universities/\\d{1,12}/exams/${GUID}/guest-capacities$`, "i"),
    auth: true,
    session: "none",
  },

  // ثبت یا ویرایش ظرفیت دانشگاه مهمان
  {
    method: "PUT",
    pattern: new RegExp(`^universityExamCapacities/universities/\\d{1,12}/exams/${GUID}/guest-capacities/\\d{1,12}$`, "i"),
    auth: true,
    session: "none",
  },

  // Student Registrations
  {
    method: "GET",
    pattern: /^examRegistrations\/universities$/i,
    auth: true,
    session: "none",
  },
  {
    method: "GET",
    pattern: /^examRegistrations\/exams$/i,
    auth: true,
    session: "none",
  },
  {
    method: "GET",
    pattern: /^examRegistrations\/options$/i,
    auth: true,
    session: "none",
  },
  {
    method: "GET",
    pattern: /^examRegistrations$/i,
    auth: true,
    session: "none",
  },
  {
    method: "POST",
    pattern: /^examRegistrations$/i,
    auth: true,
    session: "none",
  },
  {
    method: "GET",
    pattern: new RegExp(`^examRegistrations/${GUID}$`, "i"),
    auth: true,
    session: "none",
  },
  {
    method: "PUT",
    pattern: new RegExp(`^examRegistrations/${GUID}$`, "i"),
    auth: true,
    session: "none",
  },
  {
    method: "DELETE",
    pattern: new RegExp(`^examRegistrations/${GUID}$`, "i"),
    auth: true,
    session: "none",
  },
];

export function findRule(method: string, path: string): Rule | undefined {
  return rules.find((rule) => rule.method === method && rule.pattern.test(path));
}

/** نام کنترلر UserManagement در backend با حرف بزرگ است. */
export function toBackendPath(path: string): string {
  return path.replace(/^user-management(?=\/|$)/i, "UserManagement");
}
