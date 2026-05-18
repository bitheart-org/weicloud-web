import { http } from "./http";
import type { ApiResponse, UserInfo } from "./auth";

export type ListUsersResponse = {
  items: UserInfo[];
  total: number;
  page: number;
  page_size: number;
};

export type CreateUserRequest = {
  username: string;
  password: string;
  display_name: string;
  email: string;
  role: "admin" | "user";
};

export type UpdateUserRequest = {
  display_name?: string;
  email?: string;
  role?: "admin" | "user";
  status?: "active" | "disabled";
};

export async function listUsers(params: { page: number; pageSize: number; query: string }) {
  const { data } = await http.get<ApiResponse<ListUsersResponse>>("/admin/users", {
    params: {
      page: params.page,
      page_size: params.pageSize,
      query: params.query,
    },
  });
  return data;
}

export async function createUser(payload: CreateUserRequest) {
  const { data } = await http.post<ApiResponse<UserInfo>>("/admin/users", payload);
  return data;
}

export async function updateUser(id: string, payload: UpdateUserRequest) {
  const { data } = await http.put<ApiResponse<UserInfo>>(`/admin/users/${id}`, payload);
  return data;
}

export async function disableUser(id: string) {
  const { data } = await http.delete<ApiResponse<{ id: string }>>(`/admin/users/${id}`);
  return data;
}

export async function resetUserPassword(id: string, password: string) {
  const { data } = await http.put<ApiResponse<{ id: string }>>(`/admin/users/${id}/password`, { password });
  return data;
}

