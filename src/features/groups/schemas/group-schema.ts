import { z } from "zod";

type Translate = (key: string) => string;

/** `t` is `useTranslations("validation.groups")`. */
export function createGroupSchema(t: Translate) {
  return z.object({
    groupName: z.string().trim().min(1, t("nameRequired")).max(100, t("nameMax")),
    isActive: z.boolean(),
  });
}

type GroupSchema = ReturnType<typeof createGroupSchema>;
export type GroupFormInput = z.input<GroupSchema>;
export type GroupFormValues = z.output<GroupSchema>;
