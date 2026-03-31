import { api } from "./client";

export interface ModelProfile {
  id: string;
  name: string;
  provider: string;
  tier: string;
  capabilities: Record<string, unknown>;
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const modelProfilesApi = {
  async list(params?: { provider?: string; isActive?: boolean }) {
    const query = new URLSearchParams();
    if (params?.provider) query.set("provider", params.provider);
    if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
    const queryString = query.toString();
    const url = `/api/model-profiles${queryString ? `?${queryString}` : ""}`;
    return api.get<ModelProfile[]>(url);
  },

  async get(id: string) {
    return api.get<ModelProfile>(`/api/model-profiles/${id}`);
  },

  async create(data: Partial<ModelProfile>) {
    return api.post<ModelProfile>("/api/model-profiles", data);
  },

  async update(id: string, data: Partial<ModelProfile>) {
    return api.patch<ModelProfile>(`/api/model-profiles/${id}`, data);
  },

  async delete(id: string) {
    return api.delete(`/api/model-profiles/${id}`);
  },
};
