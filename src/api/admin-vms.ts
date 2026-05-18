import { http } from "./http";
import type { ApiResponse } from "./auth";

export type VM = {
  id: string;
  incus_instance: string;
  host_id: string;
  owner_id: string | null;
  name: string;
  image: string;
  cpu_cores: number;
  memory_bytes: number;
  disk_root_bytes: number;
  network_ingress: string;
  network_egress: string;
  status: "running" | "stopped" | "creating" | "error";
  vnc_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type VMImage = {
  alias: string;
  architecture: string;
  description: string;
  type: string;
};

export type CreateVMRequest = {
  name: string;
  image: string;
  host_id: string;
  owner_id?: string;
  cpu_cores: number;
  memory_bytes: number;
  disk_root_bytes: number;
  network_ingress?: string;
  network_egress?: string;
};

export async function listVMs() {
  const { data } = await http.get<ApiResponse<{ items: VM[] }>>("/admin/vms");
  return data;
}

export async function listImages() {
  const { data } = await http.get<ApiResponse<{ items: VMImage[] }>>("/admin/images");
  return data;
}

export async function createVM(payload: CreateVMRequest) {
  const { data } = await http.post<ApiResponse<VM>>("/admin/vms", payload);
  return data;
}

export async function deleteVM(id: string) {
  const { data } = await http.delete<ApiResponse<{ id: string }>>(`/admin/vms/${id}`);
  return data;
}

export async function updateVMConfig(id: string, cpuCores: number, memoryBytes: number) {
  const { data } = await http.put<ApiResponse<VM>>(`/admin/vms/${id}/config`, {
    cpu_cores: cpuCores,
    memory_bytes: memoryBytes,
  });
  return data;
}

export async function resizeVMDisk(id: string, diskRootBytes: number) {
  const { data } = await http.post<ApiResponse<VM>>(`/admin/vms/${id}/disk`, {
    disk_root_bytes: diskRootBytes,
  });
  return data;
}

export async function updateVMNetwork(id: string, ingress: string, egress: string) {
  const { data } = await http.put<ApiResponse<VM>>(`/admin/vms/${id}/network`, { ingress, egress });
  return data;
}

export async function assignVM(id: string, ownerId: string) {
  const { data } = await http.put<ApiResponse<VM>>(`/admin/vms/${id}/assign`, { owner_id: ownerId });
  return data;
}

export async function startVM(id: string) {
  const { data } = await http.post<ApiResponse<VM>>(`/admin/vms/${id}/start`);
  return data;
}

export async function stopVM(id: string) {
  const { data } = await http.post<ApiResponse<VM>>(`/admin/vms/${id}/stop`);
  return data;
}

export async function rebootVM(id: string) {
  const { data } = await http.post<ApiResponse<VM>>(`/admin/vms/${id}/reboot`);
  return data;
}
