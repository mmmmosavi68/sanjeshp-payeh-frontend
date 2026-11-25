export interface ExamDto {
  id: string;
  title: string;

  examSessionId: string;
  examSessionTitle: string | null;
  examDate: string;

  examTypeId: number;
  /** primaryCode:subCode — the value used by every Select/filter. */
  examTypeKey: string | null;
  examTypeTitle: string | null;

  examModeId: number;
  examModeKey: string | null;
  examModeTitle: string | null;

  registrationStartDate: string;
  registrationEndDate: string;
  editStartDate: string | null;
  editEndDate: string | null;

  description: string | null;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

export interface ExamSessionOption {
  id: string;
  title: string;
  examDate: string;
}

export interface ExamFilters {
  search?: string;
  examSessionId?: string;
  /** CodeKey (primaryCode:subCode) */
  examTypeKey?: string;
  examModeKey?: string;
  isActive?: boolean;
}

export interface CreateExamDto {
  title: string;
  examSessionId: string;
  /** CodeKey (primaryCode:subCode); converted to API fields by the codes adapter. */
  examTypeKey: string;
  examModeKey: string;
  registrationStartDate: string;
  registrationEndDate: string;
  editStartDate: string | null;
  editEndDate: string | null;
  description: string | null;
}

export interface UpdateExamDto extends CreateExamDto {
  isActive: boolean;
}