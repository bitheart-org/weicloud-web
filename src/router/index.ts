import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  {
    path: "/",
    redirect: "/user/profile",
  },
  {
    path: "/login",
    component: () => import("../views/auth/LoginView.vue"),
  },
  {
    path: "/admin",
    component: () => import("../layouts/AdminLayout.vue"),
    meta: { requiresAuth: true, role: "admin" },
    children: [
      {
        path: "",
        redirect: "/admin/users",
      },
      {
        path: "users",
        component: () => import("../views/admin/AdminUsersView.vue"),
      },
    ],
  },
  {
    path: "/user",
    component: () => import("../layouts/UserLayout.vue"),
    meta: { requiresAuth: true, role: "user" },
    children: [
      {
        path: "",
        redirect: "/user/profile",
      },
      {
        path: "profile",
        component: () => import("../views/user/UserProfileView.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const requiresAuth = Boolean(to.meta.requiresAuth);
  const requiredRole = to.meta.role as string | undefined;

  if (!requiresAuth && to.path === "/login" && authStore.isLoggedIn) {
    if (!authStore.user) {
      try {
        await authStore.fetchMe();
      } catch {
        authStore.clearAuth();
        return true;
      }
    }
    return authStore.role === "admin" ? "/admin/users" : "/user/profile";
  }

  if (!requiresAuth) {
    return true;
  }

  if (!authStore.isLoggedIn) {
    return "/login";
  }

  if (!authStore.user) {
    try {
      await authStore.fetchMe();
    } catch {
      authStore.clearAuth();
      return "/login";
    }
  }

  if (requiredRole && authStore.role !== requiredRole) {
    return authStore.role === "admin" ? "/admin/users" : "/user/profile";
  }

  return true;
});

export default router;
