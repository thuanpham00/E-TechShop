import Http from "src/Helpers/http"

export const PermissionAPI = {
  getPermissionForUser: () => {
    return Http.get("/admin/permission-for-user")
  }
}
