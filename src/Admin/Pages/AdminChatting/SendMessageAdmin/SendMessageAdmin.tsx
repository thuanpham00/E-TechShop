/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { Fragment } from "react/jsx-runtime"
import { MessageType } from "src/Constants/enum"
import socket from "src/socket"
import { GalleryFileItem } from "../../AddProduct/AddProduct"
import { TicketItemType } from "src/Types/product.type"
import ShowPreviewImage from "src/Components/ShowPreviewImage"
import FormSendMessage from "src/Components/FormSendMessage"

export default function SendMessageAdmin({
  setConversations,
  setCheckFile,
  selectedTicket
}: {
  setConversations: React.Dispatch<React.SetStateAction<any[]>>
  setCheckFile: React.Dispatch<React.SetStateAction<boolean>>
  selectedTicket: TicketItemType
}) {
  const [valueInput, setValueInput] = useState("")
  const [files, setFiles] = useState<GalleryFileItem[]>([])

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
      const conversation = {
        content: valueInput,
        type: files.length > 0 ? MessageType.FILE_TEXT : MessageType.TEXT,
        sender_type: "staff",
        ticket_id: selectedTicket._id
      }
      socket.emit(
        "admin:send_message",
        {
          payload: conversation,
          files: fileMetas.map((f) => f.meta)
        },
        ...fileMetas.map((f) => f.buffer)
      )
      setConversations((prev) => [
        {
          ...{
            ...conversation,
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
      />
    </Fragment>
  )
}
