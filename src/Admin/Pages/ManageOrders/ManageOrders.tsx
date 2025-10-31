/* eslint-disable @typescript-eslint/no-explicit-any */
import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { useState } from "react"
import { Tabs } from "antd"
import "./ManageOrders.css"
import OrderList from "./Components/OrderList"

export default function ManageOrders() {
  const [tab, setTab] = useState("process")

  return (
    <div>
      <Helmet>
        <title>Quản lý đơn hàng</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />

      <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
        Đơn hàng
      </h1>

      <Tabs
        activeKey={tab}
        onChange={(key) => setTab(key)}
        items={[
          {
            key: "process",
            label: "Đang xử lý",
            children: <OrderList type="process" />
          },
          {
            key: "completed",
            label: "Hoàn thành",
            children: <OrderList type="completed" />
          },
          {
            key: "canceled",
            label: "Đã hủy",
            children: <OrderList type="canceled" />
          }
        ]}
      />
    </div>
  )
}
