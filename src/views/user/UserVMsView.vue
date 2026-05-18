<template>
  <el-space direction="vertical" fill :size="16" style="width: 100%">
    <el-card>
      <el-button type="primary" @click="loadVMs">刷新</el-button>
    </el-card>

    <el-card>
      <el-table :data="vms" v-loading="loading">
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column prop="image" label="镜像" min-width="170" />
        <el-table-column label="规格" min-width="180">
          <template #default="{ row }">
            {{ row.cpu_cores }}C / {{ formatGB(row.memory_bytes) }}G / {{ formatGB(row.disk_root_bytes) }}G
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="实时资源" min-width="200">
          <template #default="{ row }">{{ resourceText(row.id) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-space>
              <el-button size="small" type="success" @click="start(row.id)">开机</el-button>
              <el-button size="small" @click="stop(row.id)">关机</el-button>
              <el-button size="small" type="warning" @click="reboot(row.id)">重启</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </el-space>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { getMyVMResource, listMyVMs, rebootMyVM, startMyVM, stopMyVM } from "../../api/user-vms";
import type { VM } from "../../api/admin-vms";

const loading = ref(false);
const vms = ref<VM[]>([]);
const vmResources = ref<Record<string, { cpu: number; memory: number }>>({});

onMounted(loadVMs);

async function loadVMs() {
  loading.value = true;
  try {
    const res = await listMyVMs();
    vms.value = res.data.items;
    await Promise.all(vms.value.map((vm) => loadResource(vm.id)));
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "加载虚拟机失败");
  } finally {
    loading.value = false;
  }

  async function loadResource(id: string) {
    try {
      const res = await getMyVMResource(id);
      vmResources.value[id] = {
        cpu: res.data.cpu_nanoseconds,
        memory: res.data.memory_bytes,
      };
    } catch {
      vmResources.value[id] = { cpu: 0, memory: 0 };
    }
  }
}

async function start(id: string) {
  try {
    await startMyVM(id);
    ElMessage.success("开机成功");
    await loadVMs();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "开机失败");
  }
}

async function stop(id: string) {
  try {
    await stopMyVM(id);
    ElMessage.success("关机成功");
    await loadVMs();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "关机失败");
  }
}

async function reboot(id: string) {
  try {
    await rebootMyVM(id);
    ElMessage.success("重启成功");
    await loadVMs();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "重启失败");
  }
}

function formatGB(bytes: number) {
  return Math.round(bytes / 1024 / 1024 / 1024);
}

function resourceText(id: string) {
  const metrics = vmResources.value[id];
  if (!metrics) return "-";
  return `CPU: ${(metrics.cpu / 1e9).toFixed(2)}s / MEM: ${(metrics.memory / 1024 / 1024).toFixed(0)}MB`;
}
</script>
