import { X } from "lucide-react"
import { GalleryFileItem } from "src/Admin/Pages/AddProduct/AddProduct"

export default function ShowPreviewImage({
  files,
  removeImage
}: {
  files: GalleryFileItem[]
  removeImage: (id: string) => void
}) {
  return files.length > 0 ? (
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
  ) : null
}
