import { Steps, Card, Button, Typography } from "antd"
import {
  ShoppingCart,
  Package,
  CreditCard,
  Tag as TagIcon,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Mail,
  FileText,
  Truck,
  Calendar
} from "lucide-react"
import { Helmet } from "react-helmet-async"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { path } from "src/Constants/path"
import { convertDateTime, formatCurrency } from "src/Helpers/common"
import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getAccessTokenFromLS } from "src/Helpers/auth"

const { Text } = Typography

export default function PaymentSuccessCod() {
  const queryClient = useQueryClient()
  const token = getAccessTokenFromLS()
  const { state } = useLocation()
  const infoOrder = state?.infoOrder
  const calledRef = useRef(false)

  useEffect(() => {
    window.scroll(0, 0)
  }, [])

  useEffect(() => {
    if (calledRef.current) return
    queryClient.invalidateQueries({ queryKey: ["listCart", token] })
    queryClient.invalidateQueries({ queryKey: ["listOrder", token] })
    calledRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>Thanh toán thành công - TechZone</title>
        <meta
          name="description"
          content="Đơn hàng của bạn đã được thanh toán thành công tại TechZone. Chúng tôi sẽ xử lý và giao hàng trong thời gian sớm nhất."
        />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-6">
        <div className="container mx-auto px-4" style={{ maxWidth: "900px" }}>
          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Progress Steps */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-6">
              <Steps
                current={3}
                items={[
                  {
                    title: <span className="text-blue-600 font-semibold">Giỏ hàng</span>,
                    icon: <ShoppingCart className="text-blue-600" size={20} />
                  },
                  {
                    title: <span className="text-blue-600 font-semibold">Thông tin đặt hàng</span>,
                    icon: <Package className="text-blue-600" size={20} />
                  },
                  {
                    title: <span className="text-blue-600 font-semibold">Thanh toán</span>,
                    icon: <CreditCard className="text-blue-600" size={20} />
                  },
                  {
                    title: <span className="text-blue-600 font-semibold">Hoàn tất</span>,
                    icon: <TagIcon className="text-blue-600" size={20} />
                  }
                ]}
              />
            </div>

            {/* Success Message */}
            <div className="px-6 py-8">
              <div className="flex flex-col items-center mb-8">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <CheckCircle2 size={48} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Đặt hàng thành công!</h2>
                <p className="text-gray-600 text-center max-w-md">
                  Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn để xác nhận đơn hàng trong thời gian sớm nhất.
                </p>
              </div>

              {/* Order Details */}
              <Card className="bg-gray-50 border-gray-200 mb-6">
                <div className="space-y-4">
                  {/* Order ID */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Package size={18} className="text-blue-500" />
                      <Text className="text-gray-600">Mã đơn hàng:</Text>
                    </div>
                    <Text strong className="text-blue-600 font-mono">
                      #{infoOrder?._id?.slice(-8)?.toUpperCase()}
                    </Text>
                  </div>

                  {/* Payment Method */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <CreditCard size={18} className="text-blue-500" />
                      <Text className="text-gray-600">Phương thức thanh toán:</Text>
                    </div>
                    <Text strong className="text-gray-800">
                      {infoOrder?.type_order === "cod"
                        ? "Thanh toán khi giao hàng (COD)"
                        : "Thanh toán online qua VNPay"}
                    </Text>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User size={18} className="text-blue-500" />
                        <Text className="text-gray-600">Khách hàng:</Text>
                      </div>
                      <Text strong className="text-gray-800">
                        {infoOrder?.customer_info.name}
                      </Text>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone size={18} className="text-blue-500" />
                        <Text className="text-gray-600">Số điện thoại:</Text>
                      </div>
                      <Text strong className="text-gray-800">
                        {infoOrder?.customer_info.phone}
                      </Text>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail size={18} className="text-blue-500" />
                        <Text className="text-gray-600">Email:</Text>
                      </div>
                      <Text strong className="text-gray-800">
                        {infoOrder?.customer_info.email}
                      </Text>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-blue-500 mt-1" />
                        <Text className="text-gray-600">Địa chỉ nhận hàng:</Text>
                      </div>
                      <Text strong className="text-gray-800 text-right max-w-md">
                        {infoOrder?.customer_info.address}
                      </Text>
                    </div>
                  </div>

                  {/* Note */}
                  {infoOrder?.note && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start gap-2">
                        <FileText size={16} className="text-yellow-600 mt-1" />
                        <div>
                          <Text className="text-gray-600 text-sm block mb-1">Ghi chú:</Text>
                          <Text className="text-gray-800 italic">`{infoOrder?.note}`</Text>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Date */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-blue-500" />
                      <Text className="text-gray-600">Ngày đặt hàng:</Text>
                    </div>
                    <Text strong className="text-gray-800">
                      {convertDateTime(infoOrder?.updated_at)}
                    </Text>
                  </div>
                </div>
              </Card>

              {/* Total Amount */}
              <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck size={20} className="text-red-500" />
                    <Text className="text-lg font-semibold text-gray-800">Số tiền cần thanh toán:</Text>
                  </div>
                  <Text className="text-3xl font-bold text-red-500">{formatCurrency(infoOrder?.totalAmount)}đ</Text>
                </div>
                {infoOrder?.type_order === "cod" && (
                  // <Divider className="my-3" />
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <FileText size={16} className="mt-0.5" />
                    <Text className="text-gray-600">
                      Vui lòng chuẩn bị số tiền trên khi nhận hàng. Cảm ơn bạn đã tin tưởng TechZone!
                    </Text>
                  </div>
                )}
              </Card>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4 justify-center">
                <Link to={path.Order}>
                  <Button size="large" className="px-8">
                    Xem đơn hàng
                  </Button>
                </Link>
                <Link to={path.Home}>
                  <Button
                    type="primary"
                    size="large"
                    className="bg-blue-500 hover:!bg-blue-600 border-none px-8 font-bold shadow-lg"
                  >
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
