import Http from "src/Helpers/http"
import { queryParamConfigOrder } from "src/Types/queryParams.type"

export const OrderAPI = {
  // lấy danh sách đơn nhập hàng
  getOrderList: (params: queryParamConfigOrder, signal: AbortSignal) => {
    return Http.get(`/admin/orders`, {
      params,
      signal
    })
  },

  updateOrderStatus: (idOrder: string, status: string) => {
    return Http.put(`/admin/orders/${idOrder}`, { status })
  }
}
