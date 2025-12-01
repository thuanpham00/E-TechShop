/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Cpu, MessagesSquare, RefreshCw, X } from "lucide-react"
import { Fragment, useContext, useEffect, useState } from "react"
import { AppContext } from "src/Context/authContext"
import InfiniteScroll from "react-infinite-scroll-component"
import { TicketAPI } from "src/Apis/ticket.api"
import { useNavigate } from "react-router-dom"
import { path } from "src/Constants/path"
import { toast } from "react-toastify"
import useCheckConnectSocket from "src/Hook/useCheckConnectSocket"
import { Image } from "antd"
import SendMessageClient from "../SendMessageClient"

const LIMIT = 10
const PAGE = 1

export type ConversationType = {
  _id: string
  ticket_id: string
  sender_id: string
  sender_type: string
  sender_name: string
  sender_avatar: string
  content: string
  type: string
  attachments?: {
    id: string
    url: string
    type: number
  }[]
  is_read: boolean
  read_at: null
  created_at: string
}

/**
 * 
✅ refetch()
👉 Chỉ gọi lại API cho đúng cái query đang được dùng ở trang/component hiện tại.
Không ảnh hưởng đến nơi khác.

✅ queryClient.invalidateQueries(queryKey)
👉 Báo cho React Query rằng tất cả query nào có cùng queryKey (hoặc match pattern) đều cần cập nhật lại → chúng sẽ tự refetch khi đang active.
Dùng để đồng bộ dữ liệu ở nhiều nơi khác nhau.

✅ Tóm lại:
1 cái làm mới dữ liệu của `riêng nó` — 1 cái làm mới dữ liệu ở `mọi nơi` dùng chung queryKey.
 */

export default function ChatConsulting() {
  const { isSocketConnected } = useCheckConnectSocket()

  const navigate = useNavigate()
  const { isAuthenticated, userId, socket } = useContext(AppContext)
  const [isOpen, setIsOpen] = useState(false)

  const [conversations, setConversations] = useState<(ConversationType | any)[]>([]) // lưu đoạn chat
  const [unreadCountMessage, setUnreadCountMessage] = useState(0) // lưu số tin nhắn chưa đọc
  const [pagination, setPagination] = useState({
    page: PAGE,
    total_page: 0
  })

  const [query, setQuery] = useState({
    limit: LIMIT,
    page: PAGE
  })

  const getDataConversation = useQuery({
    queryKey: ["conversationList", query],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000)
      return TicketAPI.getMessageTicketClient(controller.signal, query)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 10 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData,
    enabled: isAuthenticated
  })

  const conversationListData = getDataConversation.data?.data.result.conversation as ConversationType[]
  const page = getDataConversation.data?.data.result.page
  const total_page = getDataConversation.data?.data.result.total_page
  const assigned_to = getDataConversation.data?.data.result.ticket
    ? (getDataConversation.data?.data.result.ticket.assigned_to.name as string)
    : ""
  const unreadMessageCount = getDataConversation.data?.data.result?.ticket?.unread_count_customer || 0
  const [triggerRefetch, setTriggerRefetch] = useState(false)

  useEffect(() => {
    if (conversationListData || triggerRefetch === true) {
      setConversations((prev) => [...prev, ...conversationListData]) // load từ api
      setUnreadCountMessage(unreadMessageCount)
      setPagination({
        page,
        total_page
      })
      if (triggerRefetch) setTriggerRefetch(false)
    }
  }, [conversationListData, page, total_page, unreadMessageCount, triggerRefetch])

  useEffect(() => {
    if (!socket) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleReceivedMessage = (data: any) => {
      const { payload, unreadCountCustomer } = data
      setConversations((prev) => [payload, ...prev]) // load từ socket ko cần gọi lại api
      setUnreadCountMessage(unreadCountCustomer)
    }
    socket.on("received_message", handleReceivedMessage)
    return () => {
      socket.off("received_message", handleReceivedMessage) // khi component unmount (hủy dom) thì nó disconnect socket
    }
  }, [socket])

  const fetchConversationDataMore = () => {
    if (pagination.page < pagination.total_page) {
      setQuery({
        page: pagination.page + 1,
        limit: LIMIT
      })
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setIsOpen(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!socket) return
    if (isOpen && unreadCountMessage > 0) {
      socket.emit("client:read_messages", { payload: { user_id: userId } }) // thông báo cho server đã đọc tin nhắn
      setUnreadCountMessage(0) // reset số lượng tin nhắn chưa đọc về 0
    }
  }, [isOpen, userId, unreadCountMessage, socket])

  const handleCheckAuth = async () => {
    // lúc này khi bật ModalChat lên check và update lại số lượng tin nhắn chưa đọc chỗ này ko cần socket cứ dùng api bình thường
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để sử dụng chức năng chat tư vấn", {
        autoClose: 1500
      })
      return navigate(path.Login)
    }
    setIsOpen(true)
    setConversations([])
    // Thường pattern: sau mutation dùng invalidateQueries để cập nhật tất cả consumers; dùng refetch để refresh trực tiếp từ component khi cần.
    try {
      await getDataConversation.refetch()
      setTriggerRefetch(true)
    } catch (err) {
      console.error("Lỗi khi refetch unread count:", err)
    }
  }

  useEffect(() => {
    if (!socket) return
    const getConversationNew = async () => {
      try {
        await getDataConversation.refetch()
      } catch (error) {
        console.error("Lỗi khi lấy danh sách message:", error)
      }
    }
    socket.on("reload_conversation", getConversationNew)
    return () => {
      socket.off("reload_conversation", getConversationNew)
    }
  }, [getDataConversation, socket])

  const [checkFile, setCheckFile] = useState(false)

  return (
    <Fragment>
      <div className="fixed bottom-0 right-4 z-10">
        {unreadCountMessage > 0 && !isOpen && (
          <div className="absolute right-[-5px] top-[-12px] bg-red-500 text-white border border-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
            {unreadCountMessage}
          </div>
        )}
        <button
          onClick={handleCheckAuth}
          className={`bg-primaryBlue py-2 px-3 rounded-tl-lg rounded-tr-lg flex items-center gap-2 transition-all duration-100 ${isOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <MessagesSquare color="white" />
          <span className="text-white">Chat tư vấn - Giải đáp mọi thắc mắc</span>
        </button>

        <div
          className={`fixed bottom-0 right-4 w-[350px] transform transition-all duration-300 shadow-sm ${isOpen ? "translate-y-0" : "translate-y-full pointer-events-none"}`}
        >
          <div className="bg-primaryBlue py-2 px-3 relative rounded-tl-lg rounded-tr-lg border border-gray-300 border-b-0">
            <div className="flex items-center gap-1">
              <Cpu color="white" className="mt-1" />
              <span className="text-white text-lg font-bold text-center border-b-[3px] border-white dark:border-white">
                TechZone
              </span>
            </div>
            <div aria-live="polite" className="mt-2 flex items-start flex-col">
              {isSocketConnected ? (
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm font-medium ring-1 ring-green-200">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 shadow-sm" />
                  <span className="text-xs">Kết nối thành công...</span>
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
                      //   retryConnect?.()
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

              <div className="text-xs flex items-center gap-2 text-white/90 mt-1">
                <span className="text-[11px]">Người tiếp nhận:</span>
                <span className="font-medium truncate max-w-[120px]">{assigned_to || "Chưa có"}</span>
              </div>
            </div>

            <button className="absolute top-4 right-2" onClick={() => setIsOpen(false)}>
              <X size={20} color="white" />
            </button>
          </div>
          <div
            className={`bg-white py-2 pl-2 pr-0 h-[400px] border border-gray-300 shadow-sm relative overflow-hidden`}
          >
            <div
              id="scrollableDiv"
              style={{
                height: checkFile ? "calc(100% - 130px)" : "calc(100% - 30px)",
                overflow: "auto",
                display: "flex",
                flexDirection: "column-reverse"
              }}
            >
              {conversations.length === 0 ? (
                <div>
                  <div className={`text-left block mb-1 max-w-[250px]`}>
                    <div className={`bg-gray-300 text-black py-2 px-3 inline-block rounded-sm text-sm`}>
                      Bạn có thắc mắc hoặc cần tư vấn gì, hãy gửi tin nhắn — hệ thống quản trị viên sẽ phản hồi sớm nhất
                      cho bạn.
                    </div>
                  </div>
                  <div className="text-center text-gray-400 mt-4">
                    Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                  </div>
                </div>
              ) : (
                <InfiniteScroll
                  dataLength={conversations.length}
                  next={fetchConversationDataMore}
                  style={{ display: "flex", flexDirection: "column-reverse" }} //To put endMessage and loader to the top.
                  inverse={true} //
                  hasMore={pagination.page < pagination.total_page}
                  loader={<h4>Loading...</h4>}
                  scrollableTarget="scrollableDiv"
                >
                  {conversations.map((item: ConversationType, idx: number) => {
                    return (
                      <div key={item._id + idx}>
                        <div className={`${item.sender_id === userId ? "text-right" : "text-left"} block mb-2 pr-2`}>
                          {item.content !== null && (
                            <div
                              className={`${item.sender_id === userId ? "bg-blue-500 text-white" : "bg-gray-300 text-black"} py-2 px-3 inline-block rounded-sm text-sm max-w-[170px] break-words`}
                            >
                              {item.content}
                            </div>
                          )}
                          {item.attachments && item.attachments.length > 0 && (
                            <div
                              className={`mt-1 flex flex-col items-${item.sender_id === userId ? "end" : "start"} gap-2`}
                            >
                              {item.attachments.map((att) => (
                                <div
                                  key={att.id}
                                  className="w-32 h-32 border border-gray-300 rounded-md overflow-hidden"
                                >
                                  {att.type === 0 ? (
                                    <Image src={att.url} alt="attachment" className="w-full h-full object-cover" />
                                  ) : (
                                    <a
                                      href={att.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 underline"
                                    >
                                      Tệp đính kèm
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </InfiniteScroll>
              )}
            </div>
            <SendMessageClient setConversations={setConversations} setCheckFile={setCheckFile} />
          </div>
        </div>
      </div>
    </Fragment>
  )
}
