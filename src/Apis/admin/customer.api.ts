import Http from "src/Helpers/http"
import { CreateCustomerBodyReq, UpdateBodyReq } from "src/Types/product.type"
import { queryParamConfigCustomer } from "src/Types/queryParams.type"

export const CustomerAPI = {
  createCustomer: (body: CreateCustomerBodyReq) => {
    return Http.post("/admin/customers", body)
  },

  // lấy danh sách khách hàng
  getCustomers: (params: queryParamConfigCustomer, signal: AbortSignal) => {
    return Http.get("/admin/customers", {
      params,
      signal
    })
  },

  // cập nhật khách hàng
  updateProfileCustomer: (id: string, body: UpdateBodyReq) => {
    return Http.put(`/admin/customers/${id}`, body)
  },

  // xóa khách hàng
  deleteProfileCustomer: (id: string) => {
    return Http.delete(`/admin/customers/${id}`)
  }
}
