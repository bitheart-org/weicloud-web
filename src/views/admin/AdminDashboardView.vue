<template>
  <el-space direction="vertical" fill :size="16" style="width: 100%">
    <el-card>
      <el-button type="primary" @click="load">刷新</el-button>
    </el-card>

    <el-row :gutter="16">
      <el-col :span="8">
        <el-card>
          <div>宿主机总数 / 在线</div>
          <h2>{{ data.hosts_total }} / {{ data.hosts_online }}</h2>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div>虚拟机总数 / 运行中 / 已停止</div>
          <h2>{{ data.vms_total }} / {{ data.vms_running }} / {{ data.vms_stopped }}</h2>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div>CPU 已分配 / 总量</div>
          <h2>{{ data.cpu_cores_used }} / {{ data.cpu_cores_total }}</h2>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <div>内存已分配 / 总量</div>
      <h2>{{ formatBytes(data.memory_bytes_used) }} / {{ formatBytes(data.memory_bytes_total) }}</h2>
      <el-progress
        :percentage="memoryUsagePercent"
        :status="memoryUsagePercent > 90 ? 'exception' : memoryUsagePercent > 75 ? 'warning' : 'success'"
      />
    </el-card>
  </el-space>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import { ElMessage } from "element-plus";
import { getDashboard } from "../../api/admin-system";

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
    ElMessage.error(error?.response?.data?.message || "加载仪表盘失败");
  }
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 GB";
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}
</script>

