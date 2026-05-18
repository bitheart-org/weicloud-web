<template>
  <span v-if="compact">
    CPU: {{ cpuSeconds }}s / MEM: {{ memoryMB }}MB / DISK: {{ diskGB }}G
  </span>
  <el-space v-else direction="vertical" fill :size="10" style="width: 100%">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="CPU 使用(累计)">{{ cpuSeconds }} s</el-descriptions-item>
      <el-descriptions-item label="内存使用">{{ memoryMB }} MB</el-descriptions-item>
      <el-descriptions-item label="磁盘容量">{{ diskGB }} GB</el-descriptions-item>
      <el-descriptions-item label="内存总量">{{ memoryTotalGB }} GB</el-descriptions-item>
    </el-descriptions>
    <div>
      <div style="margin-bottom: 6px">内存利用率</div>
      <el-progress :percentage="memoryUsagePercent" />
    </div>
  </el-space>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  cpuNanoseconds: number;
  memoryBytes: number;
  memoryTotalBytes: number;
  diskBytes: number;
  compact?: boolean;
}>();

const cpuSeconds = computed(() => (props.cpuNanoseconds / 1e9).toFixed(2));
const memoryMB = computed(() => Math.round(props.memoryBytes / 1024 / 1024));
const memoryTotalGB = computed(() => Math.round(props.memoryTotalBytes / 1024 / 1024 / 1024));
const diskGB = computed(() => Math.round(props.diskBytes / 1024 / 1024 / 1024));
const memoryUsagePercent = computed(() => {
  if (!props.memoryTotalBytes) return 0;
  return Math.min(100, Math.round((props.memoryBytes / props.memoryTotalBytes) * 100));
});
</script>
