/* eslint-disable @typescript-eslint/no-explicit-any */
import InfiniteScroll from "react-infinite-scroll-component"
import { TicketItemType } from "src/Types/product.type"
import avatarDefault from "src/Assets/img/avatarDefault.png"
import socket from "src/socket"
import { useContext, useEffect, useState } from "react"
import { AppContext } from "src/Context/authContext"
import { ConversationType } from "src/Client/Components/ChatConsulting/ChatConsulting"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { LIMIT, PAGE } from "../AdminChatting"
import { TicketStatus } from "src/Constants/enum"
import { Alert, Button, Image, Modal, Tag } from "antd"
import { TicketAPI } from "src/Apis/ticket.api"
import { convertDateTime } from "src/Helpers/common"
import SendMessageAdmin from "../SendMessageAdmin"

export default function Chatting({
  selectedTicket,
  activeTab,
  setListImagesChat
}: {
  selectedTicket: TicketItemType
  activeTab: TicketStatus
  setListImagesChat: React.Dispatch<React.SetStateAction<string[]>>
}) {
  const queryClient = useQueryClient()
  const { userId } = useContext(AppContext) // người gửi tin nhắn

  const [conversations, setConversations] = useState<(ConversationType | any)[]>([])

  const [showModalConfirmSupport, setShowModalConfirmSupport] = useState<boolean>(false)

  const [query, setQuery] = useState({
    limit: LIMIT,
    page: PAGE
  })

  const [pagination, setPagination] = useState({
    page: PAGE,
    total_page: 0
  })

  const getDataConversation = useQuery({
    queryKey: ["conversationList", selectedTicket, query],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000)
      return TicketAPI.getMessageTicketAdmin(controller.signal, selectedTicket?._id as string, query)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 10 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData,
    enabled: Boolean(selectedTicket?._id)
  })

  const conversationListData = getDataConversation.data?.data.result.conversation as ConversationType[]
  const page = getDataConversation.data?.data.result.page
  const total_page = getDataConversation.data?.data.result.total_page

  console.log(conversationListData)

  useEffect(() => {
    setConversations([]) // clear old messages
    setListImagesChat([]) // clear old images
    setQuery({ page: PAGE, limit: LIMIT }) // reset pagination
    setPagination({ page: PAGE, total_page: 0 })
  }, [selectedTicket?._id, setListImagesChat])

  useEffect(() => {
    if (!conversationListData) return
    if (page === PAGE) setConversations(conversationListData)
    else setConversations((prev) => [...prev, ...conversationListData])
    setPagination({ page, total_page })
  }, [conversationListData, page, total_page])

  const fetchConversationDataMore = () => {
    if (pagination.page < pagination.total_page) {
      setQuery({
        page: pagination.page + 1,
        limit: LIMIT
      })
    }
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleReceivedMessage = (data: any) => {
      const { payload } = data
      if (payload.ticket_id !== selectedTicket._id) return // chỉ nhận tin nhắn của ticket hiện tại
      setConversations((prev) => [payload, ...prev])
    }

    socket.on("received_message", handleReceivedMessage)

    return () => {
      socket.off("received_message", handleReceivedMessage)
    }
  }, [setConversations, selectedTicket])

  useEffect(() => {
    const getListMessageLatest = async () => {
      try {
        await getDataConversation.refetch()
      } catch (error) {
        console.error("Lỗi khi lấy danh sách ticket:", error)
      }
    }
    socket.on("reload_ticket_list", getListMessageLatest)
    return () => {
      socket.off("reload_ticket_list", getListMessageLatest)
    }
  }, [getDataConversation])

  const [checkFile, setCheckFile] = useState<boolean>(false)

  return (
    <div className="bg-white dark:bg-darkPrimary relative h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between gap-4 border-b border-b-gray-200 dark:border-darkBorder py-3 px-4 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={selectedTicket?.users?.avatar || avatarDefault}
            alt={selectedTicket?.users?.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-darkPrimary shadow-sm"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-gray-900 dark:text-white truncate">{selectedTicket?.users?.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {selectedTicket?.users?.email ?? "Không có email"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {selectedTicket?.users?.numberPhone ?? "Không có SĐT"}
            </span>
          </div>
        </div>

        {selectedTicket?.status === TicketStatus.ASSIGNED && (
          <div className="flex flex-col items-end gap-2 sm:gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline">Người tiếp nhận:</span>
              <span className="text-sm font-semibold text-red-500 truncate max-w-[180px]">
                {selectedTicket?.served_by[selectedTicket.served_by.length - 1]?.admin_name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Tag
                color={
                  selectedTicket?.served_by[selectedTicket.served_by.length - 1]?.is_active === true ? "green" : "red"
                }
                className="text-xs py-0.5 px-2 rounded-md"
              >
                {selectedTicket?.served_by[selectedTicket.served_by.length - 1]?.is_active === true
                  ? "Đang xử lý"
                  : "Đã kết thúc"}
              </Tag>

              <span className="text-xs text-gray-500">
                Bắt đầu:{" "}
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  {convertDateTime(selectedTicket.served_by[selectedTicket.served_by.length - 1].started_at.toString())}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div
        id="scrollableDiv"
        style={{
          height: `${selectedTicket?.status === TicketStatus.ASSIGNED && selectedTicket.assigned_to !== userId ? (checkFile ? "calc(100vh - 290px" : "calc(100vh - 290px)") : checkFile ? "calc(100vh - 350px)" : "calc(100vh - 250px)"}`,
          overflow: "auto",
          display: "flex",
          flexDirection: "column-reverse"
        }}
      >
        {selectedTicket && (
          <InfiniteScroll
            dataLength={conversations.length}
            next={fetchConversationDataMore}
            style={{ display: "flex", flexDirection: "column-reverse" }} //To put endMessage and loader to the top.
            inverse={true} //
            hasMore={pagination.page < pagination.total_page}
            loader={<h4>Loading...</h4>}
            scrollableTarget="scrollableDiv"
          >
            {conversations.map((item: ConversationType, index) => {
              return (
                <div key={item._id}>
                  <div
                    className={`${item.sender_type === "staff" ? "text-right pr-2" : "text-left pl-2 "} block mb-2 ${index === 0 ? "mb-4" : ""}`}
                  >
                    {item.content !== null && (
                      <div
                        className={`${item.sender_type === "staff" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"} max-w-[300px] py-2 px-3 inline-block rounded-sm text-sm break-words`}
                      >
                        {item.content}
                      </div>
                    )}
                    {item.attachments && item.attachments.length > 0 && (
                      <div
                        className={`mt-1 flex flex-col items-${item.sender_type === "staff" ? "end" : "start"} gap-2`}
                      >
                        {item.attachments.map((att) => (
                          <div key={att.id} className="w-32 h-32 border border-gray-300 rounded-md overflow-hidden">
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
      {selectedTicket?.status === TicketStatus.PENDING && (
        <div className="absolute bottom-0 left-0 w-full">
          <div className="p-2 w-full bg-gray-200 flex justify-center ">
            <Button type="primary" className="!shadow-xl" onClick={() => setShowModalConfirmSupport(true)}>
              Tiếp nhận xử lý
            </Button>
          </div>
        </div>
      )}
      {selectedTicket?.status === TicketStatus.ASSIGNED &&
        (selectedTicket.assigned_to === userId ? (
          <SendMessageAdmin
            setConversations={setConversations}
            setCheckFile={setCheckFile}
            selectedTicket={selectedTicket}
          />
        ) : (
          <div className="absolute bottom-0 left-[-4px] w-full p-3">
            <Alert
              type="info"
              showIcon
              message="Cuộc hội thoại đang được xử lý"
              className="!p-2"
              description={
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-gray-700 dark:text-gray-200">
                    Tin nhắn này đã được{" "}
                    <span className="font-semibold">
                      {selectedTicket?.served_by?.[selectedTicket.served_by.length - 1]?.admin_name || "nhân viên"}
                    </span>{" "}
                    tiếp nhận, bạn không thể phản hồi.
                  </div>
                </div>
              }
            />
          </div>
        ))}
      <Modal
        title="Xác nhận tiếp nhận hỗ trợ"
        open={showModalConfirmSupport}
        onOk={() => {
          socket.emit("admin:assign_ticket", {
            payload: {
              ticket_id: selectedTicket._id,
              assigned_to: userId
            }
          })
          queryClient.invalidateQueries({ queryKey: ["listTicket", activeTab] })
          setShowModalConfirmSupport(false)
        }}
        onCancel={() => setShowModalConfirmSupport(false)}
        okText="Xác nhận tiếp nhận"
        cancelText="Hủy bỏ"
      >
        <Alert
          message="Xác nhận tiếp nhận hỗ trợ khách hàng"
          description={
            <>
              Bạn có chắc chắn muốn <b>tiếp nhận</b> hỗ trợ tư vấn cho khách hàng <b>{selectedTicket?.users?.name}</b>{" "}
              không?
              <br />
              Sau khi xác nhận, bạn sẽ bắt đầu trao đổi với khách hàng này.
            </>
          }
          type="info"
          showIcon
        />
      </Modal>
    </div>
  )
}
