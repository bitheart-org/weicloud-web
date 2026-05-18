import { http } from "./http";
import type { ApiResponse } from "./auth";

export type Host = {
  id: string;
  name: string;
  address: string;
  cpu_cores: number;
  memory_bytes: number;
  status: "online" | "offline" | "maintenance";
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateHostRequest = {
  name: string;
  address: string;
  certificate: string;
  key: string;
};

export type UpdateHostRequest = {
  name?: string;
  address?: string;
  certificate?: string;
  key?: string;
  status?: "online" | "offline" | "maintenance";
};

export async function listHosts() {
  const { data } = await http.get<ApiResponse<{ items: Host[] }>>("/admin/hosts");
  return data;
}

export async function createHost(payload: CreateHostRequest) {
  const { data } = await http.post<ApiResponse<Host>>("/admin/hosts", payload);
  return data;
}

export async function updateHost(id: string, payload: UpdateHostRequest) {
  const { data } = await http.put<ApiResponse<Host>>(`/admin/hosts/${id}`, payload);
  return data;
}

export async function deleteHost(id: string) {
  const { data } = await http.delete<ApiResponse<{ id: string }>>(`/admin/hosts/${id}`);
  return data;
}

export async function syncHost(id: string) {
  const { data } = await http.post<ApiResponse<Host>>(`/admin/hosts/${id}/sync`);
  return data;
}

