export function MenuBadge({ count }: { count?: number }) {
  if (!count || count <= 0) return null;

  return (
    <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
      {count > 99 ? "99+" : count}
    </span>
  );
}
