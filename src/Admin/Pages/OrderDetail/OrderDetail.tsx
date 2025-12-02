import { ArrowLeft, Package, User, MapPin, Phone, Calendar, CreditCard, Truck, Save, TagIcon } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Steps, Tag, Divider, Select, Button } from "antd"
import { OrderItemType } from "src/Types/product.type"
import { convertDateTime, formatCurrency } from "src/Helpers/common"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { OrderAPI } from "src/Apis/admin/order.api"
import { useContext, useState } from "react"
import { toast } from "react-toastify"
import PrintBill from "./Components/PrintBill"
import { AppContext } from "src/Context/authContext"
import { useCheckPermission } from "src/Hook/useRolePermissions"

export default function OrderDetail() {
  const { permissions } = useContext(AppContext)
  const { hasPermission } = useCheckPermission(permissions)

  const { state } = useLocation()
  const queryClient = useQueryClient()
  const orderData = state?.orderData as OrderItemType
  const type = state?.type as "process" | "completed" | "canceled"

  const navigate = useNavigate()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Chờ xác nhận":
        return "orange"
      case "Đang xử lý":
        return "blue"
      case "Đang vận chuyển":
        return "cyan"
      case "Đã giao hàng":
        return "green"
      case "Đã hủy":
        return "red"
      default:
        return "default"
    }
  }

  const [selectedStatus, setSelectedStatus] = useState<string>(orderData?.status || "")

  const statusOptions = [
    { value: "Chờ xác nhận", label: "Chờ xác nhận", color: "orange" },
    { value: "Đang xử lý", label: "Đang xử lý", color: "blue" },
    { value: "Đang vận chuyển", label: "Đang vận chuyển", color: "cyan" },
    { value: "Đã giao hàng", label: "Đã giao hàng", color: "green" },
    { value: "Đã hủy", label: "Đã hủy", color: "red" }
  ]

  const updateStatusOrderMutation = useMutation({
    mutationFn: (body: { id: string; status: string }) => {
      return OrderAPI.updateOrderStatus(body.id, body.status)
    }
  })

  const handleUpdateStatus = () => {
    if (!selectedStatus) {
      toast.error("Vui lòng chọn trạng thái", { autoClose: 1500 })
      return
    }

    if (selectedStatus === orderData.status) {
      toast.info("Trạng thái không thay đổi", { autoClose: 1500 })
      return
    }

    updateStatusOrderMutation.mutate(
      { id: orderData._id, status: selectedStatus },
      {
        onSuccess: (res) => {
          toast.success(res.data.message, { autoClose: 1500 })
          queryClient.invalidateQueries({ queryKey: ["listOrder"] })
          // Cập nhật local state
          orderData.status = selectedStatus as OrderItemType["status"]
          orderData.status_history.push({
            status: selectedStatus as OrderItemType["status"],
            updated_at: new Date().toISOString()
          })
        },
        onError: () => {
          toast.error("Cập nhật trạng thái thất bại", { autoClose: 1500 })
        }
      }
    )
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkSecond p-6 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkSecond">
      <Helmet>
        <title>{`Chi tiết đơn hàng #${orderData._id}`}</title>
        <meta name="description" content="Chi tiết đơn hàng" />
      </Helmet>

      {/* Header - Full width với gradient */}
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-800 dark:to-blue-900 shadow-lg rounded-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Quay lại</span>
              </button>
              <div className="h-8 w-px bg-white/30" />
              <div className="flex items-center gap-3">
                <Package size={24} className="text-white" />
                <div>
                  <p className="text-blue-100 text-sm">Mã đơn hàng</p>
                  <code className="text-white font-semibold text-lg">#{orderData._id}</code>
                </div>
              </div>
            </div>
            <Tag color={getStatusColor(orderData.status)} className="text-sm font-medium px-4 py-1.5">
              {orderData.status}
            </Tag>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <PrintBill order={orderData} />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto pb-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Shipping Info */}
            <div className="bg-white dark:bg-darkPrimary rounded-xl shadow-sm border border-gray-200 dark:border-darkBorder p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-500" />
                Thông tin người nhận
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Họ và tên</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white">
                      {orderData.customer_info.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Số điện thoại</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {orderData.customer_info.phone}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <MapPin size={14} />
                      Địa chỉ giao hàng
                    </p>
                    <p className="text-base font-medium text-gray-800 dark:text-white">
                      {orderData.customer_info.address}
                    </p>
                  </div>
                  {orderData.note && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ghi chú</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-darkSecond p-3 rounded-lg">
                        {orderData.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white dark:bg-darkPrimary rounded-xl shadow-sm border border-gray-200 dark:border-darkBorder p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Package size={20} className="text-blue-500" />
                Sản phẩm ({orderData.products.length})
              </h3>

              <div className="space-y-3">
                {orderData.products.map((item, index) => {
                  const discountedPrice = item.discount ? item.price - item.price * (item.discount / 100) : item.price
                  const totalPrice = discountedPrice * item.quantity

                  return (
                    <div key={item.product_id}>
                      {index > 0 && <Divider className="my-3" />}
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-100 dark:border-darkBorder"
                          />
                          {item.discount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              -{item.discount}%
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-1 truncate">{item.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span className="bg-gray-100 dark:bg-darkSecond px-2 py-1 rounded">
                              SL: {item.quantity}
                            </span>
                            <span>×</span>
                            <span className="font-medium">{formatCurrency(discountedPrice)}đ</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {item.discount > 0 && (
                            <p className="text-sm text-gray-400 line-through">{formatCurrency(item.price)}đ</p>
                          )}
                          <p className="text-lg font-bold text-red-500">{formatCurrency(totalPrice)}đ</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Divider />

              {/* Payment Summary */}
              <div className="space-y-3 bg-gray-50 dark:bg-darkSecond p-2 rounded-lg">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Tạm tính</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {formatCurrency(orderData.subTotal)}đ
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Truck size={14} />
                    Phí vận chuyển
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {formatCurrency(orderData.shipping_fee)}đ
                  </span>
                </div>

                {orderData.voucher_code && (
                  <div className="mb-3 p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <TagIcon size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-green-700 dark:text-green-400 font-medium">Mã giảm giá</p>
                          <p className="text-sm font-bold text-green-800 dark:text-green-300 font-mono">
                            {orderData.voucher_code}
                          </p>
                        </div>
                      </div>
                      <span className="text-base font-bold text-green-600 dark:text-green-400">
                        -{formatCurrency(orderData.discount_amount || 0)}đ
                      </span>
                    </div>
                  </div>
                )}

                <Divider className="my-2" />

                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <CreditCard size={18} />
                    Tổng cộng
                  </span>
                  <span className="text-2xl font-bold text-red-500">{formatCurrency(orderData.totalAmount)}đ</span>
                </div>
              </div>
            </div>

            {/* Time Info */}
            <div className="bg-white dark:bg-darkPrimary rounded-xl shadow-sm border border-gray-200 dark:border-darkBorder p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Calendar size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ngày tạo</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {convertDateTime(orderData.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Calendar size={20} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cập nhật lần cuối</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {convertDateTime(orderData.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Review */}
            {orderData.reviews && orderData.reviews.length > 0 && (
              <div className="bg-white dark:bg-darkPrimary rounded-xl shadow-sm border border-gray-200 dark:border-darkBorder p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Đánh giá đơn hàng</h3>
                <div className="space-y-6">
                  {orderData.reviews.map((review) => (
                    <div key={review._id} className="border-b pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={orderData.user_id.avatar}
                          alt={orderData.customer_info?.name}
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                        <span className="font-semibold">{orderData.customer_info?.name}</span>
                        <span className="ml-auto text-yellow-500 font-bold">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </span>
                      </div>
                      <div className="font-medium text-gray-800 mb-1">{review.title}</div>
                      <div className="text-gray-600">{review.comment}</div>
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {review.images.map((img) => (
                            <img
                              key={img.id}
                              src={img.url}
                              alt="review-img"
                              className="w-16 h-16 object-cover rounded border"
                            />
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(review.created_at).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-darkPrimary rounded-xl shadow-sm border border-gray-200 dark:border-darkBorder p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Cập nhật trạng thái</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Chọn trạng thái mới</div>
                  <Select
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    className="w-full"
                    size="large"
                    placeholder="Chọn trạng thái"
                    disabled={type === "completed" || type === "canceled" || !hasPermission("order:update")}
                  >
                    {statusOptions.map((option) => (
                      <Select.Option key={option.value} value={option.value}>
                        <Tag color={option.color} className="text-sm">
                          {option.label}
                        </Tag>
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<Save size={18} />}
                  onClick={handleUpdateStatus}
                  loading={updateStatusOrderMutation.isPending}
                  disabled={selectedStatus === orderData.status || type === "completed"}
                  className={`w-full ${selectedStatus === orderData.status || type === "completed" ? "!text-black dark:!text-white" : "!text-white dark:!text-white"}`}
                >
                  Cập nhật trạng thái
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-darkPrimary rounded-xl shadow-sm border border-gray-200 dark:border-darkBorder p-6 sticky top-20 mt-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Lịch sử đơn hàng</h3>
              <Steps
                progressDot
                current={orderData.status_history.length}
                direction="vertical"
                items={orderData.status_history.map((item) => ({
                  title: <span className="text-gray-800 dark:text-white font-medium">{item.status}</span>,
                  description: (
                    <span className="text-gray-500 dark:text-gray-400 text-xs">{convertDateTime(item.updated_at)}</span>
                  )
                }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
