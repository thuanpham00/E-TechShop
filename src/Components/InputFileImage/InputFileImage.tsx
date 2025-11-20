import { useMemo, useRef } from "react"
import { config } from "src/Constants/config"
import { toast } from "react-toastify"
import Button from "../Button"
import { FileAvatarType } from "src/Admin/Pages/ManageCustomers/ManageCustomers"
import avatarDefault from "src/Assets/img/avatarDefault.png"

export default function InputFileImage({
  file,
  setFile,
  classNameWrapper = "text-center"
}: {
  file: FileAvatarType
  setFile: React.Dispatch<React.SetStateAction<FileAvatarType>>
  classNameWrapper?: string
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
    }
  }

  const previewImage = useMemo(() => {
    if (file?.file) {
      return file ? URL.createObjectURL(file.file) : ""
    }
    return file?.existingUrl || avatarDefault
  }, [file])

  return (
    <div className="relative w-full h-[340px] border border-gray-200 rounded-md shadow-sm">
      <div
        className="absolute top-0 left-0 w-full h-full z-1 rounded-md"
        style={{
          backgroundImage: `url(${previewImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(2px)"
        }}
      ></div>
      <img
        src={previewImage}
        className="absolute z-10 top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-1 h-44 w-44 rounded-md mx-auto"
        alt="avatar default"
      />

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
          classNameButton="px-3 py-1 bg-blue-500 mt-4 text-white font-medium text-[13px] rounded-3xl hover:bg-blue-500/80 duration-200"
        />

        <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg p-3 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <svg
                  className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span>
                Max <strong className="font-semibold">1 MB</strong>
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <svg
                  className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span>
                <strong className="font-semibold">JPEG</strong>, <strong className="font-semibold">PNG</strong>,{" "}
                <strong className="font-semibold">WEBP</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
