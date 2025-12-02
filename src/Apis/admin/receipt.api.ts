import Http from "src/Helpers/http"
import { CreateReceiptBodyReq, UpdateReceiptBodyReq } from "src/Types/product.type"
import { queryParamConfigReceipt, queryParamsPricePerUnit } from "src/Types/queryParams.type"

export const ReceiptAPI = {
  // lấy danh sách đơn nhập hàng
  getReceipts: (params: queryParamConfigReceipt, signal: AbortSignal) => {
    return Http.get(`/admin/receipts`, {
      params,
      signal
    })
  },

  getPricePerUnitBasedOnProductAndSupplier: (params: queryParamsPricePerUnit) => {
    return Http.get(`/admin/get-pricePerUnit`, {
      params
    })
  },

  createReceipt: (body: CreateReceiptBodyReq) => {
    return Http.post(`/admin/receipts`, body)
  },

  updateReceipt: (id: string, body: UpdateReceiptBodyReq) => {
    return Http.put(`/admin/receipts/${id}`, body)
  }
}
