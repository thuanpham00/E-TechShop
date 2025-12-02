import { Helmet } from "react-helmet-async"
import { motion } from "framer-motion"
import { useContext, useEffect, useMemo, useState } from "react"
import { Empty, Image, Input, Modal, Skeleton, Space, Tabs } from "antd"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import avatarDefault from "src/Assets/img/avatarDefault.png"
import "./AdminChatting.css"
import { TicketStatus } from "src/Constants/enum"
import { TicketAPI } from "src/Apis/ticket.api"
import { TicketItemType } from "src/Types/product.type"
import { convertDateTime } from "src/Helpers/common"
import Chatting from "./Chatting"
import { EllipsisVertical, RefreshCw } from "lucide-react"
import { AppContext } from "src/Context/authContext"
import useCheckConnectSocket from "src/Hook/useCheckConnectSocket"

export const LIMIT = 20
export const PAGE = 1

/**
 * 
✅ refetch()
👉 Chỉ gọi lại API cho đúng cái query đang được dùng ở trang/component hiện tại.
Không ảnh hưởng đến nơi khác.

✅ queryClient.invalidateQueries(queryKey)
👉 Báo cho React Query rằng tất cả query nào có cùng queryKey (hoặc match pattern) đều cần cập nhật lại → chúng sẽ tự refetch khi đang active.
Dùng để đồng bộ dữ liệu ở nhiều nơi khác nhau.

✅ Tóm lại:
1 cái làm mới dữ liệu của riêng nó — 1 cái làm mới dữ liệu ở mọi nơi dùng chung queryKey.
 */
export default function AdminChatting() {
  const { isSocketConnected } = useCheckConnectSocket()
  const { userId, socket } = useContext(AppContext)
  const [activeTab, setActiveTab] = useState<TicketStatus>(TicketStatus.PENDING)
  const [selectedTicket, setSelectedTicket] = useState<TicketItemType>()

  const getListTicket = useQuery({
    queryKey: ["listTicket", activeTab],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return TicketAPI.getListTicket(controller.signal, { status: activeTab })
    }
  })

  const getListImagesChat = useQuery({
    queryKey: ["listImagesChat", selectedTicket?._id],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return TicketAPI.getImageTicketAdmin(controller.signal, selectedTicket?._id as string)
    },
    enabled: !!selectedTicket?._id,
    staleTime: 5 * 60 * 1000, // 5 phút
    placeholderData: keepPreviousData
  })

  const listDataImagesChat = getListImagesChat.data?.data.data as string[]

  const listTicket = getListTicket.data?.data.data as TicketItemType[]
  useEffect(() => {
    if (!listTicket || listTicket.length === 0) {
      setSelectedTicket(undefined)
      return
    }

    const exists = listTicket?.some((item) => item._id === selectedTicket?._id)
    if (!exists) {
      // nếu nó ko tồn tại trong danh sách hiện tại thì set lại ticket đầu tiên
      setSelectedTicket(listTicket[0])
    }
  }, [listTicket, selectedTicket])

  const [searchTerm, setSearchTerm] = useState("")
  const filteredList = useMemo(() => {
    return listTicket?.filter((item) => item.users.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [listTicket, searchTerm])

  useEffect(() => {
    if (!socket) return
    const getListTicketAPI = async () => {
      try {
        await getListTicket.refetch()
      } catch (error) {
        console.error("Lỗi khi lấy danh sách ticket:", error)
      }
    }
    socket.on("reload_ticket_list", getListTicketAPI)
    return () => {
      socket.off("reload_ticket_list", getListTicketAPI)
    }
  }, [getListTicket, socket])

  useEffect(() => {
    if (!socket) return
    const getListImageTicket = async () => {
      try {
        await getListImagesChat.refetch()
      } catch (error) {
        console.error("Lỗi khi lấy danh sách hình ảnh ticket:", error)
      }
    }
    socket.on("reload_ticket_images", getListImageTicket)
    return () => {
      socket.off("reload_ticket_images", getListImageTicket)
    }
  }, [getListImagesChat, socket])

  const handleUpdateReadMessageFromAdmin = (ticket: TicketItemType) => {
    if (!socket) return
    setSelectedTicket(ticket)
    if (
      ticket?.status !== TicketStatus.PENDING &&
      ticket?.assigned_to !== null &&
      ticket?.assigned_to === userId // phải là người tiếp nhận mới đc seen tin nhắn
    ) {
      // neu ticket khác hàng đã được tiếp nhận và người tiếp nhận có quyền seen tin nhắn (nếu không phải người tiếp nhận thì ko đc seen)
      socket.emit("admin:read-message-from-assigned", {
        payload: {
          ticket_id: ticket?._id as string,
          assigned_to: ticket?.assigned_to as string
        }
      })
    }
  }

  const [showModalHistoryAssigned, setShowModalHistoryAssigned] = useState(false)

  return (
    <div className="AdminChatting">
      <Helmet>
        <title>Hệ thống chat</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="flex items-center gap-2">
          <span className="text-base font-semibold">Kết nối Server:</span>
          {isSocketConnected ? (
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm font-medium ring-1 ring-green-200">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 shadow-sm" />
              <span className="text-xs">Kết nối tới hệ thống thành công</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium ring-1 ring-yellow-200">
                <span className="relative inline-block h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-50 animate-ping" />
                  <span className="absolute inline-block h-2 w-2 rounded-full bg-yellow-500" />
                </span>
                <span className="text-xs">Đang kết nối...</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  // try {
                  //   // retryConnect?.()
                  // } catch {
                  //   window.location.reload()
                  // }
                }}
                aria-label="Thử kết nối lại"
                className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                title="Thử kết nối lại"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          )}
        </h1>
        <section className="mt-2 flex">
          <div className="w-1/4 border bg-white p-2 rounded-tl-md rounded-bl-md border-gray-300 dark:bg-darkPrimary dark:border-darkBorder">
            <Tabs
              defaultActiveKey="1"
              type="card"
              size={"small"}
              style={{ marginTop: 12 }}
              tabBarStyle={{
                width: "100%"
              }}
              items={[
                {
                  label: `Chờ tiếp nhận`,
                  key: TicketStatus.PENDING
                },
                {
                  label: `Đang xử lý`,
                  key: TicketStatus.ASSIGNED
                },
                {
                  label: `Đã đóng`,
                  key: TicketStatus.CLOSED
                }
              ]}
              onTabClick={(prev) => {
                setActiveTab(prev as TicketStatus)
              }}
            />

            <Space direction="vertical" style={{ width: "100%", marginTop: "4px" }}>
              <Input
                placeholder="Tìm kiếm..."
                allowClear
                style={{ width: "100%" }}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dark:bg-darkSecond dark:text-white"
              />
            </Space>

            {getListTicket.isLoading && <Skeleton />}
            {getListTicket.isFetched &&
              (listTicket?.length > 0 ? (
                <div className="mt-3 h-[calc(100vh-250px)] overflow-y-auto">
                  {filteredList.map((item) => (
                    <button
                      key={item._id}
                      className={`flex items-center gap-2 p-2 w-full duration-100 ease-linear ${selectedTicket?.users?._id === item.users._id ? "bg-gray-200 rounded-md dark:bg-gray-600" : "bg-white dark:bg-darkSecond"}`}
                      onClick={() => {
                        handleUpdateReadMessageFromAdmin(item)
                      }}
                    >
                      <img
                        src={item.users.avatar || avatarDefault}
                        alt={item.users.name}
                        className="w-[30px] h-[30px] object-contain rounded-full"
                      />
                      <div className="flex items-center justify-between w-full relative">
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-left">{item.users.name}</span>
                          <span className={`text-gray-400 text-[13px] font-medium truncate max-w-[180px]`}>
                            {item.last_message_sender_type === "staff" ? "Bạn" : "Khách"}:{" "}
                            {item.last_message === null
                              ? "Ảnh"
                              : item.last_message !== null
                                ? item.last_message
                                : "Chưa có tin nhắn nào"}
                          </span>
                        </div>
                        <div className="mt-2 text-gray-400 text-[12px] text-right">
                          {(() => {
                            const date = new Date(item.last_message_at)
                            const now = new Date()
                            const isToday =
                              date.getDate() === now.getDate() &&
                              date.getMonth() === now.getMonth() &&
                              date.getFullYear() === now.getFullYear()

                            if (isToday) {
                              return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
                            } else {
                              return convertDateTime(item.last_message_at)
                            }
                          })()}
                        </div>

                        {item.unread_count_staff > 0 && (
                          <div className="absolute right-0 top-[10%] -translate-y-1/2 flex items-center z-10">
                            <div className="h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-semibold">
                              {item.unread_count_staff}
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <Empty />
              ))}
          </div>
          <div className="w-2/4 border border-gray-300 dark:border-darkBorder border-l-0">
            <Chatting selectedTicket={selectedTicket as TicketItemType} />
          </div>
          <div className="w-1/4 p-4 bg-white dark:bg-darkPrimary rounded-tr-md rounded-br-md border border-gray-200 dark:border-darkBorder shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="w-fit rounded-full bg-gradient-to-br from-indigo-50 to-cyan-50 p-1">
                <img
                  src={selectedTicket?.users?.avatar || avatarDefault}
                  alt={selectedTicket?.users?.name}
                  className="w-[64px] h-[64px] rounded-full object-cover shadow-sm"
                />
              </div>
              <h4 className="mt-3 font-semibold text-gray-900 dark:text-white truncate">
                {selectedTicket?.users?.name}
              </h4>
            </div>

            <div className="mt-4">
              <button
                className="text-sm font-semibold text-gray-700 dark:text-white flex justify-between items-center w-full"
                onClick={() => setShowModalHistoryAssigned(true)}
              >
                <span>Lịch sử tiếp nhận</span>
                <EllipsisVertical className="inline-block ml-1 mb-1" size={12} />
              </button>

              <div className="text-sm font-semibold text-gray-700 dark:text-white mt-4">Ảnh đoạn chat</div>
              <div className="mt-2 h-[calc(100vh-340px)] overflow-y-auto border border-gray-200 dark:border-darkBorder p-2">
                {listDataImagesChat && listDataImagesChat.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1">
                    {listDataImagesChat.map((imgUrl, index) => (
                      <div key={index} className="w-full rounded-md">
                        <Image
                          src={imgUrl}
                          alt={`Ảnh chat ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-110 duration-200 cursor-pointer border border-gray-200 rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Chưa có ảnh nào được gửi trong đoạn chat này.</div>
                )}
              </div>
            </div>
          </div>
        </section>
      </motion.div>

      <Modal
        open={showModalHistoryAssigned}
        onCancel={() => setShowModalHistoryAssigned(false)}
        title="Lịch sử tiếp nhận"
        width={600}
        footer={null}
      >
        <div
          className="mt-3 space-y-3"
          style={{
            overflowY: "auto",
            height: "500px"
          }}
        >
          {selectedTicket && selectedTicket.served_by.length > 0 ? (
            selectedTicket.served_by.map((item) => (
              <div
                key={item.admin_id}
                className="relative p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-white">Người xử lý</div>
                    <div className="font-medium text-sm dark:text-white">{item.admin_name}</div>
                    <div className="text-xs text-gray-400 mt-1">Id: {item.admin_id}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold ${item.is_active ? "text-green-600" : "text-red-500"}`}>
                      {item.is_active ? "Đang xử lý" : "Đã kết thúc"}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{convertDateTime(item.started_at.toString())}</div>
                    {item.ended_at && (
                      <div className="text-xs text-gray-400">{convertDateTime(item.ended_at.toString())}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">Chưa có lịch sử</div>
          )}
        </div>
      </Modal>
    </div>
  )
}
