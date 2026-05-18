import { defineStore } from "pinia";
import { login, me, type UserInfo } from "../api/auth";

type AuthState = {
  token: string;
  user: UserInfo | null;
};

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: localStorage.getItem("weicloud_token") || "",
    user: null,
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    role: (state) => state.user?.role || "",
  },
  actions: {
    setToken(token: string) {
      this.token = token;
      localStorage.setItem("weicloud_token", token);
    },
    clearAuth() {
      this.token = "";
      this.user = null;
      localStorage.removeItem("weicloud_token");
    },
    async loginWithPassword(username: string, password: string) {
      const response = await login({ username, password });
      this.setToken(response.data.token);
      this.user = response.data.user;
    },
    async fetchMe() {
      if (!this.token) {
        this.user = null;
        return;
      }
      const response = await me();
      this.user = response.data;
    },
  },
});

