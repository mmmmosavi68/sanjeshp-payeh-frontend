import { z } from "zod";

type Translate = (key: string) => string;

const nullablePositiveInteger = z.preprocess(
  (value) => {
    if (value === "" || value === undefined || value === null || (typeof value === "number" && Number.isNaN(value))) return null;
    return Number(value);
  },
  z.number().int().positive().nullable(),
);

/** `t` is `useTranslations("validation.universities")`. */
export function createUniversitySchema(t: Translate) {
  return z.object({
    title: z.string().trim().min(1, t("titleRequired")).max(200, t("titleMax")),
    /** CodeKey (primaryCode:subCode) of the university type. */
    universityTypeKey: z.string().min(1, t("typeRequired")),
    region: z.preprocess((value) => Number(value), z.number().int().min(1, t("regionRange")).max(11, t("regionRange"))),
    capacityApproved: z.preprocess((value) => Number(value), z.number().int().min(0, t("capacityMin"))),
    parentUniversityId: nullablePositiveInteger,
    isActive: z.boolean(),
  });
}

type UniversitySchema = ReturnType<typeof createUniversitySchema>;
export type UniversityFormInput = z.input<UniversitySchema>;
export type UniversityFormValues = z.output<UniversitySchema>;
