<template>
  <el-space direction="vertical" fill :size="16" style="width: 100%">
    <el-card>
      <el-space>
        <el-button type="primary" @click="loadHosts">刷新</el-button>
        <el-button type="success" @click="openCreateDialog">添加宿主机</el-button>
      </el-space>
    </el-card>

    <el-card>
      <el-table :data="hosts" v-loading="loading">
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column prop="address" label="地址" min-width="260" />
        <el-table-column prop="cpu_cores" label="CPU 核数" width="100" />
        <el-table-column label="内存总量" width="150">
          <template #default="{ row }">{{ formatBytes(row.memory_bytes) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后在线" min-width="180">
          <template #default="{ row }">{{ row.last_seen_at ? new Date(row.last_seen_at).toLocaleString() : "-" }}</template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-space>
              <el-button size="small" @click="sync(row.id)">同步</el-button>
              <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="remove(row.id)">删除</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </el-space>

  <el-dialog v-model="createDialogVisible" title="添加宿主机" width="720px">
    <el-form :model="createForm" label-width="100px">
      <el-form-item label="名称"><el-input v-model="createForm.name" /></el-form-item>
      <el-form-item label="地址"><el-input v-model="createForm.address" placeholder="https://10.0.0.1:8443" /></el-form-item>
      <el-form-item label="证书 PEM"><el-input v-model="createForm.certificate" type="textarea" :rows="7" /></el-form-item>
      <el-form-item label="密钥 PEM"><el-input v-model="createForm.key" type="textarea" :rows="7" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="createDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="create">创建</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="editDialogVisible" title="编辑宿主机" width="720px">
    <el-form :model="editForm" label-width="100px">
      <el-form-item label="名称"><el-input v-model="editForm.name" /></el-form-item>
      <el-form-item label="地址"><el-input v-model="editForm.address" /></el-form-item>
      <el-form-item label="状态">
        <el-select v-model="editForm.status">
          <el-option label="online" value="online" />
          <el-option label="offline" value="offline" />
          <el-option label="maintenance" value="maintenance" />
        </el-select>
      </el-form-item>
      <el-form-item label="证书 PEM"><el-input v-model="editForm.certificate" type="textarea" :rows="7" /></el-form-item>
      <el-form-item label="密钥 PEM"><el-input v-model="editForm.key" type="textarea" :rows="7" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="editDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="update">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  createHost,
  deleteHost,
  listHosts,
  syncHost,
  updateHost,
  type CreateHostRequest,
  type Host,
  type UpdateHostRequest,
} from "../../api/admin-hosts";

const loading = ref(false);
const hosts = ref<Host[]>([]);

const createDialogVisible = ref(false);
const editDialogVisible = ref(false);
const selectedHostId = ref("");

const createForm = reactive<CreateHostRequest>({
  name: "",
  address: "",
  certificate: "",
  key: "",
});

const editForm = reactive<UpdateHostRequest>({
  name: "",
  address: "",
  status: "offline",
  certificate: "",
  key: "",
});

onMounted(loadHosts);

async function loadHosts() {
  loading.value = true;
  try {
    const res = await listHosts();
    hosts.value = res.data.items;
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "加载宿主机失败");
  } finally {
    loading.value = false;
  }
}

function openCreateDialog() {
  createForm.name = "";
  createForm.address = "";
  createForm.certificate = "";
  createForm.key = "";
  createDialogVisible.value = true;
}

async function create() {
  try {
    await createHost(createForm);
    ElMessage.success("宿主机已添加");
    createDialogVisible.value = false;
    await loadHosts();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "创建失败");
  }
}

function openEditDialog(host: Host) {
  selectedHostId.value = host.id;
  editForm.name = host.name;
  editForm.address = host.address;
  editForm.status = host.status;
  editForm.certificate = "";
  editForm.key = "";
  editDialogVisible.value = true;
}

async function update() {
  try {
    await updateHost(selectedHostId.value, editForm);
    ElMessage.success("已更新");
    editDialogVisible.value = false;
    await loadHosts();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "更新失败");
  }
}

async function sync(id: string) {
  try {
    await syncHost(id);
    ElMessage.success("同步完成");
    await loadHosts();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "同步失败");
  }
}

async function remove(id: string) {
  try {
    await ElMessageBox.confirm("确认删除该宿主机？", "提示", { type: "warning" });
    await deleteHost(id);
    ElMessage.success("删除成功");
    await loadHosts();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error?.response?.data?.message || "删除失败");
    }
  }
}

function statusTagType(status: Host["status"]) {
  if (status === "online") return "success";
  if (status === "maintenance") return "warning";
  return "info";
}

function formatBytes(bytes: number) {
  if (!bytes) return "-";
  const gb = bytes / 1024 / 1024 / 1024;
  return `${gb.toFixed(1)} GB`;
}
</script>

