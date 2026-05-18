<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="app-sidebar">
      <el-menu :default-active="activePath" router>
        <el-menu-item index="/admin/dashboard">仪表盘</el-menu-item>
        <el-menu-item index="/admin/vms">虚拟机管理</el-menu-item>
        <el-menu-item index="/admin/users">用户管理</el-menu-item>
        <el-menu-item index="/admin/hosts">宿主机管理</el-menu-item>
        <el-menu-item index="/admin/logs">操作日志</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="app-header">
        <strong>WeiCloud Admin</strong>
        <el-button type="danger" link @click="logout">退出登录</el-button>
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

async function logout() {
  authStore.clearAuth();
  await router.replace("/login");
}
</script>
