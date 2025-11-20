/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useContext, useState } from "react"
import { GalleryFileItem } from "src/Admin/Pages/AddProduct/AddProduct"
import FormSendMessage from "src/Components/FormSendMessage"
import ShowPreviewImage from "src/Components/ShowPreviewImage"
import { MessageType } from "src/Constants/enum"
import { AppContext } from "src/Context/authContext"
import socket from "src/socket"

type MessageSend = {
  content: string // REQUIRED - Nội dung tin nhắn
  type: MessageType
  sender_type: "customer" | "admin" // Optional - loại người gửi
  attachments?: string[] // Optional - URLs ảnh/file đính kèm
}

export default function SendMessageClient({
  setConversations,
  setCheckFile
}: {
  setConversations: React.Dispatch<React.SetStateAction<any[]>>
  setCheckFile: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const { userId } = useContext(AppContext) // người gửi tin nhắn

  const [files, setFiles] = useState<GalleryFileItem[]>([])
  const [valueInput, setValueInput] = useState("")

  const removeImage = (id: string) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== id)
      setCheckFile(next.length > 0)
      return next
    })
  }

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (valueInput.trim() === "" && files.length === 0) return

    try {
      // chuẩn bị metaData + buffers
      const fileMetas = await Promise.all(
        files.map(async (f) => {
          const file = f.file as File
          const buffer = await file.arrayBuffer()
          return {
            meta: {
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size
            },
            buffer: buffer
          }
        })
      )
      const conversation: MessageSend = {
        content: valueInput.trim() !== "" ? valueInput.trim() : "",
        type: files.length > 0 ? MessageType.FILE_TEXT : MessageType.TEXT,
        sender_type: "customer"
      }
      socket.emit(
        "send_message",
        {
          payload: { ...conversation, content: conversation.content === "" ? null : conversation.content },
          files: fileMetas.map((f) => f.meta) // metadata để server biết tên/mime/size
        }, // append binary ArrayBuffers as following args
        ...fileMetas.map((f) => f.buffer)
      )
      const contentForUI = conversation.content === "" ? null : conversation.content
      setConversations((prev) => [
        {
          ...{
            ...conversation,
            content: contentForUI,
            sender_id: userId,
            attachments: files.map((f) => ({
              type: 0,
              id: f.id,
              url: f.existingUrl
            }))
          },
          _id: new Date().getTime().toString()
        },
        ...prev
      ])
      setValueInput("")
      setFiles([])
      setCheckFile(false)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Fragment>
      <ShowPreviewImage files={files} removeImage={removeImage} />

      <FormSendMessage
        handleSendMessage={handleSendMessage}
        valueInput={valueInput}
        setValueInput={setValueInput}
        files={files}
        setFiles={setFiles}
        setCheckFile={setCheckFile}
        classNameButton="bg-white border border-[#dadada] border-l-0 px-4 hover:bg-[#f2f2f2] duration-200"
      />
    </Fragment>
  )
}
