import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { Card, Typography, Steps, Divider, Radio, Button, Space } from "antd"
import { OrderType } from "src/Types/product.type"
import { formatCurrency } from "src/Helpers/common"
import iconCod from "src/Assets/img/icon_cod.png"
import iconVnpay from "src/Assets/img/icon_vnpay.jpg"
import { useEffect, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { path } from "src/Constants/path"
import {
  ChevronLeft,
  ShoppingCart,
  Package,
  CreditCard,
  Tag as TagIcon,
  User,
  Phone,
  MapPin,
  Mail,
  FileText,
  Wallet,
  CheckCircle2
} from "lucide-react"
import { OrderApi } from "src/Apis/client/order.api"

const { Text, Title } = Typography

export default function PaymentMethod() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const infoOrder = state?.infoOrder as OrderType
  const voucher = state?.voucher as string
  const [methodPayment, setMethodPayment] = useState("cod")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    window.scroll(0, 0)
  }, [])

  const createOrderMutation = useMutation({
    mutationFn: (body: OrderType) => {
      return OrderApi.createOrderPayment(body)
    }
  })

  const createOrderCODMutation = useMutation({
    mutationFn: (body: OrderType) => {
      return OrderApi.createOrderPaymentCOD(body)
    }
  })

  const handleSubmitPayment = async () => {
    const body = {
      ...infoOrder,
      type_order: methodPayment
    }
    setLoading(true)
    if (body.type_order === "cod") {
      const response = await createOrderCODMutation.mutateAsync(body)
      navigate(path.CheckoutSuccessCod, {
        state: {
          infoOrder: response?.data.findOrder
        }
      })
    } else {
      const toastId = toast.loading("Đang xử lý thanh toán. Vui lòng chờ trong giây lát...")
      try {
        const response = await createOrderMutation.mutateAsync(body, {
          onSuccess: () => {
            toast.dismiss(toastId)
          }
        })
        if (response.data.url) {
          window.location.href = response.data.url
        }
      } catch (error) {
        console.error("Error creating payment URL:", error)
        setLoading(false)
      }
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>Phương thức thanh toán - TechZone</title>
        <meta
          name="description"
          content="Hoàn tất đơn hàng của bạn tại TechZone. Nhập thông tin cá nhân, địa chỉ, phương thức thanh toán và đặt mua laptop, PC, linh kiện chính hãng ngay hôm nay."
        />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-6">
        <div className="container mx-auto px-4" style={{ maxWidth: "1200px" }}>
          {/* Header */}
          <div className="mb-6">
            <Link
              to={path.InfoOrder}
              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={18} />
              <span className="text-sm font-medium">Quay lại thông tin đặt hàng</span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Progress Steps */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-6">
              <Steps
                current={2}
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
                    title: <span className="text-gray-500">Hoàn tất</span>,
                    icon: <TagIcon className="text-gray-400" size={20} />
                  }
                ]}
              />
            </div>

            {/* Payment Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <CreditCard className="text-blue-500" size={24} />
                Xác nhận đơn hàng
              </h1>
            </div>

            {/* Order Info */}
            <div className="p-6">
              <Card className="bg-gray-50 border-gray-200 mb-6">
                <Title level={5} className="mb-4 flex items-center gap-2">
                  <User size={18} className="text-blue-500" />
                  Thông tin khách hàng
                </Title>
                <Space direction="vertical" size="small" className="w-full">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <Text className="text-gray-600">Tên người nhận:</Text>
                    <Text strong className="text-gray-800">
                      {infoOrder?.customer_info.name}
                    </Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <Text className="text-gray-600">Số điện thoại:</Text>
                    <Text strong className="text-gray-800">
                      {infoOrder?.customer_info.phone}
                    </Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <Text className="text-gray-600">Email:</Text>
                    <Text strong className="text-gray-800">
                      {infoOrder?.customer_info.email}
                    </Text>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-gray-400 mt-1" />
                    <Text className="text-gray-600">Địa chỉ:</Text>
                    <Text strong className="text-gray-800 flex-1">
                      {infoOrder?.customer_info.address}
                    </Text>
                  </div>
                  {infoOrder?.note && (
                    <div className="flex items-start gap-2 mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <FileText size={16} className="text-yellow-600 mt-1" />
                      <div className="flex-1">
                        <Text className="text-gray-600">Ghi chú:</Text>
                        <Text className="text-gray-800 block mt-1 italic">`{infoOrder?.note}`</Text>
                      </div>
                    </div>
                  )}
                </Space>
              </Card>

              {/* Order Summary */}
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 mb-6">
                <Title level={5} className="mb-4 flex items-center gap-2">
                  <Package size={18} className="text-blue-500" />
                  Chi tiết đơn hàng
                </Title>
                <Space direction="vertical" size="middle" className="w-full">
                  <div className="flex justify-between items-center">
                    <Text className="text-gray-700">Tạm tính:</Text>
                    <Text strong className="text-gray-800 text-lg">
                      {formatCurrency(infoOrder?.subTotal)}đ
                    </Text>
                  </div>
                  <div className="flex justify-between items-center text-green-600">
                    <span className="flex items-center gap-2">
                      <TagIcon size={16} />
                      Giảm giá voucher
                    </span>
                    <span className="text-lg font-semibold">-{formatCurrency(Number(voucher))}đ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text className="text-gray-700">Phí vận chuyển:</Text>
                    <Text strong className="text-gray-800 text-lg">
                      {formatCurrency(infoOrder?.shipping_fee)}đ
                    </Text>
                  </div>
                  <Divider className="my-2 bg-blue-300" />
                  <div className="flex justify-between items-center">
                    <Text className="text-lg font-bold text-gray-800">Tổng thanh toán:</Text>
                    <Text className="text-2xl font-bold text-red-500">{formatCurrency(infoOrder?.totalAmount)}đ</Text>
                  </div>
                </Space>
              </Card>

              {/* Payment Method */}
              <Card className="border-gray-200">
                <Title level={5} className="mb-4 flex items-center gap-2">
                  <Wallet size={18} className="text-blue-500" />
                  Chọn phương thức thanh toán
                </Title>
                <Radio.Group
                  onChange={(e) => setMethodPayment(e.target.value)}
                  value={methodPayment}
                  className="w-full"
                >
                  <Space direction="horizontal" size="middle" className="w-full flex items-center">
                    <button
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        methodPayment === "cod" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() => setMethodPayment("cod")}
                    >
                      <Radio value="cod" />
                      <img src={iconCod} alt="COD" className="w-10 h-10" />
                      <div className="flex-1">
                        <Text strong className="text-base block">
                          Thanh toán khi nhận hàng (COD)
                        </Text>
                        <Text className="text-xs text-gray-500">Thanh toán bằng tiền mặt khi nhận được hàng</Text>
                      </div>
                      {methodPayment === "cod" && <CheckCircle2 size={20} className="text-blue-500" />}
                    </button>

                    <button
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        methodPayment === "vnpay"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() => setMethodPayment("vnpay")}
                    >
                      <Radio value="vnpay" />
                      <img src={iconVnpay} alt="VNPay" className="w-10 h-10" />
                      <div className="flex-1">
                        <Text strong className="text-base block">
                          Thanh toán online qua VNPAY
                        </Text>
                        <Text className="text-xs text-gray-500">
                          Thanh toán qua thẻ ATM, Visa, MasterCard, JCB, QR Code
                        </Text>
                      </div>
                      {methodPayment === "vnpay" && <CheckCircle2 size={20} className="text-blue-500" />}
                    </button>
                  </Space>
                </Radio.Group>
              </Card>

              {/* Submit Button */}
              <div className="mt-6 flex justify-end gap-3">
                <Button size="large" onClick={() => navigate(-1)} className="px-8">
                  Quay lại
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSubmitPayment}
                  loading={loading}
                  disabled={loading}
                  className="bg-red-500 hover:!bg-red-600 border-none px-8 text-base font-bold shadow-lg"
                  icon={<CreditCard size={18} />}
                >
                  {methodPayment === "cod" ? "Đặt hàng ngay" : "Thanh toán ngay"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
