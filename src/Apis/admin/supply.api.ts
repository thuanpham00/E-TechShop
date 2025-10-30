import Http from "src/Helpers/http"
import { UpdateSupplyBodyReq } from "src/Types/product.type"
import { queryParamConfigSupply } from "src/Types/queryParams.type"

export const SupplyAPI = {
  // lấy danh sách cung ứng
  getSupplies: (params: queryParamConfigSupply, signal: AbortSignal) => {
    return Http.get(`/admin/supplies`, {
      params,
      signal
    })
  },

  // lấy giá bán sản phẩm
  getPriceSellProduct: (params: { name: string }) => {
    return Http.get(`/admin/supplies/price-product`, { params })
  },

  createSupply: (body: {
    productId: string
    supplierId: string
    importPrice: number
    warrantyMonths: number
    leadTimeDays: number
    description: string
  }) => {
    return Http.post(`/admin/supplies`, body)
  },

  // cập nhật chi tiết cung ứng
  updateSupplyDetail: (id: string, body: UpdateSupplyBodyReq) => {
    return Http.put(`/admin/supplies/${id}`, body)
  },

  // xóa cung ứng
  deleteSupplyDetail: (id: string) => {
    return Http.delete(`/admin/supplies/${id}`)
  }
}
