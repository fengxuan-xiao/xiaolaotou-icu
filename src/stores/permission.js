import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserPermissions, getRoleList, getUserList, assignUserRole } from '@/api/permission'
import { ElMessage } from 'element-plus'

export const usePermissionStore = defineStore('permission', () => {
  // --- 当前登录用户的权限状态 (原有功能) ---
  const roles = ref([]) 
  const permissions = ref([]) 

  // --- 权限管理页面的状态 (新增功能) ---
  const userList = ref([])
  const allRoles = ref([])
  const dialogVisible = ref(false)
  const currentUser = ref(null)
  const selectedRoleIds = ref([])

  // --- 计算属性 ---
  const hasRole = (roleCode) => roles.value.includes(roleCode)
  const hasPerm = (permCode) => permissions.value.includes(permCode)

  // --- Actions: 当前用户权限相关 ---
  async function fetchUserPermissions() {
    try {
      const res = await getUserPermissions()
      roles.value = res.data.roles || []
      permissions.value = res.data.permissions || []
      return res.data
    } catch (error) {
      console.error('Fetch permissions failed', error)
    }
  }

  function resetPermissions() {
    roles.value = []
    permissions.value = []
  }

  // --- Actions: 权限管理页面相关 ---
  
  // 加载用户列表
  async function loadUsers() {
    try {
      const res = await getUserList()
      userList.value = res.data.list || []
    } catch (error) {
      ElMessage.error('加载用户列表失败')
      console.error(error)
    }
  }

  // 加载角色列表
  async function loadRoles() {
    try {
      const res = await getRoleList()
      allRoles.value = res.data || []
    } catch (error) {
      ElMessage.error('加载角色列表失败')
      console.error(error)
    }
  }

  // 打开分配角色对话框
  function openAssignDialog(user) {
    currentUser.value = user
    // 确保选中当前用户已有的角色
    selectedRoleIds.value = user.roleIds ? [...user.roleIds] : []
    dialogVisible.value = true
  }

  // 关闭对话框
  function closeAssignDialog() {
    dialogVisible.value = false
    currentUser.value = null
    selectedRoleIds.value = []
  }

  // 执行分配角色
  async function handleAssignRole() {
    if (!currentUser.value) return
    
    try {
      await assignUserRole({
        userId: currentUser.value.id,
        roleIds: selectedRoleIds.value
      })
      ElMessage.success('分配成功')
      closeAssignDialog()
      // 分配成功后重新加载用户列表以更新视图
      await loadUsers()
    } catch (error) {
      ElMessage.error('分配失败')
      console.error(error)
    }
  }

  // 辅助方法：根据ID获取角色名称 (可以在组件中用computed替代，但放在store也可)
  const getRoleNameById = (id) => {
    const role = allRoles.value.find(r => r.id === id)
    return role ? role.roleName : '未知'
  }

  return {
    // 当前用户权限
    roles,
    permissions,
    hasRole,
    hasPerm,
    fetchUserPermissions,
    resetPermissions,
    
    // 权限管理页面状态与方法
    userList,
    allRoles,
    dialogVisible,
    currentUser,
    selectedRoleIds,
    loadUsers,
    loadRoles,
    openAssignDialog,
    closeAssignDialog,
    handleAssignRole,
    getRoleNameById
  }
})