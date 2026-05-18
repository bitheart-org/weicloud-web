<template>
  <div class="page-stack">
    <div class="page-title-row">
      <div>
        <h2 class="page-title">个人信息</h2>
        <div class="page-subtitle">当前登录账号的基础资料与角色信息</div>
      </div>
    </div>
    <el-card class="modern-card">
      <template #header>
        <strong>我的信息</strong>
      </template>
      <el-descriptions :column="1" border v-if="authStore.user">
        <el-descriptions-item label="用户名">{{ authStore.user.username }}</el-descriptions-item>
        <el-descriptions-item label="显示名">{{ authStore.user.display_name || "-" }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ authStore.user.email || "-" }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ authStore.user.role }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ authStore.user.status }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();
</script>
