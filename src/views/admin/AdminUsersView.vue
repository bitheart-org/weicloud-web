<template>
  <el-space direction="vertical" fill :size="16" style="width: 100%">
    <el-card>
      <el-space>
        <el-input v-model="query" placeholder="按用户名/显示名搜索" clearable @keyup.enter="loadUsers" />
        <el-button type="primary" @click="loadUsers">搜索</el-button>
        <el-button type="success" @click="openCreateDialog">新建用户</el-button>
      </el-space>
    </el-card>

    <el-card>
      <el-table :data="users" v-loading="loading" empty-text="暂无用户">
        <el-table-column prop="username" label="用户名" min-width="130" />
        <el-table-column prop="display_name" label="显示名" min-width="150" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="role" label="角色" width="110" />
        <el-table-column prop="status" label="状态" width="110" />
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-space>
              <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-button size="small" @click="openResetDialog(row)">重置密码</el-button>
              <el-button size="small" type="danger" :disabled="row.status === 'disabled'" @click="disable(row.id)">
                禁用
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top: 12px; display: flex; justify-content: flex-end">
        <el-pagination
          background
          layout="total, prev, pager, next, sizes"
          :total="total"
          v-model:current-page="page"
          v-model:page-size="pageSize"
          @current-change="loadUsers"
          @size-change="loadUsers"
        />
      </div>
    </el-card>
  </el-space>

  <el-dialog v-model="createDialogVisible" title="新建用户" width="460px">
    <el-form :model="createForm" label-width="90px">
      <el-form-item label="用户名"><el-input v-model="createForm.username" /></el-form-item>
      <el-form-item label="密码"><el-input v-model="createForm.password" type="password" show-password /></el-form-item>
      <el-form-item label="显示名"><el-input v-model="createForm.display_name" /></el-form-item>
      <el-form-item label="邮箱"><el-input v-model="createForm.email" /></el-form-item>
      <el-form-item label="角色">
        <el-select v-model="createForm.role">
          <el-option label="管理员" value="admin" />
          <el-option label="普通用户" value="user" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="createDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="create">创建</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="editDialogVisible" title="编辑用户" width="460px">
    <el-form :model="editForm" label-width="90px">
      <el-form-item label="显示名"><el-input v-model="editForm.display_name" /></el-form-item>
      <el-form-item label="邮箱"><el-input v-model="editForm.email" /></el-form-item>
      <el-form-item label="角色">
        <el-select v-model="editForm.role">
          <el-option label="管理员" value="admin" />
          <el-option label="普通用户" value="user" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="editForm.status">
          <el-option label="active" value="active" />
          <el-option label="disabled" value="disabled" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="editDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="update">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="resetDialogVisible" title="重置密码" width="420px">
    <el-form :model="resetForm" label-width="90px">
      <el-form-item label="新密码"><el-input v-model="resetForm.password" type="password" show-password /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="resetDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="resetPassword">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  createUser,
  disableUser,
  listUsers,
  resetUserPassword,
  updateUser,
  type CreateUserRequest,
  type UpdateUserRequest,
} from "../../api/admin-users";
import type { UserInfo } from "../../api/auth";

const loading = ref(false);
const users = ref<UserInfo[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const query = ref("");

const createDialogVisible = ref(false);
const editDialogVisible = ref(false);
const resetDialogVisible = ref(false);
const selectedUserId = ref("");

const createForm = reactive<CreateUserRequest>({
  username: "",
  password: "",
  display_name: "",
  email: "",
  role: "user",
});

const editForm = reactive<UpdateUserRequest>({
  display_name: "",
  email: "",
  role: "user",
  status: "active",
});

const resetForm = reactive({
  password: "",
});

onMounted(loadUsers);

async function loadUsers() {
  loading.value = true;
  try {
    const res = await listUsers({ page: page.value, pageSize: pageSize.value, query: query.value });
    users.value = res.data.items;
    total.value = res.data.total;
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "加载用户失败");
  } finally {
    loading.value = false;
  }
}

function openCreateDialog() {
  createForm.username = "";
  createForm.password = "";
  createForm.display_name = "";
  createForm.email = "";
  createForm.role = "user";
  createDialogVisible.value = true;
}

async function create() {
  try {
    await createUser(createForm);
    ElMessage.success("创建成功");
    createDialogVisible.value = false;
    await loadUsers();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "创建失败");
  }
}

function openEditDialog(user: UserInfo) {
  selectedUserId.value = user.id;
  editForm.display_name = user.display_name;
  editForm.email = user.email;
  editForm.role = user.role;
  editForm.status = user.status;
  editDialogVisible.value = true;
}

async function update() {
  try {
    await updateUser(selectedUserId.value, editForm);
    ElMessage.success("更新成功");
    editDialogVisible.value = false;
    await loadUsers();
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "更新失败");
  }
}

function openResetDialog(user: UserInfo) {
  selectedUserId.value = user.id;
  resetForm.password = "";
  resetDialogVisible.value = true;
}

async function resetPassword() {
  if (!resetForm.password) {
    ElMessage.warning("请输入新密码");
    return;
  }
  try {
    await resetUserPassword(selectedUserId.value, resetForm.password);
    ElMessage.success("密码已重置");
    resetDialogVisible.value = false;
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "重置失败");
  }
}

async function disable(userId: string) {
  try {
    await ElMessageBox.confirm("确认禁用该用户？", "提示", { type: "warning" });
    await disableUser(userId);
    ElMessage.success("已禁用");
    await loadUsers();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error?.response?.data?.message || "禁用失败");
    }
  }
}
</script>
