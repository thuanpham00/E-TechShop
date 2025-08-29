import { ClipboardCheck, Copy, Pencil, Trash2 } from "lucide-react"
import { convertDateTime, formatCurrency } from "src/Helpers/common"
import useCopyText from "src/Hook/useCopyText"
import { SupplyItemType } from "src/Types/product.type"
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

export default function SupplyItem({
  item,
  onDelete,
  handleEditItem,
  maxIndex,
  index
}: {
  item: SupplyItemType
  onDelete: (id: string) => void
  handleEditItem: (item: SupplyItemType) => void
  maxIndex: number
  index: number
}) {
  const { copiedId, handleCopyText } = useCopyText()

  return (
    <div
      className={`bg-white dark:bg-darkPrimary grid grid-cols-12 items-center gap-2 py-3 cursor-pointer border-t-0 border border-[#dedede] dark:border-darkBorder px-4 ${index + 1 === maxIndex ? "rounded-bl-xl rounded-br-xl" : ""}`}
      key={item._id}
    >
      <div className="col-span-2 flex items-center justify-between">
        <div className="truncate w-[75%] text-blue-500">{item._id}</div>
        <button onClick={() => handleCopyText(item._id)} className="p-1 border rounded mr-2">
          {copiedId === item._id ? <ClipboardCheck color="#8d99ae" size={12} /> : <Copy color="#8d99ae" size={12} />}
        </button>
      </div>
      <div className="col-span-3 text-black dark:text-white">{item.productId[0].name}</div>
      <div className="col-span-2 break-words text-black dark:text-white">{item.supplierId[0].name}</div>
      <div className="col-span-1 break-words text-red-600 font-semibold">{formatCurrency(item.importPrice)}đ</div>
      <div className="col-span-1 break-words text-center text-black dark:text-white">{item.leadTimeDays}</div>
      <div className="col-span-1 break-words text-black dark:text-white">{convertDateTime(item.created_at)}</div>
      <div className="col-span-1 break-words text-black dark:text-white">{convertDateTime(item.updated_at)}</div>
      <div className="col-span-1 flex items-center justify-center gap-2">
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
    </div>
  )
}
