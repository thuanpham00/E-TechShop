import Http from "src/Helpers/http"
import { queryParamConfigVoucher } from "src/Types/queryParams.type"

export const VoucherAPI = {
  // lấy danh sách voucher
  getVouchers: (params: queryParamConfigVoucher, signal: AbortSignal) => {
    return Http.get(`/admin/vouchers`, {
      params,
      signal
    })
  },

  // Tạo voucher mới
  createVoucher: (data: {
    code: string
    description?: string
    type: "percentage" | "fixed"
    value: number
    max_discount?: number
    min_order_value: number
    usage_limit?: number
    start_date: string
    end_date: string
    status: "active" | "inactive" | "expired"
  }) => {
    return Http.post(`/admin/vouchers`, data)
  },

  // Cập nhật voucher
  updateVoucher: (
    id: string,
    data: {
      code?: string
      description?: string
      type?: "percentage" | "fixed"
      value?: number
      max_discount?: number
      min_order_value?: number
      usage_limit?: number
      start_date?: string
      end_date?: string
      status?: "active" | "inactive" | "expired"
    }
  ) => {
    return Http.put(`/admin/vouchers/${id}`, data)
  },

  // Xóa voucher
  deleteVoucher: (id: string) => {
    return Http.delete(`/admin/vouchers/${id}`)
  }
}
