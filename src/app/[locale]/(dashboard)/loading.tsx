import { Skeleton } from "@/components/ui/skeleton";

/** اسکلت پیش‌فرض همه‌ی صفحات داشبورد؛ هنگام جابه‌جایی بین مسیرها نمایش داده می‌شود. */
export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" role="status">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-56" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
