import { ELECTRONIC_EXAM_MODE_TITLE_FRAGMENT } from "@/constants/codes";

import type { UniversityExamCapacityExamDto } from "../types";

export const isElectronic = (exam?: UniversityExamCapacityExamDto) =>
  !!exam?.examModeTitle?.includes(ELECTRONIC_EXAM_MODE_TITLE_FRAGMENT);
