import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { motion } from "framer-motion"
import { useContext, useEffect, useMemo, useState } from "react"
import { Empty, Input, Skeleton, Space } from "antd"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { conversationAPI } from "src/Apis/conversation.api"
import avatarDefault from "src/Assets/img/avatarDefault.png"
import socket from "src/socket"
import { ConversationType } from "src/Client/Components/ChatConsulting/ChatConsulting"
import { AppContext } from "src/Context/authContext"
import { Send } from "lucide-react"
import InfiniteScroll from "react-infinite-scroll-component"

const MessageObject = {
  staff: "staff",
  customer: "customer"
}

type UserTypeItem = {
  _id: string
  name: string
  email: string
  role: string
  numberPhone: string
  avatar: string
  content: string
}

const LIMIT = 20
const PAGE = 1

export default function AdminChatting() {
  const { userId } = useContext(AppContext) // người gửi tin nhắn
  const [activeTab, setActiveTab] = useState(MessageObject.customer)
  const [userSelected, setUserSelected] = useState<UserTypeItem>()
  const [valueInput, setValueInput] = useState("")
  const [conversations, setConversations] = useState<ConversationType[]>([])

  const [pagination, setPagination] = useState({
    page: PAGE,
    total_page: 0
  })

  const [query, setQuery] = useState({
    limit: LIMIT,
    page: PAGE
  })

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

  useEffect(() => {
    if (listUserData) {
      setUserSelected(listUserData[0])
    }
  }, [listUserData])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleReceivedMessage = (data: any) => {
      const { payload } = data
      setConversations((prev) => [payload, ...prev])
    }

    socket.on("received_message", handleReceivedMessage)

    return () => {
      socket.off("received_message", handleReceivedMessage)
    }
  }, [])

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const conversation = {
      content: valueInput,
      sender_id: userId as string,
      receiver_id: userSelected?._id as string // người nhận (admin full quyền)
    }
    socket.emit("send_message", {
      payload: conversation
    })
    setConversations((prev) => [{ ...conversation, _id: new Date().getTime().toString() }, ...prev])
    setValueInput("")
  }

  const getDataConversation = useQuery({
    queryKey: ["conversationList", userSelected, query],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000)
      return conversationAPI.getConversation(controller.signal, userSelected?._id as string, query)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 10 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData,
    enabled: Boolean(userSelected)
  })

  const conversationListData = getDataConversation.data?.data.result.conversation as ConversationType[]
  const page = getDataConversation.data?.data.result.page
  const total_page = getDataConversation.data?.data.result.total_page

  useEffect(() => {
    if (conversationListData) {
      setConversations((prev) => [...prev, ...conversationListData])
      setPagination({
        page,
        total_page
      })
    }
  }, [conversationListData, page, total_page, userSelected])

  const fetchConversationDataMore = () => {
    if (pagination.page < pagination.total_page) {
      setQuery({
        page: pagination.page + 1,
        limit: LIMIT
      })
    }
  }

  const [searchTerm, setSearchTerm] = useState("")
  const filteredList = useMemo(() => {
    return listUserData?.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [listUserData, searchTerm])

  return (
    <div>
      <Helmet>
        <title>Hệ thống chat</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <section className="mt-2 flex">
          <div className="w-1/4 p-4 bg-white border border-gray-300">
            <NavigateBack />

            <div className="mt-2 flex items-center justify-center">
              <button
                className={`flex-1 py-2 border ${activeTab === MessageObject.customer ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300"}`}
                onClick={() => setActiveTab(MessageObject.customer)}
              >
                Khách hàng
              </button>
              <button
                className={`flex-1 py-2 border ${activeTab === MessageObject.staff ? "border-blue-500  bg-blue-500 text-white" : ""}`}
                onClick={() => setActiveTab(MessageObject.staff)}
              >
                Nhân viên
              </button>
            </div>

            <Space direction="vertical" style={{ width: "100%", marginTop: "16px" }}>
              <Input
                placeholder="Tìm kiếm..."
                allowClear
                style={{ width: "100%" }}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Space>

            {getUserListTypeQuery.isLoading && <Skeleton />}
            {getUserListTypeQuery.isFetched &&
              (listUserData?.length > 0 ? (
                <div className="mt-3 h-[calc(100vh-255px)] overflow-y-auto pr-2">
                  {filteredList.map((item) => (
                    <button
                      key={item._id}
                      className={`flex items-center gap-2 p-2 w-full duration-100 ease-linear ${userSelected?._id === item._id ? "bg-gray-300 rounded-md" : "bg-white"}`}
                      onClick={() => {
                        const checkUser = userSelected?._id === item._id
                        if (!checkUser) {
                          setUserSelected(item)
                          setConversations([])
                          setQuery({
                            page: 1,
                            limit: LIMIT
                          })
                        }
                      }}
                    >
                      <img
                        src={item.avatar || avatarDefault}
                        alt={item.name}
                        className="w-[30px] h-[30px] object-contain rounded-full"
                      />
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">{item.name}</span>
                        <span className="text-gray-400 text-[13px]">{item.content || "Chưa có tin nhắn nào"}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <Empty />
              ))}
          </div>
          <div className="w-2/4 bg-[#f2f2f2] border border-gray-300 border-l-0">
            <div className="bg-white relative h-[calc(100vh-95px)]">
              <div className="flex items-center gap-2 border-b border-b-gray-300 py-2 px-4 mb-2">
                <img
                  src={userSelected?.avatar || avatarDefault}
                  alt={userSelected?.name}
                  className="w-[40px] h-[40px] object-contain rounded-full"
                />
                <div className="flex flex-col">
                  <span className="font-semibold">{userSelected?.name}</span>
                  <span className="text-gray-400 text-sm">
                    {userSelected?.role === "User" ? "Khách hàng" : "Quản trị viên"}
                  </span>
                </div>
              </div>

              <div
                id="scrollableDiv"
                style={{
                  height: "calc(100vh - 200px)",
                  overflow: "auto",
                  display: "flex",
                  flexDirection: "column-reverse"
                }}
              >
                {userSelected && (
                  <InfiniteScroll
                    dataLength={conversations.length}
                    next={fetchConversationDataMore}
                    style={{ display: "flex", flexDirection: "column-reverse" }} //To put endMessage and loader to the top.
                    inverse={true} //
                    hasMore={pagination.page < pagination.total_page}
                    loader={<h4>Loading...</h4>}
                    scrollableTarget="scrollableDiv"
                  >
                    {conversations.map((item, index) => {
                      return (
                        <div key={item._id}>
                          <div
                            className={`${item.sender_id === userId ? "text-right pr-2" : "text-left pl-2"} block mb-2 ${index === 0 ? "mb-4" : ""}`}
                          >
                            <div
                              className={`${item.sender_id === userId ? "bg-blue-500 text-white" : "bg-gray-300 text-black"} py-2 px-3 inline-block rounded-sm text-sm`}
                            >
                              {item.content}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </InfiniteScroll>
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="absolute bottom-0 left-0 flex items-stretch h-[40px] w-full"
              >
                <input
                  type="text"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  className="flex-grow border border-gray-300 border-l-0 border-b-0 px-4 outline-none"
                  placeholder="Nhập tin nhắn..."
                />
                <button
                  disabled={!valueInput.trim()}
                  type="submit"
                  className="flex-shrink-0 p-2 px-3 bg-primaryBlue hover:bg-secondBlue duration-100"
                >
                  <Send size={16} color="white" />
                </button>
              </form>
            </div>
          </div>
          <div className="w-1/4 p-2 bg-white border border-gray-300 border-l-0">
            <div className="flex flex-col items-center">
              <div className="mt-4">
                <img
                  src={userSelected?.avatar || avatarDefault}
                  alt={userSelected?.name}
                  className="w-[60px] h-[60px] rounded-full"
                />
              </div>
              <span className="font-semibold block mt-2">{userSelected?.name}</span>
              <span className="text-gray-400 text-sm">
                {userSelected?.role === "User" ? "Khách hàng" : "Quản trị viên"}
              </span>
              <div className="mt-4 bg-[#f2f2f2] rounded-md p-2">
                <div className="flex items-center flex-wrap gap-x-2">
                  <strong>Email:</strong>
                  <span className="break-words whitespace-normal text-[14px]">{userSelected?.email}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <strong>Số điện thoại:</strong>
                  <span className="truncate">{userSelected?.numberPhone}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  )
}
