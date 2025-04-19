import { Roles_Permissions } from "src/Helpers/role_permission"

export default function useRolePermissions(role: string) {
  const hasPermission = (permission: string) => {
    const allowedPermission = Roles_Permissions[role] || []
    return allowedPermission.includes(permission)
  }
  return {
    hasPermission
  }
}
