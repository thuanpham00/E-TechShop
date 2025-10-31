import Http from "src/Helpers/http"
import { queryParamConfigVoucher } from "src/Types/queryParams.type"

export const VoucherAPI = {
  // lấy danh sách voucher
  getVouchers: (params: queryParamConfigVoucher, signal: AbortSignal) => {
    return Http.get(`/admin/vouchers`, {
      params,
      signal
    })
  }
}
