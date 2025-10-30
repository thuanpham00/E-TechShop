import { UpdatePermissionItem } from "src/Admin/Pages/ManagePermissions/ManagePermissions"
import Http from "src/Helpers/http"

export const RolePermissionAPI = {
  getRoles: (signal: AbortSignal) => {
    return Http.get("/admin/roles", {
      signal
    })
  },

  createRole: (body: { name: string; description: string }) => {
    return Http.post("/admin/roles", body)
  },

  updateRole: (idRole: string, body: { name: string; description: string }) => {
    return Http.put(`/admin/roles/${idRole}`, body)
  },

  deleteRole: (idRole: string) => {
    return Http.delete(`/admin/roles/${idRole}`)
  },

  getPermissions: (signal: AbortSignal) => {
    return Http.get("/admin/permissions", {
      signal
    })
  },

  getPermissionsBasedOnId: (idRoles: string[], signal: AbortSignal) => {
    return Http.post(
      `/admin/permissions/by-roles`,
      {
        listIdRole: idRoles
      },
      { signal }
    )
  },

  updatePermissionsBasedOnId: (body: UpdatePermissionItem[]) => {
    return Http.put(`/admin/permissions`, body)
  }
}
