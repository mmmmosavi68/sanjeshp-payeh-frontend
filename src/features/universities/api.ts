
import { z } from "zod";

import { apiRequest } from "@/lib/api/client";
import { readCodeKey, toApiCodeFields } from "@/features/codes/adapter";
import { loadCodes } from "@/features/codes/code-store";
import type { CodeDto } from "@/features/codes/types";

import type {
  CreateUniversityDto,
  UniversityDto,
  UniversityFilters,
  UpdateUniversityDto,
} from "./types";

const universitySchema = z.object({
  id: z.number(),
  title: z.string(),
  universityTypeId: z.number(),
  universityTypePrimaryCode: z.number().nullish(),
  universityTypeSubCode: z.number().nullish(),
  universityTypeTitle: z.string().nullish(),
  region: z.number(),
  capacityApproved: z.number(),
  parentUniversityId: z.number().nullish(),
  parentUniversityTitle: z.string().nullish(),
  isActive: z.boolean(),
  createdDate: z.string(),
  updatedDate: z.string().nullish(),
});

function toUniversityRecord(
  university: z.infer<typeof universitySchema>,
  codes: readonly CodeDto[],
): UniversityDto {
  return {
    id: university.id,
    title: university.title,
    universityTypeId: university.universityTypeId,
    universityTypeKey: readCodeKey("universityType", { universityTypeId: university.universityTypeId, universityTypePrimaryCode: university.universityTypePrimaryCode, universityTypeSubCode: university.universityTypeSubCode }, codes),
    universityTypeTitle: university.universityTypeTitle ?? null,
    region: university.region,
    capacityApproved: university.capacityApproved,
    parentUniversityId: university.parentUniversityId ?? null,
    parentUniversityTitle: university.parentUniversityTitle ?? null,
    isActive: university.isActive,
    createdDate: university.createdDate,
    updatedDate: university.updatedDate ?? null,
  };
}

/**
 * دریافت فهرست دانشگاه‌ها با فیلترهای اختیاری.
 */
export async function listUniversities(
  filters: UniversityFilters = {},
): Promise<UniversityDto[]> {
  const codes = await loadCodes();
  const universities = await apiRequest("universities", {
    query: {
      search: filters.search,
      ...toApiCodeFields("universityType", filters.universityTypeKey, codes),
      region: filters.region,
      parentUniversityId: filters.parentUniversityId,
      isActive: filters.isActive,
    },
    schema: z.array(universitySchema),
  });

  return universities.map((item) => toUniversityRecord(item, codes));
}

/**
 * دریافت جزئیات یک دانشگاه.
 */
export async function getUniversityById(
  id: number,
): Promise<UniversityDto> {
  const [codes, university] = await Promise.all([loadCodes(), apiRequest(`universities/${id}`, { schema: universitySchema })]);

  return toUniversityRecord(university, codes);
}

/**
 * ایجاد دانشگاه جدید.
 */
export async function createUniversity(
  input: CreateUniversityDto,
): Promise<UniversityDto> {
  const codes = await loadCodes();
  const { universityTypeKey, ...rest } = input;
  const university = await apiRequest("universities", {
    method: "POST",
    body: { ...rest, ...toApiCodeFields("universityType", universityTypeKey, codes) },
    schema: universitySchema,
  });

  return toUniversityRecord(university, codes);
}

/**
 * ویرایش دانشگاه.
 */
export async function updateUniversity(
  id: number,
  input: UpdateUniversityDto,
): Promise<UniversityDto> {
  const codes = await loadCodes();
  const { universityTypeKey, ...rest } = input;
  const university = await apiRequest(`universities/${id}`, {
    method: "PUT",
    body: { ...rest, ...toApiCodeFields("universityType", universityTypeKey, codes) },
    schema: universitySchema,
  });

  return toUniversityRecord(university, codes);
}

/**
 * حذف نرم دانشگاه.
 */
export async function deleteUniversity(id: number): Promise<void> {
  await apiRequest(`universities/${id}`, {
    method: "DELETE",
    schema: z.unknown(),
  });
}
