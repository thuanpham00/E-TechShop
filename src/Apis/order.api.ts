import Http from "src/Helpers/http"
import { OrderType } from "src/Types/product.type"

export const OrderApi = {
  getOrders: (signal?: AbortSignal) => {
    return Http.get(`/orders`, {
      signal
    })
  },

  updateStatusOrderForCustomer: (idOrder: string, status: number) => {
    return Http.put(`/orders/${idOrder}`, { status })
  },

  createOrderPayment: (body: OrderType) => {
    return Http.post("/payment", body)
  },

  callBackVnpay: (orderId: string) => {
    return Http.post("/payment/vnpay-callback", {
      orderId
    })
  }
}
