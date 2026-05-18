import { http } from "./http";

export type UserInfo = {
  id: string;
  username: string;
  display_name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "disabled";
};

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: UserInfo;
};

export async function login(payload: LoginRequest) {
  const { data } = await http.post<ApiResponse<LoginResponse>>("/auth/login", payload);
  return data;
}

export async function me() {
  const { data } = await http.get<ApiResponse<UserInfo>>("/auth/me");
  return data;
}

