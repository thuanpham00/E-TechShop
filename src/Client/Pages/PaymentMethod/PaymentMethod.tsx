import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { motion } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import { Card, Typography, Space, Steps, Input, Divider, Radio } from "antd"
import "./PaymentMethod.css"
import { OrderType } from "src/Types/product.type"
import { formatCurrency } from "src/Helpers/common"
import iconCod from "src/Assets/img/icon_cod.png"
import iconVnpay from "src/Assets/img/icon_vnpay.jpg"
import Button from "src/Components/Button"
import { useEffect, useState } from "react"
import { OrderApi } from "src/Apis/order.api"
import { useMutation } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { path } from "src/Constants/path"

const { TextArea } = Input
const { Text, Title } = Typography

export default function PaymentMethod() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const infoOrder = state?.infoOrder as OrderType // hong cần tạo state vì chỉ gán giá trị 1 lần load nó ko thay đổi theo thời gian và ko cần re-render giao diện nên chỉ cần đặt biến
  const [methodPayment, setMethodPayment] = useState("cod")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    window.scroll(0, 0) // scroll mượt
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
      }
    }
  }

  return (
    <div>
      <Helmet>
        <title>Kiểm tra thông tin đơn hàng</title>
        <meta
          name="description"
          content="Hoàn tất đơn hàng của bạn tại TechZone. Nhập thông tin cá nhân, địa chỉ, phương thức thanh toán và đặt mua laptop, PC, linh kiện chính hãng ngay hôm nay."
        />
      </Helmet>

      <div className="my-4">
        <div className="container" style={{ maxWidth: "70rem" }}>
          <NavigateBack />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="p-4 bg-white rounded-md mt-4">
              <div className="relative">
                <div className="bg-red-50 px-4 py-6">
                  <Steps
                    size="small"
                    current={2}
                    type="default"
                    items={[
                      {
                        title: <span style={{ color: "red", fontWeight: "500" }}>Giỏ hàng</span>
                      },
                      {
                        title: <span style={{ color: "red", fontWeight: "500" }}>Thông tin đặt hàng</span>
                      },
                      {
                        title: <span style={{ color: "red", fontWeight: "500" }}>Thanh toán</span>
                      },
                      {
                        title: <span className="text-gray-500">Hoàn tất</span>
                      }
                    ]}
                  />
                </div>

                <div className="mt-4 info_order">
                  <Card title="Thông tin đơn hàng" style={{ maxWidth: "100%", margin: "0 auto", width: "100%" }}>
                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                      <div>
                        <Text className="text-base" strong>
                          Khách hàng:
                        </Text>{" "}
                        <Text className="text-base">{infoOrder?.customer_info.name}</Text>
                      </div>
                      <div>
                        <Text className="text-base" strong>
                          Số điện thoại:
                        </Text>{" "}
                        <Text className="text-base">{infoOrder?.customer_info.phone}</Text>
                      </div>
                      <div>
                        <Text strong className="text-base">
                          Email:
                        </Text>{" "}
                        <Text className="text-base">{infoOrder?.customer_info.email}</Text>
                      </div>
                      <div>
                        <Text strong className="text-base">
                          Địa chỉ nhận hàng:
                        </Text>{" "}
                        <Text className="text-base">{infoOrder?.customer_info.address}</Text>
                      </div>
                      <div>
                        <Text strong className="text-base">
                          Ghi chú:
                        </Text>{" "}
                        <TextArea className="text-base" value={infoOrder?.note} disabled />
                      </div>
                      <Divider />
                      <div>
                        <Text strong className="text-base">
                          Tạm tính:
                        </Text>{" "}
                        <Text className="text-base" type="danger" strong>
                          {formatCurrency(infoOrder?.subTotal)}đ
                        </Text>
                      </div>
                      <div>
                        <Text strong className="text-base">
                          Phí vận chuyển:
                        </Text>{" "}
                        <Text className="text-base" type="success" strong>
                          {formatCurrency(infoOrder?.shipping_fee)}đ
                        </Text>
                      </div>
                      <div>
                        <Text strong className="text-base">
                          Tổng tiền:
                        </Text>{" "}
                        <Text className="text-base" type="danger" strong>
                          {formatCurrency(infoOrder?.totalAmount)}đ
                        </Text>
                      </div>

                      <Divider />

                      <Title level={4}>Phương thức thanh toán</Title>
                      <Radio.Group
                        onChange={(e) => {
                          setMethodPayment(e.target.value)
                        }}
                        defaultValue={methodPayment}
                      >
                        <div className="flex items-center gap-8">
                          <Radio value="cod" />
                          <img src={iconCod} alt="iconCod" className="w-6 h-6" />
                          <Text className="font-normal text-base">Thanh toán khi giao hàng (COD)</Text>
                        </div>

                        <div className="flex items-center gap-8 mt-2">
                          <Radio value="vnpay" />
                          <img src={iconVnpay} alt="iconVnpay" className="w-6 h-6" />
                          <Text className="font-normal text-base">Thanh toán online qua Cổng thanh toán VNPAY</Text>
                        </div>
                      </Radio.Group>

                      <Divider />
                      <div className="flex items-center justify-between total_amount">
                        <Title level={4}>Tổng tiền:</Title>
                        <Title level={4} className="text-red-500">
                          {formatCurrency(infoOrder?.totalAmount)}đ
                        </Title>
                      </div>

                      <Button
                        classNameButton="mt-1 p-3 bg-red-500 w-full text-white font-semibold rounded-sm hover:bg-red-500/80 duration-200 text-lg"
                        nameButton="THANH TOÁN NGAY"
                        type="button"
                        onClick={handleSubmitPayment}
                        disabled={loading}
                      />
                    </Space>
                  </Card>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
