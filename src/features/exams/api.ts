import { z } from "zod";
import { apiRequest } from "@/lib/api/client";
import { readCodeKey, toApiCodeFields } from "@/features/codes/adapter";
import { loadCodes } from "@/features/codes/code-store";
import type { CodeDto } from "@/features/codes/types";

import type {
  CreateExamDto,
  ExamDto,
  ExamFilters,
  ExamSessionOption,
  UpdateExamDto,
} from "./types";

const examSchema = z.object({
  id: z.string(),
  title: z.string(),

  examSessionId: z.string(),
  examSessionTitle: z.string().nullish(),
  examDate: z.string(),

  examTypeId: z.number(),
  examTypePrimaryCode: z.number().nullish(),
  examTypeSubCode: z.number().nullish(),
  examTypeTitle: z.string().nullish(),

  examModeId: z.number(),
  examModePrimaryCode: z.number().nullish(),
  examModeSubCode: z.number().nullish(),
  examModeTitle: z.string().nullish(),

  registrationStartDate: z.string(),
  registrationEndDate: z.string(),
  editStartDate: z.string().nullish(),
  editEndDate: z.string().nullish(),

  description: z.string().nullish(),
  isActive: z.boolean(),
  createdDate: z.string(),
  updatedDate: z.string().nullish(),
});

const sessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  examDate: z.string(),
});

function toExamDto(value: z.infer<typeof examSchema>, codes: readonly CodeDto[]): ExamDto {
  const { examTypePrimaryCode, examTypeSubCode, examModePrimaryCode, examModeSubCode, ...rest } = value;
  return {
    ...rest,
    examTypeKey: readCodeKey("examType", { examTypeId: value.examTypeId, examTypePrimaryCode, examTypeSubCode }, codes),
    examModeKey: readCodeKey("examMode", { examModeId: value.examModeId, examModePrimaryCode, examModeSubCode }, codes),
    examSessionTitle: value.examSessionTitle ?? null,
    examTypeTitle: value.examTypeTitle ?? null,
    examModeTitle: value.examModeTitle ?? null,
    editStartDate: value.editStartDate ?? null,
    editEndDate: value.editEndDate ?? null,
    description: value.description ?? null,
    updatedDate: value.updatedDate ?? null,
  };
}

export async function listExams(
  filters: ExamFilters = {},
): Promise<ExamDto[]> {
  const codes = await loadCodes();
  const result = await apiRequest("exams", {
    query: {
      search: filters.search,
      examSessionId: filters.examSessionId,
      ...toApiCodeFields("examType", filters.examTypeKey, codes),
      ...toApiCodeFields("examMode", filters.examModeKey, codes),
      isActive: filters.isActive,
    },
    schema: z.array(examSchema),
  });

  return result.map((item) => toExamDto(item, codes));
}

export async function getExamById(id: string): Promise<ExamDto> {
  const [codes, result] = await Promise.all([
    loadCodes(),
    apiRequest(`exams/${id}`, { schema: examSchema }),
  ]);

  return toExamDto(result, codes);
}

export async function createExam(
  input: CreateExamDto,
): Promise<ExamDto> {
  const codes = await loadCodes();
  const { examTypeKey, examModeKey, ...rest } = input;
  const result = await apiRequest("exams", {
    method: "POST",
    body: { ...rest, ...toApiCodeFields("examType", examTypeKey, codes), ...toApiCodeFields("examMode", examModeKey, codes) },
    schema: examSchema,
  });

  return toExamDto(result, codes);
}

export async function updateExam(
  id: string,
  input: UpdateExamDto,
): Promise<ExamDto> {
  const codes = await loadCodes();
  const { examTypeKey, examModeKey, ...rest } = input;
  const result = await apiRequest(`exams/${id}`, {
    method: "PUT",
    body: { ...rest, ...toApiCodeFields("examType", examTypeKey, codes), ...toApiCodeFields("examMode", examModeKey, codes) },
    schema: examSchema,
  });

  return toExamDto(result, codes);
}

export async function deleteExam(id: string): Promise<void> {
  await apiRequest(`exams/${id}`, {
    method: "DELETE",
    schema: z.unknown(),
  });
}

export async function listExamSessions(): Promise<ExamSessionOption[]> {
  return apiRequest("examSessions", {
    schema: z.array(sessionSchema),
  });
}