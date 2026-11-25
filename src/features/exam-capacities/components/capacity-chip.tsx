export function Chip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <span className="rounded-md border bg-muted/30 px-2 py-1 text-muted-foreground">
      {label}:{" "}
      <span className="font-medium text-foreground">{value}</span>
    </span>
  );
}
