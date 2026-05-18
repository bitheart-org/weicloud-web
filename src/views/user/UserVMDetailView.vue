<template>
  <div class="page-stack">
    <div class="page-title-row">
      <div>
        <h2 class="page-title">虚拟机详情</h2>
        <div class="page-subtitle">查看实例信息、资源占用并进行远程连接</div>
      </div>
      <el-button @click="back">返回列表</el-button>
    </div>

    <el-card class="modern-card">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <strong>基础信息</strong>
        </div>
      </template>
      <el-descriptions :column="2" border v-if="vm">
        <el-descriptions-item label="名称">{{ vm.name }}</el-descriptions-item>
        <el-descriptions-item label="镜像">{{ vm.image }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <VmStatusBadge :status="vm.status" />
        </el-descriptions-item>
        <el-descriptions-item label="规格">
          {{ vm.cpu_cores }}C / {{ formatGB(vm.memory_bytes) }}G / {{ formatGB(vm.disk_root_bytes) }}G
        </el-descriptions-item>
        <el-descriptions-item label="默认用户名">{{ vm.login_username || "-" }}</el-descriptions-item>
        <el-descriptions-item label="SSH 映射端口">{{ vm.ssh_remote_port || "-" }}</el-descriptions-item>
      </el-descriptions>
      <VmActions
        v-if="vm"
        style="margin-top: 12px"
        :status="vm.status"
        @start="start"
        @stop="stop"
        @reboot="reboot"
      />
      <el-space style="margin-top: 12px">
        <el-button type="danger" @click="passwordDialogVisible = true">修改默认用户密码</el-button>
      </el-space>
    </el-card>

    <el-card class="modern-card">
      <template #header>
        <strong>实时资源监控</strong>
      </template>
      <ResourceMonitor
        :cpu-nanoseconds="resource.cpuNanoseconds"
        :memory-bytes="resource.memoryBytes"
        :memory-total-bytes="vm?.memory_bytes ?? 0"
        :disk-bytes="vm?.disk_root_bytes ?? 0"
      />
    </el-card>

    <VncConsole v-if="vm" :vm-id="vm.id" />
    <VmShellConsole v-if="vm" :vm-id="vm.id" />

    <el-dialog v-model="passwordDialogVisible" title="修改登录密码" width="420px">
      <el-form label-width="110px">
        <el-form-item label="新密码">
          <el-input v-model="newPassword" type="password" show-password placeholder="至少 8 位" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateLoginPassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import type { VM } from "../../api/admin-vms";
import { getMyVM, getMyVMResource, rebootMyVM, startMyVM, stopMyVM, updateMyVMLoginPassword } from "../../api/user-vms";
import ResourceMonitor from "../../components/ResourceMonitor.vue";
import VncConsole from "../../components/VncConsole.vue";
import VmShellConsole from "../../components/VmShellConsole.vue";
import VmActions from "../../components/VmActions.vue";
import VmStatusBadge from "../../components/VmStatusBadge.vue";
import { getApiErrorMessage } from "../../utils/api-error";

const route = useRoute();
const router = useRouter();
const vm = ref<VM | null>(null);
const resource = ref({
  cpuNanoseconds: 0,
  memoryBytes: 0,
});
let timer: number | null = null;
const passwordDialogVisible = ref(false);
const newPassword = ref("");

onMounted(load);
onBeforeUnmount(() => {
  if (timer) {
    window.clearInterval(timer);
    timer = null;
  }
});

async function load() {
  try {
    const res = await getMyVM(String(route.params.id));
    vm.value = res.data;
    await loadResource();
    if (!timer) {
      timer = window.setInterval(() => {
        void loadResource();
      }, 5000);
    }
  } catch (error: any) {
    ElMessage.error(getApiErrorMessage(error, "加载虚拟机详情失败"));
  }
}

async function loadResource() {
  if (!vm.value) return;
  try {
    const res = await getMyVMResource(vm.value.id);
    resource.value = {
      cpuNanoseconds: res.data.cpu_nanoseconds,
      memoryBytes: res.data.memory_bytes,
    };
  } catch {
    // ignore single polling failure
  }
}

async function start() {
  if (!vm.value) return;
  try {
    await startMyVM(vm.value.id);
    ElMessage.success("开机成功");
    await load();
  } catch (error: any) {
    ElMessage.error(getApiErrorMessage(error, "开机失败"));
  }
}

async function stop() {
  if (!vm.value) return;
  try {
    await stopMyVM(vm.value.id);
    ElMessage.success("关机成功");
    await load();
  } catch (error: any) {
    ElMessage.error(getApiErrorMessage(error, "关机失败"));
  }
}

async function reboot() {
  if (!vm.value) return;
  try {
    await rebootMyVM(vm.value.id);
    ElMessage.success("重启成功");
    await load();
  } catch (error: any) {
    ElMessage.error(getApiErrorMessage(error, "重启失败"));
  }
}

async function updateLoginPassword() {
  if (!vm.value) return;
  if (!newPassword.value || newPassword.value.length < 8) {
    ElMessage.warning("请输入至少 8 位的新密码");
    return;
  }
  try {
    await updateMyVMLoginPassword(vm.value.id, newPassword.value);
    ElMessage.success("密码修改成功");
    passwordDialogVisible.value = false;
    newPassword.value = "";
  } catch (error: any) {
    ElMessage.error(getApiErrorMessage(error, "修改密码失败"));
  }
}

async function back() {
  await router.push("/user/vms");
}

function formatGB(bytes: number) {
  return Math.round(bytes / 1024 / 1024 / 1024);
}

</script>
