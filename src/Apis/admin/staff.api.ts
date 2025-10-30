import Http from "src/Helpers/http"
import { CreateStaffBodyReq, UpdateBodyReq } from "src/Types/product.type"
import { queryParamConfigCustomer } from "src/Types/queryParams.type"

export const StaffAPI = {
  // lấy danh sách nhân viên (nhân viên bán hàng, thủ kho, ..)
  getStaffs: (params: queryParamConfigCustomer, signal: AbortSignal) => {
    return Http.get("/admin/staffs", {
      params,
      signal
    })
  },

  createStaff: (body: CreateStaffBodyReq) => {
    return Http.post("/admin/staffs", body)
  },

  // cập nhật nhân viên
  updateProfileStaff: (id: string, body: UpdateBodyReq) => {
    return Http.put(`/admin/staffs/${id}`, body)
  },

  // xóa nhân viên
  deleteProfileStaff: (id: string) => {
    return Http.delete(`/admin/staffs/${id}`)
  }
}
