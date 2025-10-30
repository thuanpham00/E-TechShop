import Http from "src/Helpers/http"

export const StatisticalAPI = {
  // lấy số liệu thống kê hệ thống
  getStatisticalSell: (signal: AbortSignal, params: { year: number; month?: number }) => {
    return Http.get("/admin/statistical-sell", {
      params,
      signal
    })
  },

  getStatisticalProduct: (signal: AbortSignal) => {
    return Http.get("/admin/statistical-product", {
      signal
    })
  },

  getStatisticalUser: (signal: AbortSignal, params: { year: number; month?: number }) => {
    return Http.get("/admin/statistical-user", {
      params,
      signal
    })
  }
}
