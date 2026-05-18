<template>
  <el-tag :type="tagType">{{ label }}</el-tag>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  status: "running" | "stopped" | "creating" | "error" | string;
}>();

const label = computed(() => {
  if (props.status === "running") return "运行中";
  if (props.status === "stopped") return "已停止";
  if (props.status === "creating") return "创建中";
  if (props.status === "error") return "异常";
  return props.status || "-";
});

const tagType = computed(() => {
  if (props.status === "running") return "success";
  if (props.status === "stopped") return "info";
  if (props.status === "creating") return "warning";
  if (props.status === "error") return "danger";
  return "info";
});
</script>
