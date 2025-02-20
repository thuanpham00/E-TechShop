import Http from "src/Helpers/http"
import { UpdateBodyReq } from "src/Types/product.type"
import { queryParamConfig } from "src/Types/queryParams.type"

export const adminAPI = {
  getStatistical: (signal: AbortSignal) => {
    return Http.get("/admin/statistical", {
      signal
    })
  },

  getCustomers: (params: queryParamConfig, signal: AbortSignal) => {
    return Http.get("/admin/customers", {
      params,
      signal
    })
  },

  getCustomer: (id: string) => {
    return Http.get(`/admin/customers/${id}`)
  },

  getCategories: (params: queryParamConfig, signal: AbortSignal) => {
    return Http.get(`/admin/categories/`, {
      params,
      signal
    })
  },

  updateProfileCustomer: (id: string, body: UpdateBodyReq) => {
    return Http.patch(`/users/customers/${id}`, body)
  }
}
