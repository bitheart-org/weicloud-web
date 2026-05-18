<template>
  <el-space direction="vertical" fill :size="16" style="width: 100%">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <strong>虚拟机详情</strong>
          <el-button @click="back">返回列表</el-button>
        </div>
      </template>
      <el-descriptions :column="2" border v-if="vm">
        <el-descriptions-item label="名称">{{ vm.name }}</el-descriptions-item>
        <el-descriptions-item label="镜像">{{ vm.image }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ vm.status }}</el-descriptions-item>
        <el-descriptions-item label="规格">
          {{ vm.cpu_cores }}C / {{ formatGB(vm.memory_bytes) }}G / {{ formatGB(vm.disk_root_bytes) }}G
        </el-descriptions-item>
      </el-descriptions>
      <el-space style="margin-top: 12px">
        <el-button type="success" @click="start">开机</el-button>
        <el-button @click="stop">关机</el-button>
        <el-button type="warning" @click="reboot">重启</el-button>
      </el-space>
    </el-card>

    <VncConsole v-if="vm" :vm-id="vm.id" />
  </el-space>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import type { VM } from "../../api/admin-vms";
import { getMyVM, rebootMyVM, startMyVM, stopMyVM } from "../../api/user-vms";
import VncConsole from "../../components/VncConsole.vue";

const route = useRoute();
const router = useRouter();
const vm = ref<VM | null>(null);

onMounted(load);

async function load() {
  try {
    const res = await getMyVM(String(route.params.id));
    vm.value = res.data;
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "加载虚拟机详情失败");
  }
}

async function start() {
  if (!vm.value) return;
  try {
    await startMyVM(vm.value.id);
    ElMessage.success("开机成功");
    await load();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "开机失败");
  }
}

async function stop() {
  if (!vm.value) return;
  try {
    await stopMyVM(vm.value.id);
    ElMessage.success("关机成功");
    await load();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "关机失败");
  }
}

async function reboot() {
  if (!vm.value) return;
  try {
    await rebootMyVM(vm.value.id);
    ElMessage.success("重启成功");
    await load();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "重启失败");
  }
}

async function back() {
  await router.push("/user/vms");
}

function formatGB(bytes: number) {
  return Math.round(bytes / 1024 / 1024 / 1024);
}
</script>

