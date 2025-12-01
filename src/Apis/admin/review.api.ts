import Http from "src/Helpers/http"
import { queryParamConfigReview } from "src/Types/queryParams.type"

export const ReviewAPI = {
  // lấy danh sách danh mục
  getReviews: (params: queryParamConfigReview, signal: AbortSignal) => {
    return Http.get(`/admin/reviews`, {
      params,
      signal
    })
  },

  deleteReview: (reviewId: string) => {
    return Http.delete(`/admin/reviews/${reviewId}`)
  }
}
