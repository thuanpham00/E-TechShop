import { useRef } from "react"
import { config } from "src/Constants/config"
import { toast } from "react-toastify"
import Button from "../Button"

export default function InputFileImage({ onChange }: { onChange?: (file?: File) => void }) {
  const refInput = useRef<HTMLInputElement>(null)
  const handleInputFile = () => {
    refInput.current?.click()
  }

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileFormLocal = event.target.files?.[0]
    if (fileFormLocal && (fileFormLocal?.size >= config.maxSizeUploadImage || !fileFormLocal?.type.includes("image"))) {
      toast.error("File vượt quá kích thước và không đúng định dạng ", {
        autoClose: 1500
      })
    } else {
      toast.success("File upload thành công", {
        autoClose: 1500
      })
      // Tức là component con đang "gửi dữ liệu" lên component cha qua props.onChange
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onChange && onChange(fileFormLocal)
    }
  }

  return (
    <div className="text-center">
      <input
        onChange={onFileChange}
        onClick={(event) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(event.target as any).value = null
        }}
        ref={refInput}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png"
      />
      <Button
        type="button"
        onClick={handleInputFile}
        nameButton="Chọn file"
        classNameButton="px-4 py-1 bg-blue-500 mt-4 text-white font-medium text-sm rounded-3xl hover:bg-blue-500/80 duration-200"
      />
      <span className="block mt-2 text-[13px]">Maximum file size is 1 MB Format: .JPEG, .PNG</span>
    </div>
  )
}
