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
import { UserType } from "src/Types/user.type"

export default function CustomerItem({
  item,
  handleEditItem,
  onDelete
}: {
  item: UserType
  handleEditItem: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { copiedId, handleCopyText } = useCopyText()

  const handleEditCustomerItem = (id: string) => {
    handleEditItem(id)
  }

  return (
    <div
      className="bg-white dark:bg-darkPrimary grid grid-cols-12 items-center gap-2 py-3 cursor-pointer border-t-0 border border-[#dedede] dark:border-darkBorder px-4 last:rounded-bl-md last:rounded-br-md"
      key={item._id}
    >
      <div className="col-span-2 flex items-center justify-between">
        <div className="truncate w-[75%] text-blue-500">{item._id}</div>
        <button onClick={() => handleCopyText(item._id)} className="p-1 border rounded mr-2">
          {copiedId === item._id ? <ClipboardCheck color="#8d99ae" size={12} /> : <Copy color="#8d99ae" size={12} />}
        </button>
      </div>
      <div className="col-span-2">{item.name}</div>
      <div className="col-span-2 break-words">{item.email}</div>
      <div className="col-span-1 text-center">{item.numberPhone}</div>
      <div className="col-span-2 flex justify-center">
        {item.verify === 1 ? (
          <div className=" text-[13px] font-medium py-1 px-2 border border-[#b2ffb4] bg-[#b2ffb4] text-[#04710c] text-center rounded-full flex gap-1 justify-center items-center">
            Verified
          </div>
        ) : (
          <div className="text-[13px] font-medium py-1 px-2 border border-[#ffdcdc] bg-[#ffdcdc] text-[#f00] text-center rounded-full flex gap-1 justify-center items-center">
            Unverified
          </div>
        )}
      </div>
      <div className="col-span-2">{convertDateTime(item.updated_at)}</div>
      <div className="col-span-1 flex items-center justify-center gap-2">
        <button onClick={() => handleEditCustomerItem(item._id)}>
          <Pencil color="orange" size={18} />
        </button>
        <AlertDialog>
          <AlertDialogTrigger>
            <Trash2 color="red" size={18} />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
              <AlertDialogDescription>
                Không thể hoàn tác hành động này. Thao tác này sẽ xóa vĩnh viễn dữ liệu của bạn.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(item._id)} className="bg-red-500 hover:bg-red-600">
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
