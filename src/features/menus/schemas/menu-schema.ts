import { z } from "zod";

type Translate = (key: string) => string;

/** `t` is `useTranslations("validation.menus")`. */
export function createMenuSchema(t: Translate) {
  return z.object({
    menuTitle: z.string().trim().min(1, t("titleRequired")).max(100, t("titleMax")),
    parentId: z.preprocess((value) => (value === "" || value === undefined ? null : value), z.string().uuid(t("parentInvalid")).nullable()),
    pageCode: z.preprocess((value) => {
      if (value === "" || value === null || value === undefined) return null;
      return Number(value);
    }, z.number().int(t("orderInteger")).nullable()),
    path: z.string().trim().max(200, t("pathMax")),
    link: z.string().trim().max(200, t("linkMax")),
    version: z.string().trim().max(100, t("versionMax")),
    controllerName: z.string().trim().max(100, t("controllerMax")),
    actionName: z.string().trim().max(100, t("actionMax")),
    icon: z.string().trim().max(100, t("iconMax")),
    cssClass: z.string().trim().max(50, t("cssClassMax")),
    showMenu: z.boolean(),
    isActive: z.boolean(),
  });
}

type MenuSchema = ReturnType<typeof createMenuSchema>;
export type MenuFormInput = z.input<MenuSchema>;
export type MenuFormValues = z.output<MenuSchema>;
