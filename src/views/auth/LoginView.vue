<template>
  <div class="login-page">
    <el-card class="login-card">
      <div class="login-brand">
        <span class="brand-dot" />
        <span>WeiCloud Console</span>
      </div>
      <h2 class="login-title">欢迎登录</h2>
      <p class="login-subtitle">继续访问虚拟机与宿主机管理模块</p>
      <el-form :model="form" @submit.prevent="onSubmit">
        <el-form-item label="用户名">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" autocomplete="current-password" show-password />
        </el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit">登录</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { getApiErrorMessage } from "../../utils/api-error";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const form = reactive({
  username: "",
  password: "",
});

async function onSubmit() {
  if (!form.username || !form.password) {
    ElMessage.warning("请输入用户名和密码");
    return;
  }

  loading.value = true;
  try {
    await authStore.loginWithPassword(form.username, form.password);
    ElMessage.success("登录成功");
    await router.replace(authStore.role === "admin" ? "/admin/dashboard" : "/user/vms");
  } catch (error: any) {
    ElMessage.error(getApiErrorMessage(error, "登录失败"));
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background:
    radial-gradient(1200px 500px at 0% 0%, rgba(14, 132, 32, 0.09), transparent),
    radial-gradient(900px 400px at 100% 100%, rgba(14, 132, 32, 0.07), transparent),
    #f6f7f9;
}

.login-card {
  width: 420px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.brand-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #0e8420;
}

.login-title {
  margin: 14px 0 4px;
}

.login-subtitle {
  margin: 0 0 14px;
  color: #6b7280;
}
</style>
