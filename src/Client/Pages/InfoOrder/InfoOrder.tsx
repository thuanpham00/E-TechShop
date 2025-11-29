/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Col, Form, Image, Input, Row, Steps, Table, Typography, Card, Divider, Space } from "antd"
import { useContext, useEffect, useRef, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { AppContext } from "src/Context/authContext"
import { CalculateSalePrice, formatCurrency, slugify } from "src/Helpers/common"
import { OrderType } from "src/Types/product.type"
import { motion } from "framer-motion"
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
  Truck,
  CheckCircle2
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { VoucherClientAPI } from "src/Apis/client/voucher.api"

const { Text, Title } = Typography
const { TextArea } = Input

const shipping_fee = 30000

export default function InfoOrder() {
  const navigate = useNavigate()
  const { nameUser } = useContext(AppContext)
  const { state } = useLocation()
  const listCart = state?.selectedProducts
  const totalPriceProducts = state?.totalPriceProducts

  // Voucher states
  const [voucherCode, setVoucherCode] = useState("")
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null)
  const [voucherDiscount, setVoucherDiscount] = useState(0)
  const [showVoucherDropdown, setShowVoucherDropdown] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["listVoucherAvailable", totalPriceProducts],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return VoucherClientAPI.getAvailableVouchers(totalPriceProducts)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 3 phút nó không gọi lại api
    enabled: !!totalPriceProducts // chỉ chạy query khi có totalPriceProducts
  })

  const listVouchersAvailable = data?.data.data

  const columns = [
    {
      title: "STT",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, index: number) => <Text className="font-medium">{index + 1}</Text>
    },
    {
      title: "Sản phẩm",
      width: 400,
      render: (_: any, record: any) => (
        <Link
          to={{
            pathname: `/products/${slugify(record.name)}-i-${record.key}`
          }}
          className="flex gap-4 items-center hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            <Image
              src={record.image}
              width={80}
              height={80}
              className="rounded-lg border-2 border-gray-100"
              preview={false}
            />
            {record.discount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -{record.discount}%
              </span>
            )}
          </div>
          <div className="flex-1">
            <Text strong className="text-gray-800 line-clamp-2">
              {record.name}
            </Text>
          </div>
        </Link>
      )
    },
    {
      title: "Đơn giá",
      width: 150,
      align: "center" as const,
      render: (_: any, record: any) => (
        <div className="text-center">
          {record.discount > 0 ? (
            <>
              <Text delete className="text-gray-400 text-sm block">
                {formatCurrency(record.price)}đ
              </Text>
              <Text strong className="text-red-500 text-base">
                {CalculateSalePrice(record.price, record.discount)}đ
              </Text>
            </>
          ) : (
            <Text strong className="text-gray-800 text-base">
              {formatCurrency(record.price)}đ
            </Text>
          )}
        </div>
      )
    },
    {
      title: "Số lượng",
      width: 120,
      align: "center" as const,
      render: (_: any, record: any) => (
        <Text strong className="text-gray-800">
          x{record.quantity}
        </Text>
      )
    },
    {
      title: "Thành tiền",
      width: 150,
      align: "center" as const,
      render: (_: any, record: any) => {
        const finalPrice = record.discount !== 0 ? record.price - record.price * (record.discount / 100) : record.price
        return (
          <Text strong className="text-red-500 text-lg">
            {formatCurrency(finalPrice * record.quantity)}đ
          </Text>
        )
      }
    }
  ]

  const [form] = Form.useForm()
  const didInit = useRef(false)

  useEffect(() => {
    if (!didInit.current) {
      form.setFieldValue("name", nameUser)
      didInit.current = true
    }
  }, [form, nameUser])

  useEffect(() => {
    window.scroll(0, 0)
  }, [])

  // Xử lý xóa voucher
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherDiscount(0)
  }

  // Tính tổng cuối cùng

  const filteredVouchers =
    listVouchersAvailable?.filter(
      (voucher: any) =>
        voucher.code.toLowerCase().includes(voucherCode.toLowerCase()) ||
        voucher.description?.toLowerCase().includes(voucherCode.toLowerCase())
    ) || []

  // Hàm tính discount
  const calculateDiscount = (voucher: any) => {
    if (voucher.type === "percentage") {
      let discount = (totalPriceProducts * voucher.value) / 100
      if (voucher.max_discount && discount > voucher.max_discount) {
        discount = voucher.max_discount
      }
      return discount
    }
    return voucher.value
  }

  // Hàm chọn voucher từ dropdown
  const handleSelectVoucher = (voucher: any) => {
    const discount = calculateDiscount(voucher)
    setAppliedVoucher(voucher)
    setVoucherDiscount(discount)
    setVoucherCode("")
    setShowVoucherDropdown(false)
  }

  const finalTotal = totalPriceProducts + shipping_fee - voucherDiscount

  const onFinish = async (values: { name: string; phone: string; address: string; email: string; note?: string }) => {
    const orderList = listCart?.map((item: any) => ({
      product_id: item.key,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      discount: item.discount
    }))

    const body: OrderType = {
      customer_info: {
        name: values.name,
        phone: values.phone,
        address: values.address,
        email: values.email
      },
      products: orderList,
      subTotal: totalPriceProducts,
      shipping_fee,
      totalAmount: finalTotal,
      note: values.note || ""
    }

    if (appliedVoucher) {
      body.voucher_id = appliedVoucher._id
      body.voucher_code = appliedVoucher.code
      body.discount_amount = voucherDiscount
    }

    navigate(path.PaymentMethod, {
      state: {
        infoOrder: body,
        voucher: voucherDiscount
      }
    })
  }

  const listVoucher = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const clickOutHideList = (event: MouseEvent) => {
      if (listVoucher.current && !listVoucher.current.contains(event.target as Node)) {
        setShowVoucherDropdown(false)
      }
    }

    document.addEventListener("mousedown", clickOutHideList)
    return () => document.removeEventListener("mousedown", clickOutHideList) // khi component unmount đi thì nó giải phóng bộ nhớ
  }, [])

  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>Thông tin đặt hàng - TechZone</title>
        <meta
          name="description"
          content="Hoàn tất đơn hàng của bạn tại TechZone. Nhập thông tin cá nhân, địa chỉ, phương thức thanh toán và đặt mua laptop, PC, linh kiện chính hãng ngay hôm nay."
        />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-6">
        <div className="container mx-auto px-4" style={{ maxWidth: "1200px" }}>
          <div className="mb-6">
            <Link
              to={path.Cart}
              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={18} />
              <span className="text-sm font-medium">Quay lại giỏ hàng</span>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-6">
              <Steps
                current={1}
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
                    title: <span className="text-gray-500">Thanh toán</span>,
                    icon: <CreditCard className="text-gray-400" size={20} />
                  },
                  {
                    title: <span className="text-gray-500">Hoàn tất</span>,
                    icon: <TagIcon className="text-gray-400" size={20} />
                  }
                ]}
              />
            </div>

            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="text-blue-500" size={24} />
                <span className="hidden md:block">Thông tin đơn hàng</span>
                <span className="text-blue-500">({listCart?.length} sản phẩm)</span>
              </h1>
            </div>

            <div className="p-6">
              <Table
                columns={columns}
                dataSource={listCart}
                pagination={false}
                bordered
                className="order-table"
                scroll={{ x: "max-content" }}
              />
            </div>

            <Divider className="my-0" />

            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="text-blue-500" size={22} />
                Thông tin khách hàng
              </h2>

              <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={
                        <span className="flex items-center gap-2 font-medium">
                          <User size={16} />
                          Tên người nhận
                        </span>
                      }
                      name="name"
                      rules={[{ required: true, message: "Vui lòng nhập tên người nhận" }]}
                    >
                      <Input size="large" placeholder="Nhập tên người nhận" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={
                        <span className="flex items-center gap-2 font-medium">
                          <Mail size={16} />
                          Email
                        </span>
                      }
                      name="email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        { type: "email", message: "Email không hợp lệ" }
                      ]}
                    >
                      <Input size="large" placeholder="example@email.com" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={
                        <span className="flex items-center gap-2 font-medium">
                          <Phone size={16} />
                          Số điện thoại
                        </span>
                      }
                      name="phone"
                      rules={[
                        { required: true, message: "Vui lòng nhập số điện thoại" },
                        { pattern: /^[0-9]{9,11}$/, message: "Số điện thoại không hợp lệ" }
                      ]}
                    >
                      <Input size="large" placeholder="0123456789" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={
                    <span className="flex items-center gap-2 font-medium">
                      <MapPin size={16} />
                      Địa chỉ giao hàng
                    </span>
                  }
                  name="address"
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                >
                  <TextArea
                    rows={2}
                    size="large"
                    placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="flex items-center gap-2 font-medium">
                      <FileText size={16} />
                      Ghi chú (không bắt buộc)
                    </span>
                  }
                  name="note"
                >
                  <TextArea
                    rows={3}
                    size="large"
                    placeholder="Ghi chú thêm cho đơn hàng (ví dụ: giao hàng giờ hành chính, gọi trước khi giao...)"
                  />
                </Form.Item>

                {/* Order Summary */}
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                  {/* Voucher Section */}
                  <div className="mb-4 p-4 bg-white rounded-lg border border-dashed border-blue-300">
                    <Title level={5} className="mb-3 flex items-center gap-2">
                      <TagIcon size={18} className="text-orange-500" />
                      Mã giảm giá
                    </Title>

                    {/* Input voucher */}
                    {!appliedVoucher && (
                      <div className="relative">
                        <Space.Compact style={{ width: "100%" }}>
                          <Input
                            size="large"
                            placeholder="Nhập mã voucher (VD: TECHZONE10, SALE50K)"
                            prefix={<TagIcon size={16} className="text-gray-400" />}
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                            onFocus={() => setShowVoucherDropdown(true)}
                          />
                        </Space.Compact>

                        {/* Dropdown voucher list */}
                        {showVoucherDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                            {isLoading ? (
                              <div className="p-4 text-center text-gray-500">Đang tải voucher...</div>
                            ) : filteredVouchers.length > 0 ? (
                              <div className="p-2 flex items-center gap-2 flex-wrap" ref={listVoucher}>
                                {filteredVouchers.map((voucher: any) => {
                                  const estimatedDiscount = calculateDiscount(voucher)
                                  return (
                                    <button
                                      key={voucher._id}
                                      className={`p-3 mb-2 rounded-lg cursor-pointer transition-all bg-green-50 border border-green-200 hover:bg-green-100`}
                                      onClick={() => handleSelectVoucher(voucher)}
                                    >
                                      <div className="flex items-start justify-start">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono font-bold text-orange-600">{voucher.code}</span>
                                          </div>

                                          {voucher.description && (
                                            <p className="text-sm text-gray-700 mb-1 text-left">
                                              {voucher.description}
                                            </p>
                                          )}

                                          <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-gray-500">
                                              Đơn tối thiểu: {formatCurrency(voucher.min_order_value)}đ
                                            </span>
                                            {
                                              <span className="text-xs text-green-600 font-semibold">
                                                💰 Tiết kiệm: {formatCurrency(estimatedDiscount)}đ
                                              </span>
                                            }
                                          </div>
                                        </div>

                                        {
                                          <div className="ml-2 flex-shrink-0">
                                            <Button type="primary" size="small">
                                              Chọn
                                            </Button>
                                          </div>
                                        }
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            ) : voucherCode ? (
                              <div className="p-4 text-center text-gray-500">
                                Không tìm thấy voucher phù hợp với `{voucherCode}`
                              </div>
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                {listVouchersAvailable?.length > 0
                                  ? "Nhập mã voucher để tìm kiếm"
                                  : "Không có voucher khả dụng cho đơn hàng này"}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Applied voucher */}
                    {appliedVoucher && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-green-500" />
                          <div>
                            <Text className="text-green-700 block">
                              Đã áp dụng:{" "}
                              <Text strong className="text-green-800">
                                {appliedVoucher.code}
                              </Text>
                            </Text>
                            <Text className="text-xs text-green-600">
                              Giảm{" "}
                              {appliedVoucher.type === "percentage"
                                ? `${appliedVoucher.value}%`
                                : `${formatCurrency(appliedVoucher.value)}đ`}
                            </Text>
                          </div>
                        </div>
                        <Button type="text" size="small" danger onClick={handleRemoveVoucher}>
                          Xóa
                        </Button>
                      </div>
                    )}
                  </div>

                  <Divider className="my-3" />

                  {/* Price Summary */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 flex items-center gap-2">
                        <Package size={16} />
                        Tạm tính ({listCart?.length} sản phẩm)
                      </span>
                      <span className="text-lg font-semibold text-gray-800">{formatCurrency(totalPriceProducts)}đ</span>
                    </div>

                    {/* Discount from voucher */}
                    {appliedVoucher && voucherDiscount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="flex items-center gap-2">
                          <TagIcon size={16} />
                          Giảm giá voucher
                        </span>
                        <span className="text-lg font-semibold">-{formatCurrency(voucherDiscount)}đ</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 flex items-center gap-2">
                        <Truck size={16} />
                        Phí vận chuyển
                      </span>
                      <span className="text-lg font-semibold text-gray-800">{formatCurrency(shipping_fee)}đ</span>
                    </div>
                    <Divider className="my-2 bg-blue-300" />
                    <div className="flex justify-between items-center">
                      <span className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">
                        <CreditCard size={20} />
                        Tổng thanh toán
                      </span>
                      <span className="text-lg md:text-2xl font-bold text-red-500">{formatCurrency(finalTotal)}đ</span>
                    </div>
                  </div>
                </Card>

                {/* Submit Button */}
                <Form.Item className="mb-0 mt-6">
                  <div className="flex justify-end gap-3">
                    <Button size="large" onClick={() => navigate(path.Cart)} className="px-8">
                      Quay lại
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      className="bg-red-500 hover:!bg-red-600 border-none px-8 font-bold shadow-lg"
                    >
                      Tiếp tục thanh toán
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        .order-table .ant-table-thead > tr > th {
          background: #f8fafc;
          font-weight: 600;
          color: #1e293b;
          padding: 16px;
        }
        
        .order-table .ant-table-tbody > tr > td {
          padding: 16px;
        }
        
        .order-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc;
        }
      `}</style>
    </div>
  )
}
