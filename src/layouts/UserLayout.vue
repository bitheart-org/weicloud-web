<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="app-sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-title">
          <span class="sidebar-dot" />
          <span>WeiCloud Console</span>
        </div>
        <div class="sidebar-subtitle">User Workspace</div>
      </div>
      <el-scrollbar>
        <el-menu :default-active="activePath" router class="sidebar-menu">
          <el-menu-item index="/user/vms">我的虚拟机</el-menu-item>
          <el-menu-item index="/user/profile">个人信息</el-menu-item>
        </el-menu>
      </el-scrollbar>
    </el-aside>
    <el-container>
      <el-header class="app-header">
        <div>
          <div class="header-title">{{ pageTitle }}</div>
          <div class="header-subtitle">查看实例状态，使用 VNC 与 Shell 进行远程操作</div>
        </div>
        <el-space>
          <el-tag type="info" effect="light">USER</el-tag>
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

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const activePath = computed(() => route.path);
const pageTitle = computed(() => (route.path.startsWith("/user/profile") ? "个人信息" : "我的虚拟机"));

async function logout() {
  authStore.clearAuth();
  await router.replace("/login");
}
</script>
