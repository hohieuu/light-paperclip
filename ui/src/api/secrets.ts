import type { CompanySecret, SecretProviderDescriptor, SecretProvider } from "@agilo/shared";
import { api } from "./client";

export const secretsApi = {
  list: (companyId: string) => api.get<CompanySecret[]>(`/secrets`),
  providers: (companyId: string) =>
    api.get<SecretProviderDescriptor[]>(`/secret-providers`),
  create: (
    companyId: string,
    data: {
      name: string;
      value: string;
      provider?: SecretProvider;
      description?: string | null;
      externalRef?: string | null;
    },
  ) => api.post<CompanySecret>(`/secrets`, data),
  rotate: (id: string, data: { value: string; externalRef?: string | null }) =>
    api.post<CompanySecret>(`/secrets/${id}/rotate`, data),
  update: (
    id: string,
    data: { name?: string; description?: string | null; externalRef?: string | null },
  ) => api.patch<CompanySecret>(`/secrets/${id}`, data),
  remove: (id: string) => api.delete<{ ok: true }>(`/secrets/${id}`),
};
