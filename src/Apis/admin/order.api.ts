import Http from "src/Helpers/http"
import { queryParamConfigOrder } from "src/Types/queryParams.type"

export const OrderAPI = {
  // lấy danh sách đơn nhập hàng
  getOrderListInProcess: (params: queryParamConfigOrder, signal: AbortSignal) => {
    return Http.get(`/admin/orders-process`, {
      params,
      signal
    })
  },

  getOrderListCompleted: (params: queryParamConfigOrder, signal: AbortSignal) => {
    return Http.get(`/admin/orders-completed`, {
      params,
      signal
    })
  },

  getOrderListCancelled: (params: queryParamConfigOrder, signal: AbortSignal) => {
    return Http.get(`/admin/orders-cancelled`, {
      params,
      signal
    })
  },

  updateOrderStatus: (idOrder: string, status: string) => {
    return Http.put(`/admin/orders/${idOrder}`, { status })
  }
}
