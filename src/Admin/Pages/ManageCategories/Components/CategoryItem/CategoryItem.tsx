import { ClipboardCheck, Copy, Eye, Pencil, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { path } from "src/Constants/path"
import { convertDateTime } from "src/Helpers/common"
import useCopyText from "src/Hook/useCopyText"
import { CategoryItemType } from "src/Types/product.type"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "src/Components/ui/alert-dialog"

export default function CategoryItem({
  item,
  handleEditItem,
  onDelete,
  maxIndex,
  index
}: {
  item: CategoryItemType
  onDelete: (id: string) => void
  handleEditItem: (item: CategoryItemType) => void
  maxIndex: number
  index: number
}) {
  const navigate = useNavigate()
  const { copiedId, handleCopyText } = useCopyText()

  const handleNavigateCategoryDetail = (id: string, nameCategory: string) => {
    navigate(`${path.AdminCategories}/${id}`, {
      state: nameCategory
    })
  }

  return (
    <div
      className={`${index % 2 === 0 ? "bg-[#f2f2f2]" : "bg-white"} dark:bg-darkPrimary grid grid-cols-12 items-center gap-2 py-3 cursor-pointer border-t-0 border border-[#dedede] dark:border-darkBorder px-4 ${index + 1 === maxIndex ? "rounded-bl-lg rounded-br-lg" : ""}`}
      key={item._id}
    >
      <div className="col-span-2 flex items-center justify-between">
        <div className="truncate w-[75%] text-blue-500">{item._id}</div>
        <button onClick={() => handleCopyText(item._id)} className="p-1 border rounded mr-2">
          {copiedId === item._id ? <ClipboardCheck color="#8d99ae" size={12} /> : <Copy color="#8d99ae" size={12} />}
        </button>
      </div>
      <div className="col-span-2 text-black dark:text-white">{item.name}</div>
      <div className="col-span-2 break-words text-black dark:text-white">{convertDateTime(item.created_at)}</div>
      <div className="col-span-2 break-words text-black dark:text-white">{convertDateTime(item.updated_at)}</div>
      <div className="col-span-2 flex items-center justify-center gap-2">
        <button onClick={() => handleEditItem(item)}>
          <Pencil color="orange" size={18} />
        </button>
        <AlertDialog>
          <AlertDialogTrigger>
            <Trash2 color="red" size={18} />
          </AlertDialogTrigger>
          <AlertDialogContent className="w-[350px] dark:bg-darkPrimary">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base">Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Không thể hoàn tác hành động này. Thao tác này sẽ xóa vĩnh viễn dữ liệu của bạn.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-sm dark:bg-darkPrimary">Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(item._id)}
                className="bg-red-500 hover:bg-red-600 text-sm text-white"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="col-span-2 break-words">
        <div className="flex justify-center items-center gap-2">
          <span className="font-semibold text-[#3b82f6]">{item.brand_ids.length}</span>
          <span className="text-black dark:text-white">|</span>
          <button onClick={() => handleNavigateCategoryDetail(item._id, item.name)}>
            <Eye color="#3b82f6" size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
