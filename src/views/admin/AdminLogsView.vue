<template>
  <el-space direction="vertical" fill :size="16" style="width: 100%">
    <el-card>
      <el-button type="primary" @click="loadLogs">刷新</el-button>
    </el-card>
    <el-card>
      <el-table :data="logs" v-loading="loading" empty-text="暂无操作日志">
        <el-table-column prop="created_at" label="时间" min-width="180">
          <template #default="{ row }">{{ new Date(row.created_at).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="user_id" label="用户 ID" min-width="220" />
        <el-table-column prop="instance_id" label="VM ID" min-width="220">
          <template #default="{ row }">{{ row.instance_id || "-" }}</template>
        </el-table-column>
        <el-table-column prop="action" label="动作" width="130" />
        <el-table-column prop="detail" label="详情" min-width="260" />
      </el-table>
      <div style="margin-top: 12px; display: flex; justify-content: flex-end">
        <el-pagination
          background
          layout="total, prev, pager, next, sizes"
          :total="total"
          v-model:current-page="page"
          v-model:page-size="pageSize"
          @current-change="loadLogs"
          @size-change="loadLogs"
        />
      </div>
    </el-card>
  </el-space>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { getOperationLogs, type OperationLog } from "../../api/admin-system";

const loading = ref(false);
const logs = ref<OperationLog[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);

onMounted(loadLogs);

async function loadLogs() {
  loading.value = true;
  try {
    const res = await getOperationLogs(page.value, pageSize.value);
    logs.value = res.data.items;
    total.value = res.data.total;
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "加载日志失败");
  } finally {
    loading.value = false;
  }
}
</script>
