/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Table, Tag, Typography } from "antd"
import { ChevronLeft } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { OrderApi } from "src/Apis/order.api"
import { getAccessTokenFromLS } from "src/Helpers/auth"
import cartImg from "src/Assets/img/cart.png"
import { useEffect, useState } from "react"
import { convertDateTime, formatCurrency } from "src/Helpers/common"

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

export default function Order() {
  const token = getAccessTokenFromLS()
  const [listOrder, setListOrder] = useState<OrderList>([])
  const { data } = useQuery({
    queryKey: ["listOrder", token],
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

  return (
    <div>
      <Helmet>
        <title>Đơn hàng mua sắm</title>
        <meta name="description" content="Đây là trang Đơn hàng mua sắm của hệ thống" />
      </Helmet>
      <div className="my-4">
        <div className="container">
          <Link to={"/home"} className="flex items-center gap-[2px] cursor-pointer">
            <ChevronLeft size={16} color="blue" />
            <span className="text-[14px] font-medium text-blue-500">Mua thêm sản phẩm khác</span>
          </Link>

          <div className="p-4 bg-white rounded-md mt-4">
            {lengthOrder > 0 ? (
              <div>
                <h1 className="mb-2 ml-1 text-lg font-semibold">Danh sách đơn hàng ({listOrder.length}) của bạn</h1>
                <Table
                  columns={columns}
                  dataSource={listOrder}
                  pagination={false}
                  bordered
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
                                    <p className="text-sm text-gray-600">
                                      Đơn giá:{" "}
                                      {formatCurrency(
                                        (item.price - item.price * (item.discount / 100)) * item.quantity
                                      )}
                                      đ
                                    </p>
                                  ) : (
                                    <p className="text-sm text-gray-600">
                                      Đơn giá: {formatCurrency(item.price * item.quantity)} đ
                                    </p>
                                  )}
                                  <p className="text-sm font-semibold text-gray-700">
                                    Thành tiền: {formatCurrency(item.price * item.quantity)} đ
                                  </p>
                                </div>
                              </div>
                            )
                          })}

                          <div className="text-red-500 text-base text-right font-semibold">
                            Tổng tiền: {formatCurrency(total)} đ
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
    </div>
  )
}
