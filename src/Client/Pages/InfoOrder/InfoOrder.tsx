/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query"
import { Button, Col, Form, Image, Input, Row, Steps, Table, Typography } from "antd"
import { useContext, useEffect, useRef } from "react"
import { Helmet } from "react-helmet-async"
import { Link, useLocation } from "react-router-dom"
import { toast } from "react-toastify"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { OrderApi } from "src/Apis/order.api"
import { AppContext } from "src/Context/authContext"
import { CalculateSalePrice, formatCurrency, slugify } from "src/Helpers/common"
import Http from "src/Helpers/http"
import { OrderType } from "src/Types/product.type"
import { motion } from "framer-motion"

const { Text } = Typography
const { TextArea } = Input

const shipping_fee = 30000

export default function InfoOrder() {
  const { nameUser } = useContext(AppContext)
  const { state } = useLocation()
  const listCart = state?.selectedProducts
  const totalPriceProducts = state?.totalPriceProducts
  const columns = [
    {
      title: "STT",
      dataIndex: "select",
      render: (_: any, __: any, index: number) => <Text>{index + 1}</Text>,
      width: 50
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      render: (_: any, record: any) => (
        <Link
          to={{
            pathname: `/products/${slugify(record.name)}-i-${record.key}`
          }}
          style={{ display: "flex", gap: 16, alignItems: "center" }}
        >
          <Image src={record.image} width={80} />
          <div>
            <Text>{record.name}</Text>
          </div>
        </Link>
      )
    },
    {
      title: "Đơn giá",
      render: (_: any, record: any) => (
        <div>
          {record.discount === 0 ? (
            <Text strong>{record.price.toLocaleString()}₫</Text>
          ) : (
            <Text delete style={{ color: "#aaa" }}>
              {record.price.toLocaleString()}₫
            </Text>
          )}

          <br />
          {record.discount !== 0 ? <Text strong>{CalculateSalePrice(record.price, record.discount)}đ</Text> : ""}
        </div>
      ),
      width: 150
    },
    {
      title: "Số lượng",
      render: (_: any, record: any) => <Text strong>{record.quantity}</Text>,
      width: 120
    },
    {
      title: "Giá",
      render: (_: any, record: any) => {
        return (
          <Text type="danger" strong>
            {record.discount !== 0
              ? formatCurrency((record.price - record.price * (record.discount / 100)) * record.quantity)
              : formatCurrency(record.price * record.quantity)}
            ₫
          </Text>
        )
      },
      width: 150
    }
  ]

  // xử lý đặt hàng
  const [form] = Form.useForm()

  const didInit = useRef(false)

  useEffect(() => {
    if (!didInit.current) {
      form.setFieldValue("name", nameUser)
      didInit.current = true
    }
  }, [form, nameUser])

  useEffect(() => {
    window.scroll(0, 0) // scroll mượt
  }, [])

  const createOrderMutation = useMutation({
    mutationFn: (body: OrderType) => {
      return OrderApi.createOrder(body)
    }
  })

  const onFinish = async (values: { name: string; phone: string; address: string; email: string; note?: string }) => {
    const orderList = listCart?.map((item: any) => {
      return {
        product_id: item.key,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        discount: item.discount
      }
    })
    const body: OrderType = {
      customer_info: {
        name: values.name,
        phone: values.phone,
        address: values.address,
        email: values.email
      },
      products: orderList,
      subtotal: totalPriceProducts, // tiền tạm tính
      shipping_fee,
      totalAmount: totalPriceProducts + shipping_fee,
      note: values.note !== undefined ? values.note : ""
    }

    const toastId = toast.loading("Đang xử lý thanh toán. Vui lòng chờ trong giây lát...")
    try {
      const response = await Http.post("/payment", {
        amount: totalPriceProducts, // số tiền
        orderDescription: "Thanh toán đơn hàng", // mô tả đơn hàng
        orderType: "billpayment", // loại đơn hàng
        language: "vn" // ngôn ngữ
      })
      toast.dismiss(toastId)
      if (response) {
        createOrderMutation.mutate(body)
        window.location.href = response.data.url
      }
    } catch (error) {
      console.error("Error creating payment URL:", error)
    }
  }

  return (
    <div>
      <Helmet>
        <title>Tiến hành đặt hàng</title>
        <meta
          name="description"
          content="Hoàn tất đơn hàng của bạn tại TechZone. Nhập thông tin cá nhân, địa chỉ, phương thức thanh toán và đặt mua laptop, PC, linh kiện chính hãng ngay hôm nay."
        />
      </Helmet>
      <div className="my-4">
        <div className="container">
          <NavigateBack />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="p-4 bg-white rounded-md mt-4">
              <div className="relative">
                <div className="bg-red-50 px-4 py-6">
                  <Steps
                    size="small"
                    current={1}
                    type="default"
                    items={[
                      {
                        title: <span style={{ color: "red", fontWeight: "500" }}>Giỏ hàng</span>
                      },
                      {
                        title: <span style={{ color: "red", fontWeight: "500" }}>Thông tin đặt hàng</span>
                      },
                      {
                        title: <span className="text-gray-500">Thanh toán</span>
                      },
                      {
                        title: <span className="text-gray-500">Hoàn tất</span>
                      }
                    ]}
                  />
                </div>

                <div className="mt-4">
                  <h1 className="text-[15px] mb-2 font-semibold ml-1">Thông tin đơn hàng</h1>

                  <Table columns={columns} dataSource={listCart} pagination={false} bordered />

                  <div className="mt-4">
                    <h2 className="text-[15px] mb-2 font-semibold ml-1">Thông tin khách hàng</h2>
                    <Form
                      form={form}
                      name="layout-multiple-horizontal"
                      layout="vertical"
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 24 }}
                      onFinish={onFinish}
                    >
                      <Row gutter={12}>
                        <Col span={8}>
                          <Form.Item
                            layout="vertical"
                            label="Tên người nhận"
                            name="name"
                            rules={[{ required: true, message: "Vui lòng nhập tên người nhận" }]}
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            layout="vertical"
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: "Vui lòng nhập email", type: "email" }]}
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                          >
                            <Input />
                          </Form.Item>
                        </Col>

                        <Col span={8}>
                          <Form.Item
                            layout="vertical"
                            label="Số điện thoại"
                            name="phone"
                            rules={[
                              { required: true, message: "Vui lòng nhập số điện thoại" },
                              { pattern: /^[0-9]{9,11}$/, message: "Số điện thoại không hợp lệ" }
                            ]}
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        layout="vertical"
                        label="Địa chỉ"
                        name="address"
                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      >
                        <TextArea rows={1} />
                      </Form.Item>

                      <Form.Item
                        layout="vertical"
                        label="Ghi chú"
                        name="note"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      >
                        <TextArea rows={2} />
                      </Form.Item>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <div>
                          <span>Tạm tính ({listCart?.length})</span>
                          <span style={{ padding: "0 4px" }}>sản phẩm:</span>
                        </div>
                        <span style={{ color: "#ff4d4f", fontWeight: 500, fontSize: "16px" }}>
                          {formatCurrency(totalPriceProducts)}đ
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <div>
                          <span>Phí vận chuyển</span>
                        </div>
                        <span style={{ color: "#ff4d4f", fontWeight: 500, fontSize: "16px" }}>
                          {formatCurrency(shipping_fee)}đ
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <div>
                          <span>Tổng tiền </span>
                        </div>
                        <span style={{ color: "#ff4d4f", fontWeight: 500, fontSize: "16px" }}>
                          {formatCurrency(totalPriceProducts + shipping_fee)}đ
                        </span>
                      </div>

                      <Form.Item>
                        <div className="flex justify-end">
                          <Button
                            type="default"
                            htmlType="submit"
                            className="custom-button"
                            style={{
                              marginTop: "5px",
                              padding: "0 20px",
                              height: "40px",
                              fontWeight: "bold",
                              color: "white",
                              border: "none"
                            }}
                          >
                            Thanh toán
                          </Button>
                        </div>
                      </Form.Item>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
