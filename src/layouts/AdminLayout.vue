<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="app-sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-title">
          <span class="sidebar-dot" />
          <span>WeiCloud Console</span>
        </div>
        <div class="sidebar-subtitle">Administrator Workspace</div>
      </div>
      <el-scrollbar>
        <el-menu :default-active="activePath" router class="sidebar-menu">
          <el-menu-item index="/admin/dashboard">仪表盘</el-menu-item>
          <el-menu-item index="/admin/vms">虚拟机管理</el-menu-item>
          <el-menu-item index="/admin/users">用户管理</el-menu-item>
          <el-menu-item index="/admin/hosts">宿主机管理</el-menu-item>
          <el-menu-item index="/admin/logs">操作日志</el-menu-item>
        </el-menu>
      </el-scrollbar>
    </el-aside>
    <el-container>
      <el-header class="app-header">
        <div>
          <div class="header-title">{{ pageTitle }}</div>
          <div class="header-subtitle">统一管理计算、用户、宿主机与审计日志</div>
        </div>
        <el-space>
          <el-tag type="success" effect="light">ADMIN</el-tag>
          <el-button type="danger" link @click="logout">退出登录</el-button>
        </el-space>
      </el-header>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const activePath = computed(() => route.path);
const pageTitle = computed(() => {
  if (route.path.startsWith("/admin/dashboard")) return "平台概览";
  if (route.path.startsWith("/admin/vms")) return "虚拟机管理";
  if (route.path.startsWith("/admin/users")) return "用户与权限";
  if (route.path.startsWith("/admin/hosts")) return "宿主机资源池";
  if (route.path.startsWith("/admin/logs")) return "操作审计";
  return "WeiCloud 管理台";
});

async function logout() {
  authStore.clearAuth();
  await router.replace("/login");
}
</script>
