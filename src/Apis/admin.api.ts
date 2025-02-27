import Http from "src/Helpers/http"
import { UpdateBodyReq, UpdateCategoryBodyReq } from "src/Types/product.type"
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

  getCustomerDetail: (id: string) => {
    return Http.get(`/admin/customers/${id}`)
  },

  updateProfileCustomer: (id: string, body: UpdateBodyReq) => {
    return Http.patch(`/admin/customers/${id}`, body)
  },

  deleteProfileCustomer: (id: string) => {
    return Http.delete(`/admin/customers/${id}`)
  },

  getCategories: (params: queryParamConfig, signal: AbortSignal) => {
    return Http.get(`/admin/categories/`, {
      params,
      signal
    })
  },

  getCategoryDetail: (id: string) => {
    return Http.get(`/admin/categories/${id}`)
  },

  updateCategoryDetail: (id: string, body: UpdateCategoryBodyReq) => {
    return Http.patch(`/admin/categories/${id}`, body)
  }
}
