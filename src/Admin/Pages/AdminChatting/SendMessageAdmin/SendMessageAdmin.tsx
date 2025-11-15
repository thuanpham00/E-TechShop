/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from "react"
import { Fragment } from "react/jsx-runtime"
import { MessageType } from "src/Constants/enum"
import socket from "src/socket"
import { GalleryFileItem } from "../../AddProduct/AddProduct"
import { toast } from "react-toastify"
import { Image, Send, X } from "lucide-react"
import { TicketItemType } from "src/Types/product.type"

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
  const refInputImage = useRef<HTMLInputElement>(null)

  const handleChangeBanner = () => {
    refInputImage.current?.click()
  }

  const [files, setFiles] = useState<GalleryFileItem[]>([])

  const handleChooseImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const list = event.target.files
    if (!list || list.length === 0) return

    if (list.length > 4) {
      toast.info("Chỉ được chọn tối đa 4 hình ảnh", { autoClose: 1500 })
      return
    }
    const newFiles: GalleryFileItem[] = Array.from(list).map((file) => {
      const id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      return {
        id,
        file,
        existingUrl: URL.createObjectURL(file)
      }
    })

    files.forEach((f) => {
      if (f.file) {
        return URL.revokeObjectURL(f.existingUrl as string)
      }
    })
    setFiles((prev) => [...prev, ...newFiles])
    setCheckFile(true)
  }

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
      {files.length > 0 && (
        <div className="flex absolute bottom-[40px] left-0 bg-white w-full p-2 gap-2 overflow-x-auto border-t border-gray-300">
          {files.map((f) => (
            <div key={f.id} className="relative">
              <img src={f.existingUrl as string} alt="preview" className="w-20 h-20 object-cover rounded-md border" />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(f.existingUrl as string)
                  removeImage(f.id as string)
                }}
                className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSendMessage} className="absolute bottom-0 left-0 flex items-stretch h-[40px] w-full">
        <input
          ref={refInputImage}
          onChange={handleChooseImages}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
        />
        <button
          type="button"
          onClick={handleChangeBanner}
          className="bg-white border border-[#dadada] border-b-0 border-l-0 px-4 hover:bg-[#f2f2f2] duration-200"
        >
          <Image size={18} />
        </button>
        <input
          type="text"
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          className="flex-grow border border-gray-300 border-l-0 border-b-0 px-4 outline-none dark:bg-darkPrimary dark:border-darkBorder"
          placeholder="Nhập tin nhắn..."
        />
        <button
          disabled={!valueInput.trim() && files.length === 0}
          type="submit"
          className="flex-shrink-0 p-2 px-3 bg-primaryBlue hover:bg-secondBlue duration-100"
        >
          <Send size={16} color="white" />
        </button>
      </form>
    </Fragment>
  )
}
