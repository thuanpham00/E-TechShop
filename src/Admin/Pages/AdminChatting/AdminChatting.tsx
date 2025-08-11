import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { motion } from "framer-motion"
import { useState } from "react"
import { Empty, Input, Skeleton, Space } from "antd"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { conversationAPI } from "src/Apis/conversation.api"
import avatarDefault from "src/Assets/img/avatarDefault.png"

const MessageObject = {
  staff: "staff",
  customer: "customer"
}
const { Search } = Input

type UserTypeItem = {
  _id: string
  name: string
  email: string
  role: string
  numberPhone: string
  avatar: string
}

export default function AdminChatting() {
  const [activeTab, setActiveTab] = useState(MessageObject.staff)

  const getUserListTypeQuery = useQuery({
    queryKey: ["listUserType", activeTab],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return conversationAPI.getUserListType(controller.signal, { type_user: activeTab })
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 5 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const listUserData = getUserListTypeQuery.data?.data.result.result as UserTypeItem[]
  console.log(listUserData)

  return (
    <div>
      <Helmet>
        <title>Hệ thống chat</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mt-2 flex">
          <div className="w-1/4 p-4 bg-white">
            <div className="flex items-center justify-center">
              <button
                className={`flex-1 py-2 border ${activeTab === MessageObject.staff ? "border-blue-500  bg-blue-500 text-white" : ""}`}
                onClick={() => setActiveTab(MessageObject.staff)}
              >
                Nhân viên
              </button>
              <button
                className={`flex-1 py-2 border ${activeTab === MessageObject.customer ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300"}`}
                onClick={() => setActiveTab(MessageObject.customer)}
              >
                Khách hàng
              </button>
            </div>

            <Space direction="vertical" style={{ width: "100%", marginTop: "16px" }}>
              <Search placeholder="Tìm kiếm..." allowClear style={{ width: "100%" }} enterButton />
            </Space>

            <div>
              {getUserListTypeQuery.isLoading && <Skeleton />}
              {getUserListTypeQuery.isFetched &&
                (listUserData.length > 0 ? (
                  <div className="mt-3 h-[450px] overflow-y-auto">
                    {listUserData.map((item) => (
                      <div key={item._id} className="flex gap-2 p-2">
                        <img
                          src={item.avatar || avatarDefault}
                          alt={item.name}
                          className="w-[40px] h-[40px] object-contain rounded-full"
                        />
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          <span>hello</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty />
                ))}
            </div>
          </div>
          <div className="w-2/4">2</div>
          <div className="w-1/4">3</div>
        </div>
      </motion.div>
    </div>
  )
}
