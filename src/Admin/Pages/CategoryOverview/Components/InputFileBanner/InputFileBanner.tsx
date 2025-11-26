/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Trash2 } from "lucide-react"
import { Fragment, useMemo, useRef } from "react"
import { toast } from "react-toastify"
import { FileAvatarType } from "src/Admin/Pages/ManageCustomers/ManageCustomers"
import Button from "src/Components/Button"
import { config } from "src/Constants/config"

export default function InputFileBanner({
  file,
  setFile,
  classNameWrapper = "text-center",
  setUrlBannerDelete
}: {
  file: FileAvatarType
  setFile: React.Dispatch<React.SetStateAction<FileAvatarType>>
  classNameWrapper?: string
  setUrlBannerDelete: React.Dispatch<React.SetStateAction<string>>
}) {
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
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      setFile && setFile((prev) => ({ ...prev, file: fileFormLocal as File }))
      setUrlBannerDelete("")
    }
  }

  const previewImage = useMemo(() => {
    if (file?.file) {
      return file ? URL.createObjectURL(file.file) : ""
    }
    return file?.existingUrl || ""
  }, [file])

  return (
    <div className="relative w-full h-[300px] border border-gray-200 rounded-md shadow-sm">
      {previewImage !== "" ? (
        <Fragment>
          <div
            className="absolute top-0 left-0 w-full h-full z-1 rounded-md"
            style={{
              backgroundImage: `url(${previewImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          ></div>
          <div>
            <Button
              type="button"
              onClick={() => {
                if (file.existingUrl !== "") {
                  // tồn tại ảnh cũ, xóa URL cũ
                  setUrlBannerDelete(file.existingUrl as string)
                }
                setFile({ file: null, existingUrl: "" })
              }}
              icon={<Trash2 size={16} />}
              classNameButton="absolute top-2 right-2 z-10 px-3 py-1 bg-red-500 text-white font-medium text-[13px] rounded-md hover:bg-red-500/80 duration-200"
            />
          </div>
        </Fragment>
      ) : (
        <div className="h-40 w-full rounded-md bg-white flex items-center justify-center text-gray-400">
          Chưa chọn banner
        </div>
      )}

      <div className={classNameWrapper}>
        <input
          onChange={onFileChange}
          onClick={(event) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(event.target as any).value = null
          }}
          ref={refInput}
          type="file"
          style={{
            display: "none"
          }}
          accept=".jpg,.jpeg,.png,.webp"
        />
        <Button
          type="button"
          onClick={handleInputFile}
          nameButton="Chọn file"
          classNameButton="px-3 py-1 bg-blue-500 mt-4 text-white font-medium text-[13px] rounded-md hover:bg-blue-500/80 duration-200"
        />
      </div>

      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white/90 border rounded-md px-3 py-1 text-xs text-gray-600 shadow-sm">
        Max 1 MB • JPEG, PNG, WEBP
      </div>
    </div>
  )
}
