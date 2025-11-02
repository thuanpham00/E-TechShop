/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { Modal, Table, Tabs, TabsProps, Tag, Typography, Empty, Spin } from "antd"
import { ChevronLeft, Package, Clock, MapPin, Phone, User, CreditCard } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { getAccessTokenFromLS } from "src/Helpers/auth"
import { useEffect, useMemo, useState } from "react"
import { convertDateTime, formatCurrency } from "src/Helpers/common"
import Button from "src/Components/Button"
import { toast } from "react-toastify"
import { queryClient } from "src/main"
import { motion } from "framer-motion"
import { OrderApi } from "src/Apis/client/order.api"

type OrderList = {
  key: string
  time: string
  total: number
  status: string
  name: string
  address: string
  phone: number
}[]

const { Text } = Typography

const items: TabsProps["items"] = [
  { key: "1", label: "Tất cả" },
  { key: "2", label: "Chờ xác nhận" },
  { key: "3", label: "Đang xử lý" },
  { key: "4", label: "Đang vận chuyển" },
  { key: "5", label: "Đã giao hàng" },
  { key: "6", label: "Đã hủy" }
]

export default function Order() {
  const token = getAccessTokenFromLS()
  const [activeTabKey, setActiveTabKey] = useState("1")
  const [listOrder, setListOrder] = useState<OrderList>([])
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["listOrderClient", token],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 10000)
      return OrderApi.getOrders(controller.signal)
    },
    retry: 0,
    staleTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData
  })

  const listOrderData = data?.data?.result
  const lengthOrder = data?.data?.total

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bgColor: string; icon: string }> = {
      "Chờ xác nhận": { color: "orange", bgColor: "bg-orange-50", icon: "⏳" },
      "Đang xử lý": { color: "blue", bgColor: "bg-blue-50", icon: "📦" },
      "Đang vận chuyển": { color: "cyan", bgColor: "bg-cyan-50", icon: "🚚" },
      "Đã giao hàng": { color: "green", bgColor: "bg-green-50", icon: "✅" },
      "Đã hủy": { color: "red", bgColor: "bg-red-50", icon: "❌" }
    }
    return configs[status] || { color: "default", bgColor: "bg-gray-50", icon: "📋" }
  }

  const columns = [
    {
      title: "Mã đơn hàng",
      fixed: "left" as const,
      width: 150,
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2">
          <Package size={16} className="text-blue-500" />
          <Text strong className="text-blue-500 text-sm">
            #{record.key.slice(-8)}
          </Text>
        </div>
      )
    },
    {
      title: "Thông tin người nhận",
      width: 250,
      render: (_: any, record: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User size={14} className="text-gray-400" />
            <Text className="text-sm font-medium">{record.name}</Text>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-gray-400" />
            <Text className="text-xs text-gray-500">{record.phone}</Text>
          </div>
        </div>
      )
    },
    {
      title: "Địa chỉ giao hàng",
      width: 220,
      render: (_: any, record: any) => (
        <div className="flex items-start gap-2">
          <MapPin size={14} className="text-gray-400 mt-0.5" />
          <Text className="text-xs text-gray-600 line-clamp-2">{record.address}</Text>
        </div>
      )
    },
    {
      title: "Ngày đặt",
      width: 160,
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400" />
          <Text className="text-xs">{convertDateTime(record.time)}</Text>
        </div>
      )
    },
    {
      title: "Tổng tiền",
      width: 130,
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2">
          <CreditCard size={14} className="text-red-500" />
          <Text strong className="text-red-500 text-sm">
            {formatCurrency(record.totalAmount)}đ
          </Text>
        </div>
      )
    },
    {
      title: "Trạng thái",
      width: 150,
      render: (_: any, record: any) => {
        const config = getStatusConfig(record.status)
        return (
          <Tag color={config.color} className="text-xs px-3 py-1">
            {config.icon} {record.status}
          </Tag>
        )
      }
    }
  ]

  useEffect(() => {
    if (listOrderData) {
      const list: OrderList = listOrderData?.map((item: any) => ({
        key: item._id,
        time: item.created_at,
        subTotal: item.subTotal,
        shipping_fee: item.shipping_fee,
        totalAmount: item.totalAmount,
        status: item.status,
        name: item.customer_info.name,
        address: item.customer_info.address,
        phone: item.customer_info.phone,
        products: item.products,
        discount_amount: item.discount_amount
      }))
      setListOrder(list)
    }
  }, [listOrderData])

  const filterListOrder = useMemo(() => {
    const statusMap: Record<string, string> = {
      "2": "Chờ xác nhận",
      "3": "Đang xử lý",
      "4": "Đang vận chuyển",
      "5": "Đã giao hàng",
      "6": "Đã hủy"
    }
    return activeTabKey === "1" ? listOrder : listOrder.filter((order) => order.status === statusMap[activeTabKey])
  }, [activeTabKey, listOrder])

  const updateOrderStatus = useMutation({
    mutationFn: (body: { idOrder: string; status: number }) =>
      OrderApi.updateStatusOrderForCustomer(body.idOrder, body.status)
  })

  const handleCancelOrder = (idOrder: string) => {
    setConfirmLoading(true)
    updateOrderStatus.mutate(
      { idOrder, status: 0 },
      {
        onSuccess: (res) => {
          toast.success(res.data.message, { autoClose: 1500 })
          queryClient.invalidateQueries({ queryKey: ["listOrderClient", token] })
          setOpen(false)
          setConfirmLoading(false)
        },
        onError: () => {
          toast.error("Hủy đơn hàng thất bại", { autoClose: 1500 })
          setConfirmLoading(false)
        }
      }
    )
  }

  const showModal = (orderId: string) => {
    setSelectedOrder(orderId)
    setOpen(true)
  }

  return (
    <div className="bg-gray-50">
      <Helmet>
        <title>Đơn hàng của tôi - TechZone</title>
        <meta name="description" content="Quản lý đơn hàng mua sắm tại TechZone" />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-6">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-2">
            <Link
              to="/home"
              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={18} />
              <span className="text-sm font-medium">Tiếp tục mua sắm</span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : lengthOrder > 0 ? (
              <div>
                {/* Title */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Package className="text-blue-500" size={28} />
                    Đơn hàng của tôi
                    <span className="text-blue-500">({lengthOrder})</span>
                  </h1>
                </div>

                {/* Tabs */}
                <Tabs activeKey={activeTabKey} items={items} onChange={setActiveTabKey} className="mb-4" />

                {/* Table */}
                <Table
                  columns={columns}
                  dataSource={filterListOrder}
                  pagination={{
                    pageSize: 5,
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "20"],
                    showTotal: (total, range) => (
                      <span className="text-sm text-gray-600">
                        Hiển thị {range[0]}-{range[1]} trong {total} đơn hàng
                      </span>
                    )
                  }}
                  expandable={{
                    expandedRowRender: (record: any) => (
                      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                        {/* Products */}
                        <div className="space-y-3">
                          {record.products.map((item: any) => {
                            const discountedPrice = item.discount
                              ? item.price - item.price * (item.discount / 100)
                              : item.price
                            const totalPrice = discountedPrice * item.quantity

                            return (
                              <div
                                key={item.product_id}
                                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-20 h-20 object-cover rounded-lg border-2 border-gray-100"
                                    />
                                    {item.discount > 0 && (
                                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        -{item.discount}%
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800 mb-1">{item.name}</p>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                      <span className="bg-gray-100 px-2 py-1 rounded">SL: {item.quantity}</span>
                                      <span>×</span>
                                      <span className="font-medium">{formatCurrency(discountedPrice)}đ</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  {item.discount > 0 && (
                                    <p className="text-sm text-gray-400 line-through">{formatCurrency(item.price)}đ</p>
                                  )}
                                  <p className="text-lg font-bold text-red-500">{formatCurrency(totalPrice)}đ</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Summary */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Tạm tính</span>
                            <span className="font-medium">{formatCurrency(record.subTotal)}đ</span>
                          </div>
                          {record.discount_amount > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Giảm giá voucher</span>
                              <span className="font-medium">{formatCurrency(record.discount_amount)}đ</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Phí vận chuyển</span>
                            <span className="font-medium">{formatCurrency(record.shipping_fee)}đ</span>
                          </div>
                          <div className="h-px bg-gray-200" />
                          <div className="flex justify-between text-lg font-bold">
                            <span className="text-gray-800">Tổng cộng</span>
                            <span className="text-red-500">{formatCurrency(record.totalAmount)}đ</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-2">
                          <p className="text-sm text-red-500">
                            * Bạn chỉ có thể hủy đơn hàng khi đang ở trạng thái Chờ xác nhận
                          </p>
                          <div className="flex gap-3">
                            <Button
                              classNameButton={`px-6 py-2 text-white font-medium rounded-lg transition-all ${
                                record.status === "Chờ xác nhận"
                                  ? "bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg"
                                  : "bg-gray-300 cursor-not-allowed"
                              }`}
                              nameButton="Hủy đơn hàng"
                              onClick={() => showModal(record.key)}
                              disabled={record.status !== "Chờ xác nhận"}
                            />
                            <Button
                              classNameButton={`px-6 py-2 text-white font-medium rounded-lg transition-all ${
                                record.status === "Đang vận chuyển"
                                  ? "bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg"
                                  : "bg-gray-300 cursor-not-allowed"
                              }`}
                              nameButton="Đã nhận hàng"
                              disabled={record.status !== "Đang vận chuyển"}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  }}
                />
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg mb-2">Chưa có đơn hàng nào</p>
                    <p className="text-gray-400 text-sm">Hãy khám phá và mua sắm ngay!</p>
                  </div>
                }
              >
                <Link
                  to="/home"
                  className="inline-block mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Mua sắm ngay
                </Link>
              </Empty>
            )}
          </div>
        </div>
      </motion.div>

      {/* Cancel Order Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-lg">
            <span className="text-2xl">⚠️</span>
            <span>Xác nhận hủy đơn hàng</span>
          </div>
        }
        open={open}
        onOk={() => selectedOrder && handleCancelOrder(selectedOrder)}
        confirmLoading={confirmLoading}
        onCancel={() => setOpen(false)}
        okText="Xác nhận hủy"
        cancelText="Quay lại"
        okButtonProps={{
          className: "bg-red-500 hover:bg-red-600"
        }}
      >
        <div className="space-y-3 py-4">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
            <p className="text-sm text-yellow-800">
              Đơn hàng sau khi hủy sẽ không thể phục hồi và các sản phẩm sẽ được hoàn về kho.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
