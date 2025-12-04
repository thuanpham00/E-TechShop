import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import StatisticalSell from "./Components/StatisticalSell"
import StatisticalProduct from "./Components/StatisticalProduct"
import StatisticalUser from "./Components/StatisticalUser"
import { Tabs, TabsProps } from "antd"
import StatisticalSupply from "./Components/StatisticalSupply"
import StatisticalProfit from "./Components/StatisticalProfit"

export default function Dashboard() {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: <div>Quản lý bán hàng</div>,
      children: <StatisticalSell />
    },
    {
      key: "2",
      label: "Quản lý sản phẩm",
      children: <StatisticalProduct />
    },
    {
      key: "3",
      label: "Quản lý người dùng",
      children: <StatisticalUser />
    },
    {
      key: "4",
      label: "Quản lý cung ứng",
      children: <StatisticalSupply />
    },
    {
      key: "5",
      label: "Quản lý lợi nhuận",
      children: <StatisticalProfit />
    }
  ]

  return (
    <div>
      <Helmet>
        <title>Quản lý thống kê hệ thống</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />
      <div>
        <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">
          Thống kê hệ thống
        </h1>

        <div className="flex">
          <Tabs defaultActiveKey="1" items={items} />
        </div>
      </div>
    </div>
  )
}
