import { z } from "zod";

type Translate = (key: string) => string;

const nullableInteger = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null || (typeof value === "number" && Number.isNaN(value))) {
    return null;
  }
  return Number(value);
}, z.number().int().nullable());

/** `t` is `useTranslations("validation.codes")`. */
export function createCodeSchema(t: Translate) {
  return z
    .object({
      kind: z.enum(["group", "item"]),
      title: z.string().trim().min(1, t("titleRequired")).max(200, t("titleMax")),
      parentId: nullableInteger,
      primaryCode: nullableInteger,
      subCode: nullableInteger,
      standardCode: nullableInteger,
      additionalInformation: z.string().trim().max(400, t("additionalInformationMax")),
      isActive: z.boolean(),
    })
    .superRefine((value, context) => {
      if (value.kind === "group" && (value.primaryCode === null || value.primaryCode <= 0)) {
        context.addIssue({ code: "custom", path: ["primaryCode"], message: t("primaryCodePositive") });
      }
      if (value.kind === "item") {
        if (value.parentId === null || value.parentId <= 0) {
          context.addIssue({ code: "custom", path: ["parentId"], message: t("groupRequired") });
        }
        if (value.subCode === null || value.subCode < 1) {
          context.addIssue({ code: "custom", path: ["subCode"], message: t("subCodeMin") });
        }
      }
    });
}

type CodeSchema = ReturnType<typeof createCodeSchema>;
export type CodeFormInput = z.input<CodeSchema>;
export type CodeFormValues = z.output<CodeSchema>;
