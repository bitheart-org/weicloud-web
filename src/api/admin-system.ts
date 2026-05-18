import { http } from "./http";
import type { ApiResponse } from "./auth";

export type DashboardData = {
  hosts_total: number;
  hosts_online: number;
  vms_total: number;
  vms_running: number;
  vms_stopped: number;
  cpu_cores_total: number;
  cpu_cores_used: number;
  memory_bytes_total: number;
  memory_bytes_used: number;
};

export type OperationLog = {
  id: string;
  user_id: string;
  instance_id: string | null;
  action: string;
  detail: string;
  created_at: string;
};

export type OperationLogList = {
  items: OperationLog[];
  total: number;
  page: number;
  page_size: number;
};

export type VMResource = {
  cpu_nanoseconds: number;
  memory_bytes: number;
};

export async function getDashboard() {
  const { data } = await http.get<ApiResponse<DashboardData>>("/admin/dashboard");
  return data;
}

export async function getOperationLogs(page: number, pageSize: number) {
  const { data } = await http.get<ApiResponse<OperationLogList>>("/admin/logs", {
    params: { page, page_size: pageSize },
  });
  return data;
}

export async function getAdminVMResource(id: string) {
  const { data } = await http.get<ApiResponse<VMResource>>(`/admin/vms/${id}/resource`);
  return data;
}

