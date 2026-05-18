<template>
  <div class="page-stack">
    <div class="page-title-row">
      <div>
        <h2 class="page-title">我的虚拟机</h2>
        <div class="page-subtitle">查看已分配实例，执行开关机、重启与密码重置</div>
      </div>
      <el-button type="primary" @click="loadVMs">刷新</el-button>
    </div>

    <el-card class="modern-card modern-table">
      <el-table :data="vms" v-loading="loading" empty-text="暂无分配的虚拟机" table-layout="fixed">
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column prop="image" label="镜像" min-width="170" />
        <el-table-column label="规格" min-width="180">
          <template #default="{ row }">
            {{ row.cpu_cores }}C / {{ formatGB(row.memory_bytes) }}G / {{ formatGB(row.disk_root_bytes) }}G
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <VmStatusBadge :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="实时资源" min-width="200">
          <template #default="{ row }">
            <ResourceMonitor
              compact
              :cpu-nanoseconds="vmResources[row.id]?.cpu || 0"
              :memory-bytes="vmResources[row.id]?.memory || 0"
              :memory-total-bytes="row.memory_bytes"
              :disk-bytes="row.disk_root_bytes"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="340">
          <template #default="{ row }">
            <VmActions
              :status="row.status"
              compact
              show-reset-password
              show-detail
              @start="start(row.id)"
              @stop="stop(row.id)"
              @reboot="reboot(row.id)"
              @reset-password="resetPassword(row.id)"
              @detail="toDetail(row.id)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>

  <el-dialog v-model="passwordDialogVisible" title="新 root 密码" width="420px">
    <el-alert type="warning" :closable="false" show-icon>请立即记录该密码，关闭后将无法再次查看。</el-alert>
    <el-input v-model="newPassword" readonly style="margin-top: 12px" />
    <template #footer>
      <el-button type="primary" @click="passwordDialogVisible = false">我已记录</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { getMyVMResource, listMyVMs, rebootMyVM, resetMyVMPassword, startMyVM, stopMyVM } from "../../api/user-vms";
import type { VM } from "../../api/admin-vms";
import ResourceMonitor from "../../components/ResourceMonitor.vue";
import VmActions from "../../components/VmActions.vue";
import VmStatusBadge from "../../components/VmStatusBadge.vue";
import { getApiErrorMessage } from "../../utils/api-error";

const router = useRouter();
const loading = ref(false);
const vms = ref<VM[]>([]);
const vmResources = ref<Record<string, { cpu: number; memory: number }>>({});
const passwordDialogVisible = ref(false);
const newPassword = ref("");

onMounted(loadVMs);

async function loadVMs() {
  loading.value = true;
  try {
    const res = await listMyVMs();
    vms.value = res.data.items;
    await Promise.all(vms.value.map((vm) => loadResource(vm.id)));
  } catch (error: any) {
    ElMessage.error(getApiErrorMessage(error, "加载虚拟机失败"));
  } finally {
    loading.value = false;
  }
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

async function start(id: string) {
  try {
    await startMyVM(id);
    ElMessage.success("开机成功");
    await loadVMs();
  } catch (error: any) {
    ElMessage.error(getApiErrorMessage(error, "开机失败"));
  }
}

async function stop(id: string) {
  try {
    await stopMyVM(id);
    ElMessage.success("关机成功");
    await loadVMs();
  } catch (error: any) {
    ElMessage.error(getApiErrorMessage(error, "关机失败"));
  }
}

async function reboot(id: string) {
  try {
    await rebootMyVM(id);
    ElMessage.success("重启成功");
    await loadVMs();
  } catch (error: any) {
    ElMessage.error(getApiErrorMessage(error, "重启失败"));
  }
}

async function resetPassword(id: string) {
  try {
    const res = await resetMyVMPassword(id);
    newPassword.value = res.data.new_password;
    passwordDialogVisible.value = true;
    ElMessage.success("密码已重置");
  } catch (error: any) {
    ElMessage.error(getApiErrorMessage(error, "重置密码失败"));
  }
}

function formatGB(bytes: number) {
  return Math.round(bytes / 1024 / 1024 / 1024);
}

async function toDetail(id: string) {
  await router.push(`/user/vms/${id}`);
}
</script>
