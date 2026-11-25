import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

type IconButtonProps = Omit<ComponentProps<typeof Button>, "size" | "children" | "aria-label"> & {
  /** Used for both tooltip and screen readers. */
  label: string;
  icon: React.ReactNode;
};

export function IconButton({ label, icon, variant = "ghost", ...props }: IconButtonProps) {
  return (
    <Button type="button" variant={variant} size="icon-sm" title={label} aria-label={label} {...props}>
      {icon}
    </Button>
  );
}
