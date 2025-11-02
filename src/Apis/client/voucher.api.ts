import Http from "src/Helpers/http"

export const VoucherClientAPI = {
  getAvailableVouchers: (orderValue: number) => {
    return Http.get(`/vouchers/available?order_value=${orderValue}`)
  }
}
