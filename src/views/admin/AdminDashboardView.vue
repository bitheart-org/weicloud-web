<template>
  <div class="page-stack">
    <div class="page-title-row">
      <div>
        <h2 class="page-title">仪表盘</h2>
        <div class="page-subtitle">快速查看平台容量、运行状态与资源占用</div>
      </div>
      <el-button type="primary" @click="load">刷新</el-button>
    </div>

    <el-row :gutter="16">
      <el-col :span="8">
        <el-card class="modern-card">
          <div class="metric-label">宿主机总数 / 在线</div>
          <div class="metric-value">{{ data.hosts_total }} / {{ data.hosts_online }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="modern-card">
          <div class="metric-label">虚拟机总数 / 运行中 / 已停止</div>
          <div class="metric-value">{{ data.vms_total }} / {{ data.vms_running }} / {{ data.vms_stopped }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="modern-card">
          <div class="metric-label">CPU 已分配 / 总量</div>
          <div class="metric-value">{{ data.cpu_cores_used }} / {{ data.cpu_cores_total }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="modern-card">
      <div class="metric-label">内存已分配 / 总量</div>
      <div class="metric-value">{{ formatBytes(data.memory_bytes_used) }} / {{ formatBytes(data.memory_bytes_total) }}</div>
      <el-progress
        :percentage="memoryUsagePercent"
        :status="memoryUsagePercent > 90 ? 'exception' : memoryUsagePercent > 75 ? 'warning' : 'success'"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import { ElMessage } from "element-plus";
import { getDashboard } from "../../api/admin-system";
import { getApiErrorMessage } from "../../utils/api-error";

const data = reactive({
  hosts_total: 0,
  hosts_online: 0,
  vms_total: 0,
  vms_running: 0,
  vms_stopped: 0,
  cpu_cores_total: 0,
  cpu_cores_used: 0,
  memory_bytes_total: 0,
  memory_bytes_used: 0,
});

const memoryUsagePercent = computed(() => {
  if (!data.memory_bytes_total) return 0;
  return Math.round((data.memory_bytes_used / data.memory_bytes_total) * 100);
});

onMounted(load);

async function load() {
  try {
    const res = await getDashboard();
    Object.assign(data, res.data);
  } catch (error: any) {
    ElMessage.error(getApiErrorMessage(error, "加载仪表盘失败"));
  }
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 GB";
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}
</script>
