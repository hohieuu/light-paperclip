import type {
  CompanySkill,
  CompanySkillCreateRequest,
  CompanySkillDetail,
  CompanySkillFileDetail,
  CompanySkillImportResult,
  CompanySkillListItem,
  CompanySkillProjectScanRequest,
  CompanySkillProjectScanResult,
  CompanySkillUpdateStatus,
} from "@agilo/shared";
import { api } from "./client";

export const companySkillsApi = {
  list: (companyId: string) =>
    api.get<CompanySkillListItem[]>(`/skills`),
  detail: (companyId: string, skillId: string) =>
    api.get<CompanySkillDetail>(
      `/skills/${encodeURIComponent(skillId)}`,
    ),
  updateStatus: (companyId: string, skillId: string) =>
    api.get<CompanySkillUpdateStatus>(
      `/skills/${encodeURIComponent(skillId)}/update-status`,
    ),
  file: (companyId: string, skillId: string, relativePath: string) =>
    api.get<CompanySkillFileDetail>(
      `/skills/${encodeURIComponent(skillId)}/files?path=${encodeURIComponent(relativePath)}`,
    ),
  updateFile: (companyId: string, skillId: string, path: string, content: string) =>
    api.patch<CompanySkillFileDetail>(
      `/skills/${encodeURIComponent(skillId)}/files`,
      { path, content },
    ),
  create: (companyId: string, payload: CompanySkillCreateRequest) =>
    api.post<CompanySkill>(
      `/skills`,
      payload,
    ),
  importFromSource: (companyId: string, source: string) =>
    api.post<CompanySkillImportResult>(
      `/skills/import`,
      { source },
    ),
  scanProjects: (companyId: string, payload: CompanySkillProjectScanRequest = {}) =>
    api.post<CompanySkillProjectScanResult>(
      `/skills/scan-projects`,
      payload,
    ),
  installUpdate: (companyId: string, skillId: string) =>
    api.post<CompanySkill>(
      `/skills/${encodeURIComponent(skillId)}/install-update`,
      {},
    ),
};
