import Http from "src/Helpers/http"
import { CreateReviewOderBodyReq, OrderType } from "src/Types/product.type"

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

  createOrderPaymentCOD: (body: OrderType) => {
    return Http.post("/payment/create-order-cod", body)
  },

  callBackVnpay: (orderId: string) => {
    return Http.post("/payment/vnpay-callback", {
      orderId
    })
  },

  addReviewOrder: (orderId: string, body: CreateReviewOderBodyReq) => {
    const formData = new FormData()
    body.reviews.forEach((review, index) => {
      formData.append(`reviews[${index}][product_id]`, review.product_id)
      formData.append(`reviews[${index}][rating]`, review.rating.toString())
      formData.append(`reviews[${index}][comment]`, review.comment)
      formData.append(`reviews[${index}][title]`, review.title)
      review.images.forEach((imageUrl, imgIndex) => {
        formData.append(`reviews[${index}][image][${imgIndex}]`, imageUrl)
      })
    })

    return Http.post(`/orders/${orderId}/reviews`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  },

  getTopReviewNewest: (signal?: AbortSignal) => {
    return Http.get("/orders/top-10-reviews", {
      signal
    })
  }
}
