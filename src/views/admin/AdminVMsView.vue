<template>
  <el-space direction="vertical" fill :size="16" style="width: 100%">
    <el-card>
      <el-space>
        <el-button type="primary" @click="loadData">刷新</el-button>
        <el-button type="success" @click="openCreateDialog">创建 VM</el-button>
      </el-space>
    </el-card>

    <el-card>
      <el-table :data="vms" v-loading="loading">
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column prop="image" label="镜像" min-width="180" />
        <el-table-column prop="host_id" label="宿主机 ID" min-width="220" />
        <el-table-column prop="owner_id" label="用户 ID" min-width="220">
          <template #default="{ row }">{{ row.owner_id || "-" }}</template>
        </el-table-column>
        <el-table-column label="规格" min-width="180">
          <template #default="{ row }">
            {{ row.cpu_cores }}C / {{ formatGB(row.memory_bytes) }}G / {{ formatGB(row.disk_root_bytes) }}G
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="实时资源" min-width="200">
          <template #default="{ row }">
            <span>{{ resourceText(row.id) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="560">
          <template #default="{ row }">
            <el-space>
              <el-button size="small" type="success" @click="start(row.id)">开机</el-button>
              <el-button size="small" @click="stop(row.id)">关机</el-button>
              <el-button size="small" type="warning" @click="reboot(row.id)">重启</el-button>
              <el-button size="small" @click="openConfigDialog(row)">改配置</el-button>
              <el-button size="small" @click="openDiskDialog(row)">扩容</el-button>
              <el-button size="small" @click="openNetworkDialog(row)">限速</el-button>
              <el-button size="small" @click="openAssignDialog(row)">分配</el-button>
              <el-button size="small" type="danger" @click="remove(row.id)">销毁</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </el-space>

  <el-dialog v-model="createVisible" title="创建 VM" width="560px">
    <el-form :model="createForm" label-width="100px">
      <el-form-item label="名称"><el-input v-model="createForm.name" /></el-form-item>
      <el-form-item label="镜像">
        <el-select v-model="createForm.image" filterable style="width: 100%">
          <el-option v-for="img in images" :key="img.alias" :label="`${img.alias} (${img.description})`" :value="img.alias" />
        </el-select>
      </el-form-item>
      <el-form-item label="宿主机">
        <el-select v-model="createForm.host_id" style="width: 100%">
          <el-option v-for="h in hosts" :key="h.id" :label="`${h.name} (${h.address})`" :value="h.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="Owner ID"><el-input v-model="createForm.owner_id" placeholder="可选" /></el-form-item>
      <el-form-item label="CPU 核数"><el-input-number v-model="createForm.cpu_cores" :min="1" :max="128" /></el-form-item>
      <el-form-item label="内存(GB)"><el-input-number v-model="createMemoryGB" :min="1" :max="1024" /></el-form-item>
      <el-form-item label="磁盘(GB)"><el-input-number v-model="createDiskGB" :min="10" :max="4096" /></el-form-item>
      <el-form-item label="入方向"><el-input v-model="createForm.network_ingress" placeholder="如 100Mbit" /></el-form-item>
      <el-form-item label="出方向"><el-input v-model="createForm.network_egress" placeholder="如 100Mbit" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="createVisible = false">取消</el-button>
      <el-button type="primary" @click="create">创建</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="configVisible" title="修改配置" width="420px">
    <el-form :model="configForm" label-width="90px">
      <el-form-item label="CPU 核数"><el-input-number v-model="configForm.cpu_cores" :min="1" :max="128" /></el-form-item>
      <el-form-item label="内存(GB)"><el-input-number v-model="configMemoryGB" :min="1" :max="1024" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="configVisible = false">取消</el-button>
      <el-button type="primary" @click="updateConfig">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="diskVisible" title="扩容磁盘" width="420px">
    <el-form :model="diskForm" label-width="90px">
      <el-form-item label="磁盘(GB)"><el-input-number v-model="diskGB" :min="10" :max="4096" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="diskVisible = false">取消</el-button>
      <el-button type="primary" @click="resizeDisk">确认</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="networkVisible" title="网速限制" width="420px">
    <el-form :model="networkForm" label-width="90px">
      <el-form-item label="入方向"><el-input v-model="networkForm.ingress" /></el-form-item>
      <el-form-item label="出方向"><el-input v-model="networkForm.egress" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="networkVisible = false">取消</el-button>
      <el-button type="primary" @click="updateNetwork">确认</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="assignVisible" title="分配用户" width="420px">
    <el-form :model="assignForm" label-width="90px">
      <el-form-item label="Owner ID"><el-input v-model="assignForm.owner_id" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="assignVisible = false">取消</el-button>
      <el-button type="primary" @click="assign">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { listHosts, type Host } from "../../api/admin-hosts";
import {
  assignVM,
  createVM,
  deleteVM,
  listImages,
  listVMs,
rebootVM,
resizeVMDisk,
startVM,
stopVM,
updateVMConfig,
updateVMNetwork,
  type VM,
  type VMImage,
} from "../../api/admin-vms";
import { getAdminVMResource } from "../../api/admin-system";

const loading = ref(false);
const vms = ref<VM[]>([]);
const hosts = ref<Host[]>([]);
const images = ref<VMImage[]>([]);
const selectedID = ref("");

const createVisible = ref(false);
const configVisible = ref(false);
const diskVisible = ref(false);
const networkVisible = ref(false);
const assignVisible = ref(false);

const createForm = reactive({
  name: "",
  image: "",
  host_id: "",
  owner_id: "",
  cpu_cores: 2,
  memory_bytes: 2 * 1024 * 1024 * 1024,
  disk_root_bytes: 10 * 1024 * 1024 * 1024,
  network_ingress: "",
  network_egress: "",
});
const createMemoryGB = computed({
  get: () => Math.round(createForm.memory_bytes / 1024 / 1024 / 1024),
  set: (v: number) => (createForm.memory_bytes = v * 1024 * 1024 * 1024),
});
const createDiskGB = computed({
  get: () => Math.round(createForm.disk_root_bytes / 1024 / 1024 / 1024),
  set: (v: number) => (createForm.disk_root_bytes = v * 1024 * 1024 * 1024),
});

const configForm = reactive({ cpu_cores: 2, memory_bytes: 2 * 1024 * 1024 * 1024 });
const configMemoryGB = computed({
  get: () => Math.round(configForm.memory_bytes / 1024 / 1024 / 1024),
  set: (v: number) => (configForm.memory_bytes = v * 1024 * 1024 * 1024),
});
const diskForm = reactive({ disk_root_bytes: 10 * 1024 * 1024 * 1024 });
const diskGB = computed({
  get: () => Math.round(diskForm.disk_root_bytes / 1024 / 1024 / 1024),
  set: (v: number) => (diskForm.disk_root_bytes = v * 1024 * 1024 * 1024),
});
const networkForm = reactive({ ingress: "", egress: "" });
const assignForm = reactive({ owner_id: "" });
const vmResources = reactive<Record<string, { cpu: number; memory: number }>>({});

onMounted(loadData);

async function loadData() {
  loading.value = true;
  try {
    const [vmRes, hostRes, imageRes] = await Promise.all([listVMs(), listHosts(), listImages()]);
    vms.value = vmRes.data.items;
    hosts.value = hostRes.data.items;
    images.value = imageRes.data.items;
    await Promise.all(vms.value.map((vm) => loadResource(vm.id)));
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "加载 VM 数据失败");
  } finally {
    loading.value = false;
  }
}

async function loadResource(vmID: string) {
  try {
    const res = await getAdminVMResource(vmID);
    vmResources[vmID] = {
      cpu: res.data.cpu_nanoseconds,
      memory: res.data.memory_bytes,
    };
  } catch {
    vmResources[vmID] = { cpu: 0, memory: 0 };
  }
}

function resourceText(vmID: string) {
  const metrics = vmResources[vmID];
  if (!metrics) return "-";
  return `CPU: ${(metrics.cpu / 1e9).toFixed(2)}s / MEM: ${(metrics.memory / 1024 / 1024).toFixed(0)}MB`;
}

function openCreateDialog() {
  createForm.name = "";
  createForm.image = "";
  createForm.host_id = "";
  createForm.owner_id = "";
  createForm.cpu_cores = 2;
  createForm.memory_bytes = 2 * 1024 * 1024 * 1024;
  createForm.disk_root_bytes = 10 * 1024 * 1024 * 1024;
  createForm.network_ingress = "";
  createForm.network_egress = "";
  createVisible.value = true;
}

async function create() {
  try {
    await createVM(createForm);
    ElMessage.success("创建任务已提交");
    createVisible.value = false;
    await loadData();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "创建失败");
  }
}

function openConfigDialog(vm: VM) {
  selectedID.value = vm.id;
  configForm.cpu_cores = vm.cpu_cores;
  configForm.memory_bytes = vm.memory_bytes;
  configVisible.value = true;
}

async function updateConfig() {
  try {
    await updateVMConfig(selectedID.value, configForm.cpu_cores, configForm.memory_bytes);
    ElMessage.success("配置已更新");
    configVisible.value = false;
    await loadData();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "更新配置失败");
  }
}

function openDiskDialog(vm: VM) {
  selectedID.value = vm.id;
  diskForm.disk_root_bytes = vm.disk_root_bytes;
  diskVisible.value = true;
}

async function resizeDisk() {
  try {
    await resizeVMDisk(selectedID.value, diskForm.disk_root_bytes);
    ElMessage.success("磁盘扩容完成");
    diskVisible.value = false;
    await loadData();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "扩容失败");
  }
}

function openNetworkDialog(vm: VM) {
  selectedID.value = vm.id;
  networkForm.ingress = vm.network_ingress || "";
  networkForm.egress = vm.network_egress || "";
  networkVisible.value = true;
}

async function updateNetwork() {
  try {
    await updateVMNetwork(selectedID.value, networkForm.ingress, networkForm.egress);
    ElMessage.success("网速限制已更新");
    networkVisible.value = false;
    await loadData();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "更新网速限制失败");
  }
}

function openAssignDialog(vm: VM) {
  selectedID.value = vm.id;
  assignForm.owner_id = vm.owner_id || "";
  assignVisible.value = true;
}

async function assign() {
  if (!assignForm.owner_id) {
    ElMessage.warning("请输入 Owner ID");
    return;
  }
  try {
    await assignVM(selectedID.value, assignForm.owner_id);
    ElMessage.success("分配成功");
    assignVisible.value = false;
    await loadData();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "分配失败");
  }
}

async function remove(id: string) {
  try {
    await ElMessageBox.confirm("确认销毁该 VM？", "提示", { type: "warning" });
    await deleteVM(id);
    ElMessage.success("销毁成功");
    await loadData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error?.response?.data?.message || "销毁失败");
    }
  }
}

async function start(id: string) {
  try {
    await startVM(id);
    ElMessage.success("开机成功");
    await loadData();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "开机失败");
  }
}

async function stop(id: string) {
  try {
    await stopVM(id);
    ElMessage.success("关机成功");
    await loadData();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "关机失败");
  }
}

async function reboot(id: string) {
  try {
    await rebootVM(id);
    ElMessage.success("重启成功");
    await loadData();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "重启失败");
  }
}

function formatGB(bytes: number) {
  return Math.round(bytes / 1024 / 1024 / 1024);
}
</script>
