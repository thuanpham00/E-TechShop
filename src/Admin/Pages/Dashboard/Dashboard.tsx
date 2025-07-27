import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { useState } from "react"
import StatisticalSell from "./Components/StatisticalSell"
import StatisticalProduct from "./Components/StatisticalProduct"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(1)

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
        <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
          Thống kê hệ thống
        </h1>
        <div className="flex items-center mb-2">
          <button
            onClick={() => setActiveTab(1)}
            className={`rounded-tl-sm rounded-bl-sm px-2 py-3 border-r border-gray-300 cursor-pointer hover:bg-gray-300 duration-100 ${activeTab === 1 ? "bg-blue-500 text-white font-semibold" : "bg-white"}`}
          >
            Quản lý bán hàng
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`px-2 py-3 border-r border-gray-300 cursor-pointer hover:bg-gray-300 duration-100 ${activeTab === 2 ? "bg-blue-500 text-white font-semibold" : "bg-white"}`}
          >
            Quản lý sản phẩm
          </button>
          <button
            onClick={() => setActiveTab(3)}
            className={`px-2 py-3 border-r border-gray-300 cursor-pointer hover:bg-gray-300 duration-100 ${activeTab === 3 ? "bg-blue-500 text-white font-semibold" : "bg-white"}`}
          >
            Quản lý người dùng
          </button>
          <button
            onClick={() => setActiveTab(4)}
            className={`rounded-tr-sm rounded-br-sm px-2 py-3 border-r border-gray-300 cursor-pointer hover:bg-gray-300 duration-100  ${activeTab === 4 ? "bg-blue-500 text-white font-semibold" : "bg-white"}`}
          >
            Quản lý cung ứng
          </button>
        </div>
        {activeTab === 1 && <StatisticalSell />}

        {activeTab === 2 && <StatisticalProduct />}
      </div>
    </div>
  )
}
