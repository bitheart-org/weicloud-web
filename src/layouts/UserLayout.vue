<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="app-sidebar">
      <el-menu :default-active="activePath" router>
        <el-menu-item index="/user/vms">我的虚拟机</el-menu-item>
        <el-menu-item index="/user/profile">个人信息</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="app-header">
        <strong>WeiCloud User Portal</strong>
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

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const activePath = computed(() => route.path);

async function logout() {
  authStore.clearAuth();
  await router.replace("/login");
}
</script>
