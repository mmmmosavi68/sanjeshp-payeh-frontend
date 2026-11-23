import {
  Eye, FileSearch, FileSpreadsheet, FlaskConical, Gauge, History, LayoutDashboard,
  List, Network, Pencil, Plus, Search, Trash2, Users, type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  gauge: Gauge,
  users: Users,
  list: List,
  eye: Eye,
  plus: Plus,
  pencil: Pencil,
  "trash-2": Trash2,
  history: History,
  search: Search,
  "file-spreadsheet": FileSpreadsheet,
  "file-search": FileSearch,
  "flask-conical": FlaskConical,
  network: Network,
};

export function iconFor(icon?: string | null): LucideIcon {
  if (!icon) return LayoutDashboard;

  return iconMap[icon.trim().toLowerCase()] ?? LayoutDashboard;
}

/** آیکن منو بر اساس نام ذخیره‌شده در backend (ناشناخته → LayoutDashboard). */
export function MenuIcon({ name, className }: { name?: string | null; className?: string }) {
  const key = name?.trim().toLowerCase() ?? "";
  const Icon = (key && iconMap[key]) || LayoutDashboard;

  // Icon همیشه از جدول ثابتِ سطح ماژول انتخاب می‌شود (هویت کامپوننت بین رندرها ثابت است).
  // eslint-disable-next-line react-hooks/static-components
  return <Icon className={className} aria-hidden />;
}
