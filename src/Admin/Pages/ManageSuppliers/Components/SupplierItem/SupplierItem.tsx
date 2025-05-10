import { ClipboardCheck, Copy, Pencil, Trash2 } from "lucide-react"
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
import { convertDateTime } from "src/Helpers/common"
import useCopyText from "src/Hook/useCopyText"
import { SupplierItemType } from "src/Types/product.type"

export default function CategoryItem({
  item,
  onDelete,
  handleEditItem
}: {
  item: SupplierItemType
  onDelete: (id: string) => void
  handleEditItem: (id: string) => void
}) {
  const { copiedId, handleCopyText } = useCopyText()

  const handleEditSupplierItem = (id: string) => {
    handleEditItem(id)
  }

  return (
    <div
      className="bg-white dark:bg-darkPrimary grid grid-cols-10 items-center gap-2 py-3 cursor-pointer border-t-0 border border-[#dedede] dark:border-darkBorder px-4 last:rounded-bl-xl last:rounded-br-xl"
      key={item._id}
    >
      <div className="col-span-2 flex items-center justify-between">
        <div className="truncate w-[75%] text-blue-500">{item._id}</div>
        <button onClick={() => handleCopyText(item._id)} className="p-1 border rounded mr-2">
          {copiedId === item._id ? <ClipboardCheck color="#8d99ae" size={12} /> : <Copy color="#8d99ae" size={12} />}
        </button>
      </div>
      <div className="col-span-2">{item.name}</div>
      <div className="col-span-1 break-words">{item.contactName}</div>
      <div className="col-span-1 break-words">{item.email}</div>
      <div className="col-span-1">{item.phone}</div>
      <div className="col-span-1 break-words">{convertDateTime(item.created_at)}</div>
      <div className="col-span-1 break-words">{convertDateTime(item.updated_at)}</div>
      <div className="col-span-1 flex items-center justify-center gap-2">
        <button onClick={() => handleEditSupplierItem(item._id)}>
          <Pencil color="orange" size={18} />
        </button>
        <AlertDialog>
          <AlertDialogTrigger>
            <Trash2 color="red" size={18} />
          </AlertDialogTrigger>
          <AlertDialogContent className="w-[350px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base">Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Không thể hoàn tác hành động này. Thao tác này sẽ xóa vĩnh viễn dữ liệu của bạn.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-sm">Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(item._id)} className="bg-red-500 hover:bg-red-600 text-sm">
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
