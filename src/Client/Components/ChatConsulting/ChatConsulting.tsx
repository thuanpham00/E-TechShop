import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Cpu, MessagesSquare, Send, X } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { conversationAPI } from "src/Apis/conversation.api"
import { AppContext } from "src/Context/authContext"
import socket from "src/socket"
import InfiniteScroll from "react-infinite-scroll-component"

const LIMIT = 10
const PAGE = 1

export type ConversationType = {
  _id: string
  sender_id: string
  receiver_id: string
  content: string
}

export default function ChatConsulting() {
  const [isOpen, setIsOpen] = useState(false)
  const [valueInput, setValueInput] = useState("")
  const { userId } = useContext(AppContext) // người gửi tin nhắn
  const [conversations, setConversations] = useState<ConversationType[]>([])
  const [pagination, setPagination] = useState({
    page: PAGE,
    total_page: 0
  })

  const [query, setQuery] = useState({
    limit: LIMIT,
    page: PAGE
  })

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleReceivedMessage = (data: any) => {
      const { payload } = data
      setConversations((prev) => [payload, ...prev])
    }
    socket.on("received_message", handleReceivedMessage)
    return () => {
      socket.off("received_message", handleReceivedMessage) // khi component unmount (hủy dom) thì nó disconnect socket
    }
  }, [])

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const conversation = {
      content: valueInput,
      sender_id: userId as string,
      receiver_id: "679215ad8fddd1ba4f42b094" // người nhận (admin full quyền)
    }
    socket.emit("send_message", {
      payload: conversation
    })
    setConversations((prev) => [{ ...conversation, _id: new Date().getTime().toString() }, ...prev])
    setValueInput("")
  }

  const getDataConversation = useQuery({
    queryKey: ["conversationList", query],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000)
      return conversationAPI.getConversation(controller.signal, "679215ad8fddd1ba4f42b094", query)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 10 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData,
    enabled: isOpen
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
  }, [conversationListData, page, total_page])

  const fetchConversationDataMore = () => {
    if (pagination.page < pagination.total_page) {
      setQuery({
        page: pagination.page + 1,
        limit: LIMIT
      })
    }
  }

  return (
    <div className="fixed bottom-0 right-4 z-10">
      <button
        onClick={() => setIsOpen(true)}
        className={`bg-primaryBlue py-2 px-3 rounded-tl-lg rounded-tr-lg flex items-center gap-2 transition-all duration-100 ${isOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <MessagesSquare color="white" />
        <span className="text-white">Chat tư vấn - Giải đáp mọi thắc mắc</span>
      </button>

      <div
        className={`fixed bottom-0 right-4 w-[330px] transform transition-all duration-300 shadow-sm ${isOpen ? "translate-y-0" : "translate-y-full pointer-events-none"}`}
      >
        <div className="bg-primaryBlue py-2 px-3 relative rounded-tl-lg rounded-tr-lg border border-gray-300 border-b-0">
          <div className="flex items-center gap-1">
            <Cpu color="white" className="mt-1" />
            <span className="text-white text-lg font-bold text-center border-b-[3px] border-white dark:border-white">
              TechZone
            </span>
          </div>
          <span className="text-gray-200 text-[13px] mt-1 block">Chat với chúng tôi</span>

          <button className="absolute top-4 right-2" onClick={() => setIsOpen(false)}>
            <X size={20} color="white" />
          </button>
        </div>
        <div className="bg-white py-2 pl-2 pr-2 h-[400px] overflow-y-auto border border-gray-300 shadow-sm">
          <div
            id="scrollableDiv"
            style={{
              height: 350,
              overflow: "auto",
              display: "flex",
              flexDirection: "column-reverse"
            }}
          >
            <InfiniteScroll
              dataLength={conversations.length}
              next={fetchConversationDataMore}
              style={{ display: "flex", flexDirection: "column-reverse" }} //To put endMessage and loader to the top.
              inverse={true} //
              hasMore={pagination.page < pagination.total_page}
              loader={<h4>Loading...</h4>}
              scrollableTarget="scrollableDiv"
            >
              {conversations.map((item) => {
                return (
                  <div key={item._id}>
                    <div className={`${item.sender_id === userId ? "text-right" : "text-left"} block mb-2`}>
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
          </div>
          <form onSubmit={handleSendMessage} className="absolute bottom-0 left-0 flex items-stretch h-[40px] w-full">
            <input
              type="text"
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              className="flex-grow border border-gray-300 px-4 outline-none"
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
    </div>
  )
}
