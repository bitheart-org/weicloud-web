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
        <el-descriptions-item label="状态">
          <VmStatusBadge :status="vm.status" />
        </el-descriptions-item>
        <el-descriptions-item label="规格">
          {{ vm.cpu_cores }}C / {{ formatGB(vm.memory_bytes) }}G / {{ formatGB(vm.disk_root_bytes) }}G
        </el-descriptions-item>
      </el-descriptions>
      <VmActions
        v-if="vm"
        style="margin-top: 12px"
        :status="vm.status"
        @start="start"
        @stop="stop"
        @reboot="reboot"
      />
    </el-card>

    <el-card>
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
  </el-space>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import type { VM } from "../../api/admin-vms";
import { getMyVM, getMyVMResource, rebootMyVM, startMyVM, stopMyVM } from "../../api/user-vms";
import ResourceMonitor from "../../components/ResourceMonitor.vue";
import VncConsole from "../../components/VncConsole.vue";
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

async function back() {
  await router.push("/user/vms");
}

function formatGB(bytes: number) {
  return Math.round(bytes / 1024 / 1024 / 1024);
}

</script>
