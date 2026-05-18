<template>
  <el-space>
    <el-button size="small" type="success" :disabled="!canStart" @click="emit('start')">开机</el-button>
    <el-button size="small" :disabled="!canStop" @click="emit('stop')">关机</el-button>
    <el-button size="small" type="warning" :disabled="!canReboot" @click="emit('reboot')">重启</el-button>
    <el-button
      v-if="showResetPassword && !compact"
      size="small"
      type="danger"
      :disabled="isBusy"
      @click="emit('reset-password')"
    >
      重置密码
    </el-button>
    <el-button v-if="showDetail && !compact" size="small" :disabled="isBusy" @click="emit('detail')">详情</el-button>
    <template v-if="compact">
      <el-dropdown trigger="click" @command="handleCommand">
        <el-button size="small" :disabled="isBusy">更多</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-if="showConfig" command="config">改配置</el-dropdown-item>
            <el-dropdown-item v-if="showResize" command="resize">扩容</el-dropdown-item>
            <el-dropdown-item v-if="showNetwork" command="network">限速</el-dropdown-item>
            <el-dropdown-item v-if="showAssign" command="assign">分配</el-dropdown-item>
            <el-dropdown-item v-if="showResetPassword" command="reset-password">重置密码</el-dropdown-item>
            <el-dropdown-item v-if="showDetail" command="detail">详情</el-dropdown-item>
            <el-dropdown-item v-if="showRemove" command="remove" divided>销毁</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
    <template v-else>
      <el-button v-if="showConfig" size="small" :disabled="isBusy" @click="emit('config')">改配置</el-button>
      <el-button v-if="showResize" size="small" :disabled="isBusy" @click="emit('resize')">扩容</el-button>
      <el-button v-if="showNetwork" size="small" :disabled="isBusy" @click="emit('network')">限速</el-button>
      <el-button v-if="showAssign" size="small" :disabled="isBusy" @click="emit('assign')">分配</el-button>
      <el-button v-if="showRemove" size="small" type="danger" :disabled="isBusy" @click="emit('remove')">销毁</el-button>
    </template>
  </el-space>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    status: "running" | "stopped" | "creating" | "error" | string;
    showConfig?: boolean;
    showResize?: boolean;
    showNetwork?: boolean;
    showAssign?: boolean;
    showResetPassword?: boolean;
    showDetail?: boolean;
    showRemove?: boolean;
    compact?: boolean;
  }>(),
  {
    showConfig: false,
    showResize: false,
    showNetwork: false,
    showAssign: false,
    showResetPassword: false,
    showDetail: false,
    showRemove: false,
    compact: false,
  },
);

const emit = defineEmits<{
  (e: "start"): void;
  (e: "stop"): void;
  (e: "reboot"): void;
  (e: "config"): void;
  (e: "resize"): void;
  (e: "network"): void;
  (e: "assign"): void;
  (e: "reset-password"): void;
  (e: "detail"): void;
  (e: "remove"): void;
}>();

const isBusy = computed(() => props.status === "creating");
const canStart = computed(() => props.status === "stopped" || props.status === "error");
const canStop = computed(() => props.status === "running");
const canReboot = computed(() => props.status === "running");

function handleCommand(command: string | number | object) {
  if (typeof command !== "string") return;
  switch (command) {
    case "config":
      emit("config");
      return;
    case "resize":
      emit("resize");
      return;
    case "network":
      emit("network");
      return;
    case "assign":
      emit("assign");
      return;
    case "reset-password":
      emit("reset-password");
      return;
    case "detail":
      emit("detail");
      return;
    case "remove":
      emit("remove");
      return;
    default:
      return;
  }
}
</script>
