import Http from "src/Helpers/http"
import { OrderType } from "src/Types/product.type"

export const OrderApi = {
  getOrders: (signal?: AbortSignal) => {
    return Http.get(`/orders`, {
      signal
    })
  },

  createOrder: (body: OrderType) => {
    return Http.post(`/orders`, body)
  },

  updateStatusOrderForCustomer: (idOrder: string, status: number) => {
    return Http.put(`/orders/${idOrder}`, { status })
  }
}
