
export interface UniversityDto {
  id: number;
  title: string;
  universityTypeId: number;
  /** primaryCode:subCode */
  universityTypeKey: string | null;
  universityTypeTitle: string | null;
  region: number;
  capacityApproved: number;
  parentUniversityId: number | null;
  parentUniversityTitle: string | null;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

export interface CreateUniversityDto {
  title: string;
  /** CodeKey (primaryCode:subCode); converted to API fields by the codes adapter. */
  universityTypeKey: string;
  region: number;
  capacityApproved: number;
  parentUniversityId: number | null;
}

export interface UpdateUniversityDto extends CreateUniversityDto {
  isActive: boolean;
}

export interface UniversityFilters {
  search?: string;
  /** CodeKey (primaryCode:subCode) */
  universityTypeKey?: string;
  region?: number;
  parentUniversityId?: number;
  isActive?: boolean;
}
