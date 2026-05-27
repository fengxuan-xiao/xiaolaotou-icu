<template>
  <div class="permission-mgr">


<!-- 标题栏 -->
    <div class="header-actions">
      <h2>{{ route.meta.title || '默认标题' }}</h2>
      <el-button type="primary" link @click="goHome">
        <el-icon>
          <HomeFilled />
        </el-icon>
        <span style="margin-left: 5px;">返回首页</span>
      </el-button>
    </div>


    <el-card header="用户权限分配">
      <el-table :data="permissionStore.userList" style="width: 100%" v-loading="loading">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column label="当前角色">
          <template #default="{ row }">
            <el-tag 
              v-for="roleId in row.roleIds" 
              :key="roleId" 
              style="margin-right: 5px"
            >
              {{ permissionStore.getRoleNameById(roleId) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="permissionStore.openAssignDialog(row)">
              分配角色
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配角色对话框 -->
    <el-dialog 
      v-model="permissionStore.dialogVisible" 
      title="分配角色" 
      width="400px"
      @close="permissionStore.closeAssignDialog"
    >
      <el-checkbox-group v-model="permissionStore.selectedRoleIds">
        <el-checkbox 
          v-for="role in permissionStore.allRoles" 
          :key="role.id" 
          :label="role.id"
        >
          {{ role.roleName }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="permissionStore.closeAssignDialog">取消</el-button>
        <el-button type="primary" @click="permissionStore.handleAssignRole">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter,useRoute } from 'vue-router'
import { usePermissionStore } from '@/stores/permission'

const permissionStore = usePermissionStore()
const loading = ref(false)
const router = useRouter()
const route = useRoute()

// 返回首页
const goHome = () => {
  router.push('/home')
}

onMounted(async () => {
  loading.value = true
  try {
    // 并行加载用户和角色数据
    await Promise.all([
      permissionStore.loadUsers(),
      permissionStore.loadRoles()
    ])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.permission-mgr {
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 20px;



  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.header-actions h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}
</style>