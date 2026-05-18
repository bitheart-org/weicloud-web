<template>
  <el-card>
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center">
        <strong>Web Shell</strong>
        <el-space>
          <el-button size="small" @click="connect">连接</el-button>
          <el-button size="small" @click="disconnect">断开</el-button>
        </el-space>
      </div>
    </template>
    <div ref="containerRef" style="height: 420px; background: #0d1117; overflow: hidden"></div>
  </el-card>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { FitAddon } from "xterm-addon-fit";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { issueMyVMShellToken } from "../api/user-vms";
import { getApiErrorMessage } from "../utils/api-error";

const props = defineProps<{
  vmId: string;
}>();

const containerRef = ref<HTMLElement | null>(null);
let socket: WebSocket | null = null;
let term: Terminal | null = null;
let fitAddon: FitAddon | null = null;

onMounted(() => {
  initTerminal();
  void connect();
});

onBeforeUnmount(() => {
  disconnect();
  term?.dispose();
});

function initTerminal() {
  if (!containerRef.value || term) return;
  term = new Terminal({
    cursorBlink: true,
    fontSize: 13,
    theme: {
      background: "#0d1117",
      foreground: "#c9d1d9",
    },
  });
  fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.open(containerRef.value);
  fitAddon.fit();
  term.onData((data) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(data);
    }
  });
}

async function connect() {
  disconnect();
  if (!term) return;
  try {
    const tokenRes = await issueMyVMShellToken(props.vmId);
    const wsBase = import.meta.env.VITE_VNC_WS_BASE_URL || `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}`;
    const wsURL = `${wsBase}/ws/shell/${props.vmId}?token=${encodeURIComponent(tokenRes.data.token)}`;

    socket = new WebSocket(wsURL);
    socket.binaryType = "arraybuffer";
    socket.onopen = () => {
      term?.writeln("\r\n[已连接到 VM Shell]\r\n");
      fitAddon?.fit();
    };
    socket.onmessage = (event) => {
      if (!term) return;
      if (typeof event.data === "string") {
        term.write(event.data);
        return;
      }
      if (event.data instanceof ArrayBuffer) {
        const data = new Uint8Array(event.data);
        term.write(data);
      }
    };
    socket.onclose = () => {
      term?.writeln("\r\n[Shell 连接已关闭]\r\n");
    };
    socket.onerror = () => {
      ElMessage.error("Shell 连接异常");
    };
  } catch (error: any) {
    ElMessage.error(getApiErrorMessage(error, "Shell 连接失败"));
  }
}

function disconnect() {
  if (socket) {
    socket.close();
    socket = null;
  }
}
</script>
