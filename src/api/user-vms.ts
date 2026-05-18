import { http } from "./http";
import type { ApiResponse } from "./auth";
import type { VM } from "./admin-vms";

export async function listMyVMs() {
  const { data } = await http.get<ApiResponse<{ items: VM[] }>>("/user/vms");
  return data;
}

export async function getMyVM(id: string) {
  const { data } = await http.get<ApiResponse<VM>>(`/user/vms/${id}`);
  return data;
}

export async function startMyVM(id: string) {
  const { data } = await http.post<ApiResponse<VM>>(`/user/vms/${id}/start`);
  return data;
}

export async function stopMyVM(id: string) {
  const { data } = await http.post<ApiResponse<VM>>(`/user/vms/${id}/stop`);
  return data;
}

export async function rebootMyVM(id: string) {
  const { data } = await http.post<ApiResponse<VM>>(`/user/vms/${id}/reboot`);
  return data;
}

export async function getMyVMResource(id: string) {
  const { data } = await http.get<ApiResponse<{ cpu_nanoseconds: number; memory_bytes: number }>>(
    `/user/vms/${id}/resource`,
  );
  return data;
}
