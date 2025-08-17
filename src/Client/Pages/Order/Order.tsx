/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { Modal, Table, Tabs, TabsProps, Tag, Typography } from "antd"
import { ChevronLeft } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { OrderApi } from "src/Apis/order.api"
import { getAccessTokenFromLS } from "src/Helpers/auth"
import cartImg from "src/Assets/img/cart.png"
import { Fragment, useEffect, useMemo, useState } from "react"
import { convertDateTime, formatCurrency } from "src/Helpers/common"
import Button from "src/Components/Button"
import { toast } from "react-toastify"
import { queryClient } from "src/main"
import { motion } from "framer-motion"

type OrderList = {
  key: string // mã đơn hàng
  time: string // thời gian tạo đơn
  total: number // tổng tiền
  status: string // trạng thái đơn hàng
  name: string // người nhận hàng
  address: string // địa chỉ
  phone: number // số điện thoại
}[]

const { Text } = Typography

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "Tất cả"
  },
  {
    key: "2",
    label: "Chờ xác nhận"
  },
  {
    key: "3",
    label: "Đang xử lý"
  },
  {
    key: "4",
    label: "Đang vận chuyển"
  },
  {
    key: "5",
    label: "Đã giao hàng"
  },
  {
    key: "6",
    label: "Đã hủy"
  }
]

export default function Order() {
  const token = getAccessTokenFromLS()
  const [activeTabKey, setActiveTabKey] = useState("1")
  const [listOrder, setListOrder] = useState<OrderList>([])
  const { data } = useQuery({
    queryKey: ["listOrderClient", token],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return OrderApi.getOrders(controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 10 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const listOrderData = data?.data?.result
  const lengthOrder = data?.data?.total

  const columns = [
    {
      title: "Mã đơn hàng",
      fixed: "left" as const, // đảm bảo là literal type
      render: (_: any, record: any) => (
        <Text strong className="text-blue-500">
          {record.key}
        </Text>
      )
    },
    {
      title: "Tên người nhận",
      render: (_: any, record: any) => (
        <div>
          <Text>{record.name}</Text>
        </div>
      ),
      width: 180
    },
    {
      title: "Địa chỉ",
      render: (_: any, record: any) => (
        <div>
          <Text>{record.address}</Text>
        </div>
      ),
      width: 180
    },
    {
      title: "Số điện thoại",
      render: (_: any, record: any) => (
        <div>
          <Text>{record.phone}</Text>
        </div>
      ),
      width: 120
    },
    {
      title: "Ngày tạo đơn",
      render: (_: any, record: any) => <Text>{convertDateTime(record.time)}</Text>,
      width: 180
    },
    {
      title: "Đơn giá",
      render: (_: any, record: any) => (
        <Text strong className="text-red-500">
          {formatCurrency(record.total)} đ
        </Text>
      ),
      width: 120
    },
    {
      title: "Trạng thái",
      render: (_: any, record: any) => {
        const status = record.status
        let color = ""
        switch (status) {
          case "Chờ xác nhận":
            color = "orange"
            break
          case "Đang xử lý":
            color = "blue"
            break
          case "Đang vận chuyển":
            color = "cyan"
            break
          case "Đã giao hàng":
            color = "green"
            break
          case "Đã hủy":
            color = "red"
            break
          default:
            color = "default"
        }

        return (
          <Tag color={color} className="text-sm">
            {status}
          </Tag>
        )
      },
      width: 180
    }
  ]

  useEffect(() => {
    if (listOrderData) {
      const list: OrderList = listOrderData?.map((item: any) => {
        return {
          key: item._id,
          time: item.created_at,
          total: item.totalAmount,
          status: item.status,
          name: item.customer_info.name,
          address: item.customer_info.address,
          phone: item.customer_info.phone,
          products: item.products
        }
      })
      setListOrder(list)
    }
  }, [listOrderData])

  const filterListOrder = useMemo(() => {
    switch (activeTabKey) {
      case "2":
        return listOrder.filter((order) => order.status === "Chờ xác nhận")
      case "3":
        return listOrder.filter((order) => order.status === "Đang xử lý")
      case "4":
        return listOrder.filter((order) => order.status === "Đang vận chuyển")
      case "5":
        return listOrder.filter((order) => order.status === "Đã giao hàng")
      case "6":
        return listOrder.filter((order) => order.status === "Đã hủy")
      default:
        return listOrder // Tất cả
    }
  }, [activeTabKey, listOrder])

  const updateOrderStatus = useMutation({
    mutationFn: (body: { idOrder: string; status: number }) => {
      return OrderApi.updateStatusOrderForCustomer(body.idOrder, body.status)
    }
  })

  const handleCancelOrder = (idOrder: string, status: number) => {
    updateOrderStatus.mutate(
      { idOrder, status },
      {
        onSuccess: (res) => {
          queryClient.invalidateQueries({ queryKey: ["listOrderClient", token] })
          toast.success(res.data.message, { autoClose: 1500 })
        }
      }
    )
  }

  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const showModal = () => {
    setOpen(true)
  }

  const handleOk = (idOrder: string) => {
    setConfirmLoading(true)
    setTimeout(() => {
      setOpen(false)
      setConfirmLoading(false)
    }, 2000)
    handleCancelOrder(idOrder, 0)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <div>
      <Helmet>
        <title>Đơn hàng mua sắm</title>
        <meta
          name="description"
          content="Quản lý đơn hàng mua sắm tại TechZone: kiểm tra trạng thái, chi tiết và lịch sử đơn hàng của bạn."
        />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="my-4">
          <div className="container">
            <Link to={"/home"} className="flex items-center gap-[2px] cursor-pointer">
              <ChevronLeft size={16} color="blue" />
              <span className="text-[14px] font-medium text-blue-500">Mua thêm sản phẩm khác</span>
            </Link>

            <div className="p-4 bg-white border border-gray-300 rounded-md mt-4">
              {lengthOrder > 0 ? (
                <div>
                  <h1 className="mb-2 ml-1 text-lg font-semibold">Danh sách đơn hàng ({listOrder.length}) của bạn</h1>
                  <Tabs
                    defaultActiveKey="1"
                    items={items}
                    centered={true}
                    tabBarStyle={{ width: "100%" }}
                    onChange={setActiveTabKey}
                  />
                  <Table
                    columns={columns}
                    dataSource={filterListOrder}
                    pagination={{
                      pageSize: 5,
                      showSizeChanger: true,
                      pageSizeOptions: ["10", "20", "50"],
                      showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trong ${total} đơn hàng`
                    }}
                    expandable={{
                      expandedRowRender: (record: any) => {
                        let total = 0
                        return (
                          <div className="space-y-3">
                            {record.products.map((item: any) => {
                              total +=
                                item.discount !== 0
                                  ? (item.price - item.price * (item.discount / 100)) * item.quantity
                                  : item.price * item.quantity
                              return (
                                <div
                                  key={item.product_id}
                                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md shadow-sm bg-white"
                                >
                                  <div className="flex items-center gap-4">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-16 h-16 object-cover rounded-md border"
                                    />
                                    <div>
                                      <p className="font-medium text-gray-800">{item.name}</p>
                                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                    </div>
                                  </div>

                                  {/* Giá tiền */}
                                  <div className="text-right">
                                    {item.discount !== 0 ? (
                                      <div>
                                        <p className="text-sm text-gray-600">
                                          Đơn giá: {formatCurrency(item.price - item.price * (item.discount / 100))}đ
                                        </p>
                                        <p className="text-sm font-semibold text-gray-700">
                                          Thành tiền:{" "}
                                          {formatCurrency(
                                            (item.price - item.price * (item.discount / 100)) * item.quantity
                                          )}
                                          đ
                                        </p>
                                      </div>
                                    ) : (
                                      <div>
                                        <p className="text-sm text-gray-600">Đơn giá: {formatCurrency(item.price)} đ</p>
                                        <p className="text-sm font-semibold text-gray-700">
                                          Thành tiền: {formatCurrency(item.price * item.quantity)}đ
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}

                            <div className="text-red-500 text-base text-right font-semibold">
                              Tổng tiền: {formatCurrency(total)} đ
                            </div>

                            <div className="flex justify-between items-center gap-2">
                              <span className="text-red-500">
                                Bạn chỉ có thể hủy hàng nếu đơn hàng chưa được xác nhận
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  classNameButton={`px-4 py-2 w-full text-white font-semibold rounded-lg duration-200 ${record.status === "Chờ xác nhận" ? "bg-red-500 hover:bg-red-500/80" : " bg-red-300 cursor-not-allowed"}`}
                                  nameButton="Hủy đơn hàng"
                                  onClick={showModal}
                                  disabled={record.status !== "Chờ xác nhận"}
                                />
                                <Button
                                  classNameButton={`px-4 py-2 w-full text-white font-semibold rounded-lg duration-200 ${record.status === "Đang vận chuyển" ? "bg-blue-500 hover:bg-blue-500/80" : " bg-blue-300 cursor-not-allowed"}`}
                                  nameButton="Đã nhận hàng"
                                  disabled={record.status !== "Đang vận chuyển"}
                                />
                                <Modal
                                  title="Bạn có chắc chắn muốn hủy đơn hàng này không?"
                                  open={open}
                                  onOk={() => handleOk(record.key)}
                                  confirmLoading={confirmLoading}
                                  onCancel={handleCancel}
                                  className="top-1/2 -translate-y-1/2"
                                  okText={"Xác nhận hủy"}
                                  cancelText={"Thoát"}
                                  okButtonProps={{
                                    className: "bg-red-500 hover:bg-red-600 text-white"
                                  }}
                                >
                                  <Fragment>
                                    <div>
                                      Hành động này không thể hoàn tác. Đơn hàng sau khi hủy sẽ không thể phục hồi và
                                      các sản phẩm trong đơn sẽ được hoàn về kho (nếu áp dụng).
                                    </div>
                                    <div className="mt-2">Vui lòng xác nhận để tiếp tục.</div>
                                  </Fragment>
                                </Modal>
                              </div>
                            </div>
                          </div>
                        )
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="p-4 flex items-center justify-center flex-col">
                  <img src={cartImg} alt="ảnh lỗi" className="w-[150px]" />
                  <span className="text-sm">Chưa có đơn hàng!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
