import { Send, Image } from "lucide-react"
import { useRef } from "react"
import { toast } from "react-toastify"
import { GalleryFileItem } from "src/Admin/Pages/AddProduct/AddProduct"

export default function FormSendMessage({
  classNameButton = "bg-white border border-[#dadada] border-b-0 border-l-0 px-4 hover:bg-[#f2f2f2] duration-200",
  handleSendMessage,
  valueInput,
  setValueInput,
  files,
  setFiles,
  setCheckFile
}: {
  classNameButton?: string
  handleSendMessage: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  valueInput: string
  setValueInput: React.Dispatch<React.SetStateAction<string>>
  files: GalleryFileItem[]
  setFiles: React.Dispatch<React.SetStateAction<GalleryFileItem[]>>
  setCheckFile: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const refInputImage = useRef<HTMLInputElement>(null)

  const handleChangeBanner = () => {
    refInputImage.current?.click()
  }

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

  return (
    <form onSubmit={handleSendMessage} className="absolute bottom-0 left-0 flex items-stretch h-[40px] w-full">
      <input
        ref={refInputImage}
        onChange={handleChooseImages}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.webp"
        multiple
      />
      <button type="button" onClick={handleChangeBanner} className={classNameButton}>
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
  )
}
