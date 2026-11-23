import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  hint: string;
  icon: React.ReactNode;
};

export function StatCard({
  label,
  value,
  change,
  trend,
  hint,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="grid size-9 place-items-center rounded-full border bg-secondary text-muted-foreground">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span
          dir="ltr"
          className={cn(
            "inline-flex items-center gap-1 font-medium",
            trend === "up" && "text-success",
            trend === "down" && "text-destructive",
          )}
        >
          {trend === "up" ? (
            <TrendingUp className="size-3.5" aria-hidden />
          ) : null}
          {trend === "down" ? (
            <TrendingDown className="size-3.5" aria-hidden />
          ) : null}
          {change}
        </span>
        {hint}
      </p>
    </div>
  );
}