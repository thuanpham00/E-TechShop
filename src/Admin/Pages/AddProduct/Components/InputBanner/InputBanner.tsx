import { Trash2, Upload } from "lucide-react"
import { useMemo, useRef } from "react"
import { toast } from "react-toastify"
import { config } from "src/Constants/config"
import no_img from "src/Assets/img/no_image_1.jpg"

export default function InputBanner({
  errors,
  file,
  setFile,
  existingBannerUrl
}: {
  errors?: string
  file: File | null
  setFile: React.Dispatch<React.SetStateAction<File | null>>
  existingBannerUrl: string
}) {
  const refBanner = useRef<HTMLInputElement>(null)
  const handleChangeBanner = () => {
    if (refBanner) {
      refBanner.current?.click()
    }
  }

  const onChangeImageBanner = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileFormLocal = event.target.files?.[0]

    if (fileFormLocal && (fileFormLocal.size >= config.maxSizeUploadImage || !fileFormLocal.type.includes("image"))) {
      toast.error("File vượt quá kích thước và không đúng định dạng ", {
        autoClose: 1500
      })
    } else {
      toast.success("File upload thành công", {
        autoClose: 1500
      })
    }

    setFile(fileFormLocal as File)
  }

  const previewImage = useMemo(() => {
    if (file) {
      return file ? URL.createObjectURL(file) : ""
    }
    return existingBannerUrl || no_img
  }, [file, existingBannerUrl])

  return (
    <div>
      <h2 className="font-medium">Ảnh đại diện</h2>
      <div className="relative">
        <img
          src={previewImage}
          alt="ảnh đại diện"
          className={`rounded-md mt-2 ${previewImage ? "object-contain" : "object-cover"}  h-[400px] w-full`}
        />
        <input
          className="hidden"
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          ref={refBanner}
          onChange={onChangeImageBanner}
        />
        {file ? (
          <button onClick={() => setFile(null)} className="p-1 absolute top-2 right-2 bg-[#f1f1f1] rounded-sm">
            <Trash2 color="red" size={18} />
          </button>
        ) : (
          ""
        )}
      </div>
      <button
        type="button"
        onClick={handleChangeBanner}
        className="mt-2 bg-[#f2f2f2] border border-[#dadada] py-2 px-4 rounded-md text-black text-[13px] shadow-sm hover:bg-[#dedede] duration-200 flex items-center gap-1"
      >
        <Upload size={14} />
        Thêm ảnh
      </button>
      <span className="mt-1 text-red-500 text-[13px] font-semibold min-h-[1.25rem] block">{errors}</span>
    </div>
  )
}
