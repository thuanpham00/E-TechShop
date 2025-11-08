import { Trash2, Upload } from "lucide-react"
import { useEffect, useMemo, useRef } from "react"
import { toast } from "react-toastify"
import no_img_1 from "src/Assets/img/no_image.png"
import { config } from "src/Constants/config"
import { GalleryFileItem } from "../../AddProduct"

export default function InputGallery({
  errors,
  galleryFiles,
  setGalleryFiles
}: {
  errors?: string
  galleryFiles: GalleryFileItem[]
  setGalleryFiles: React.Dispatch<React.SetStateAction<GalleryFileItem[]>>
}) {
  const refGallery = useRef<(HTMLInputElement | null)[]>([])
  useEffect(() => {
    refGallery.current = galleryFiles.map((_, index) => refGallery.current[index] || null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refGallery])

  const onChangeImageGallery = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileFormLocal = event.target.files?.[0]

    if (!fileFormLocal) {
      toast.error("Không có file nào được chọn", { autoClose: 1500 })
      return
    }

    if (fileFormLocal.size >= config.maxSizeUploadImage || !fileFormLocal.type.includes("image")) {
      toast.error("File vượt quá kích thước hoặc không đúng định dạng", { autoClose: 1500 })
      return
    }

    const newGalleryFiles = [...galleryFiles]
    newGalleryFiles[index].file = fileFormLocal
    setGalleryFiles(newGalleryFiles)
  }

  const previewGallery = useMemo(() => {
    return galleryFiles.map((file, index) => {
      if (file.file) {
        return URL.createObjectURL(file.file as File)
      }
      return galleryFiles[index].existingUrl || null
    })
  }, [galleryFiles])

  useEffect(() => {
    return () => {
      previewGallery.forEach((preview) => {
        if (preview) {
          return URL.revokeObjectURL(preview) // useEffect giúp bạn quản lý việc giải phóng bộ nhớ bằng URL.revokeObjectURL() một cách tự động và an toàn.
        }
      })
    }
  }, [previewGallery])

  return (
    <div>
      <h2 className="mt-2 font-medium">Danh mục ảnh</h2>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {galleryFiles.map((file, index) => {
          const handleChangeGalleryImage = () => {
            refGallery.current[index]?.click()
          }

          const handleRemoveImage = () => {
            const newGalleryFiles = [...galleryFiles]

            if (file.file !== null) {
              // case 1: có file mới và remove file mới -> quay lại ảnh cũ (existingUrl + id)
              newGalleryFiles[index] = {
                ...newGalleryFiles[index],
                file: null
              }
            } else if (file.existingUrl !== null) {
              // case 2: không có file mới và remove ảnh cũ -> xóa ảnh cũ (existingUrl = null)
              newGalleryFiles[index] = {
                file: null,
                existingUrl: null,
                id: file.id // ✅ GIỮ LẠI id để backend xóa ảnh trên Cloudinary
              }
            }
            setGalleryFiles(newGalleryFiles)
          }

          return (
            <div key={index} className="relative col-span-2">
              <img
                className="rounded-md w-full object-cover"
                src={previewGallery[index] || no_img_1}
                alt={`ảnh sản phẩm ${index + 1}`}
              />
              <input
                className="hidden"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                ref={(el) => (refGallery.current[index] = el)}
                onChange={onChangeImageGallery(index)}
              />
              {file.file !== null || file.existingUrl !== null ? (
                <button onClick={handleRemoveImage} className="absolute top-0 right-0 bg-[#f2f2f2] p-1 rounded-sm">
                  <Trash2 color="red" size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleChangeGalleryImage}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fff] p-1 rounded-md text-black text-[13px] shadow-sm hover:bg-[#dedede] duration-200 flex items-center gap-1"
                >
                  <Upload size={14} />
                </button>
              )}
            </div>
          )
        })}
      </div>
      <span className="mt-1 text-red-500 text-[13px] font-semibold min-h-[1.25rem] block">{errors}</span>
    </div>
  )
}
