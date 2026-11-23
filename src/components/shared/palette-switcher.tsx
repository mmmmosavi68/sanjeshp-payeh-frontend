"use client";

import { Palette as PaletteIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isPalette, PALETTES } from "@/lib/palettes";
import { useTheme } from "@/lib/theme";

export function PaletteSwitcher() {
  const t = useTranslations("common");
  const { palette, setPalette } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        aria-label={t("palette")}
        title={t("palette")}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        <PaletteIcon className="size-4" aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={6} className="min-w-44">
        <DropdownMenuLabel>{t("palette")}</DropdownMenuLabel>

        <DropdownMenuRadioGroup
          value={palette}
          onValueChange={(value) => {
            if (isPalette(value)) setPalette(value);
          }}
        >
          {PALETTES.map((option) => (
            <DropdownMenuRadioItem key={option.id} value={option.id}>
              <span
                aria-hidden
                data-palette-swatch={option.id}
                className="size-3.5 shrink-0 rounded-full ring-1 ring-foreground/20"
              />
              {t(option.labelKey as Parameters<typeof t>[0])}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
