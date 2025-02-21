import { useRef } from "react"
import Button from "../Button"
import { config } from "src/Constants/config"
import { toast } from "react-toastify"

export default function InputFileImage({ onChange }: { onChange?: (file?: File) => void }) {
  const refInput = useRef<HTMLInputElement>(null)
  const handleInputFile = () => {
    refInput.current?.click()
  }

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileFormLocal = event.target.files?.[0]
    if (fileFormLocal && (fileFormLocal?.size >= config.maxSizeUploadImage || !fileFormLocal?.type.includes("image"))) {
      toast.error("file vượt quá kích thước và không đúng định dạng ", {
        autoClose: 1500
      })
    } else {
      toast.success("file upload thành công", {
        autoClose: 1500
      })
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    onChange && onChange(fileFormLocal)
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
        classNameButton="w-[130px] p-4 py-2 bg-blue-500 mt-2 w-full text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
      />
      <span className="block mt-2">Maximum file size is 1 MB Format: .JPEG, .PNG</span>
    </div>
  )
}
