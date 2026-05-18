<template>
  <el-card class="modern-card">
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center">
        <strong>VNC 控制台</strong>
        <el-space>
          <el-button size="small" @click="connect">连接</el-button>
          <el-button size="small" @click="disconnect">断开</el-button>
        </el-space>
      </div>
    </template>
    <div ref="containerRef" style="height: 520px; background: #111; overflow: hidden"></div>
  </el-card>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { issueMyVMVncToken } from "../api/user-vms";
import { getApiErrorMessage } from "../utils/api-error";

const props = defineProps<{
  vmId: string;
}>();

const containerRef = ref<HTMLElement | null>(null);
let rfb: any = null;

onMounted(() => {
  void connect();
});

onBeforeUnmount(() => {
  disconnect();
});

async function connect() {
  disconnect();
  if (!containerRef.value) return;

  try {
    const tokenRes = await issueMyVMVncToken(props.vmId);
    const wsBase = import.meta.env.VITE_VNC_WS_BASE_URL || `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}`;
    const wsURL = `${wsBase}/ws/vnc/${props.vmId}?token=${encodeURIComponent(tokenRes.data.token)}`;

    const module = await import("@novnc/novnc");
    const RFB = module.default || module;
    rfb = new RFB(containerRef.value, wsURL, {});
    rfb.scaleViewport = true;
    rfb.resizeSession = true;
    rfb.addEventListener("disconnect", () => {
      ElMessage.warning("VNC 已断开");
    });
    rfb.addEventListener("credentialsrequired", () => {
      ElMessage.warning("VNC 需要凭据，请检查虚拟机设置");
    });
  } catch (error: any) {
    ElMessage.error(getApiErrorMessage(error, "VNC 连接失败"));
  }
}

function disconnect() {
  if (rfb) {
    try {
      rfb.disconnect();
    } catch {
      // ignore close error
    }
    rfb = null;
  }
}
</script>
