import request from '@/utils/request'

// 获取所有角色列表
export function getRoleList() {
  return request({ url: '/permission/role/list', method: 'get' })
}

// 获取用户列表（含角色信息）
export function getUserList(params) {
  return request({ url: '/permission/user/list', method: 'get', params })
}

// 为用户分配角色
export function assignUserRole(data) {
  // data: { userId: 1, roleIds: [1, 2] }
  return request({ url: '/permission/user/assign-role', method: 'post', data })
}

// 获取当前用户的权限菜单/按钮标识
export function getUserPermissions() {
  return request({ url: '/permission/auth/permissions', method: 'get' })
}