import axios from "axios";
import router from "../router";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("weicloud_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("weicloud_token");
      if (router.currentRoute.value.path !== "/login") {
        await router.replace("/login");
      }
    }
    return Promise.reject(error);
  },
);

