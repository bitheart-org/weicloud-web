<template>
  <el-container style="min-height: 100vh">
    <el-header style="display: flex; justify-content: space-between; align-items: center">
      <strong>WeiCloud User Portal</strong>
      <el-button type="danger" link @click="logout">退出登录</el-button>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

async function logout() {
  authStore.clearAuth();
  await router.replace("/login");
}
</script>

