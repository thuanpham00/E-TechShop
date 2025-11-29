import { Steps, Card, Divider, Button, Typography } from "antd"
import {
  ShoppingCart,
  Package,
  CreditCard,
  Tag as TagIcon,
  CheckCircle2,
  Calendar,
  Building2,
  Wallet
} from "lucide-react"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { path } from "src/Constants/path"
import { formatCurrency } from "src/Helpers/common"
import useQueryParams from "src/Hook/useQueryParams"
import { motion } from "framer-motion"
import { useEffect, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getAccessTokenFromLS } from "src/Helpers/auth"
import { OrderApi } from "src/Apis/client/order.api"

const { Text } = Typography

export default function PaymentSuccessVNPay() {
  const queryClient = useQueryClient()
  const paramsUrl = useQueryParams()
  const calledRef = useRef(false)
  const token = getAccessTokenFromLS()

  const { mutate } = useMutation({
    mutationFn: (orderId: string) => {
      return OrderApi.callBackVnpay(orderId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listOrder", token] })
      queryClient.invalidateQueries({ queryKey: ["listCart", token] })
    }
  })

  useEffect(() => {
    window.scroll(0, 0)
  }, [])

  useEffect(() => {
    if (calledRef.current) return
    const vnp_responseCode = paramsUrl?.vnp_ResponseCode
    if (vnp_responseCode === "00") {
      mutate(paramsUrl.vnp_TxnRef)
      calledRef.current = true
    }
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
                <h2 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h2>
                <p className="text-gray-600 text-center max-w-md mb-4">
                  Đơn hàng của bạn đã được thanh toán thành công qua VNPay. Cảm ơn bạn đã tin tưởng TechZone!
                </p>
                <div className="text-3xl font-bold text-red-500">
                  {formatCurrency(Number(paramsUrl.vnp_Amount.slice(0, -2)))}đ
                </div>
              </div>

              {/* Transaction Details */}
              <Card className="bg-gray-50 border-gray-200 mb-6">
                <div className="space-y-4">
                  {/* Order ID */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Package size={18} className="text-blue-500" />
                      <Text className="text-gray-600">Mã đơn hàng:</Text>
                    </div>
                    <Text strong className="text-blue-600 font-mono">
                      #{paramsUrl.vnp_TxnRef}
                    </Text>
                  </div>

                  {/* Payment Method */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <CreditCard size={18} className="text-blue-500" />
                      <Text className="text-gray-600">Phương thức thanh toán:</Text>
                    </div>
                    <Text strong className="text-gray-800">
                      {paramsUrl.vnp_CardType === "ATM" ? "Thanh toán qua VNPay" : "Thanh toán online"}
                    </Text>
                  </div>

                  {/* Bank Code */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Building2 size={18} className="text-blue-500" />
                      <Text className="text-gray-600">Ngân hàng:</Text>
                    </div>
                    <Text strong className="text-gray-800 uppercase">
                      {paramsUrl.vnp_BankCode}
                    </Text>
                  </div>

                  {/* Transaction Date */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-blue-500" />
                      <Text className="text-gray-600">Thời gian giao dịch:</Text>
                    </div>
                    <Text strong className="text-gray-800">
                      {paramsUrl.vnp_PayDate}
                    </Text>
                  </div>

                  {/* Order Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet size={18} className="text-blue-500 mt-1" />
                      <Text className="text-gray-600">Diễn giải:</Text>
                    </div>
                    <Text strong className="text-gray-800 text-right max-w-md">
                      {paramsUrl.vnp_OrderInfo}
                    </Text>
                  </div>
                </div>
              </Card>

              {/* Total Amount */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-center justify-between flex-col md:flex-row">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-green-500" />
                    <Text className="text-lg font-semibold text-gray-800">Số tiền đã thanh toán:</Text>
                  </div>
                  <Text className="text-lg md:text-3xl font-bold text-green-600">
                    {formatCurrency(Number(paramsUrl.vnp_Amount.slice(0, -2)))}đ
                  </Text>
                </div>
                <Divider className="my-3" />
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <Text className="text-gray-600">
                    Giao dịch của bạn đã được xử lý thành công. Chúng tôi sẽ chuẩn bị và giao hàng trong thời gian sớm
                    nhất!
                  </Text>
                </div>
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
