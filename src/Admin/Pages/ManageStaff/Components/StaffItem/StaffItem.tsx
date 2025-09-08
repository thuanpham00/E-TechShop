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
import { convertDateTime, formatCurrency } from "src/Helpers/common"
import useCopyText from "src/Hook/useCopyText"
import { UserType } from "src/Types/user.type"

export default function StaffItem({
  item,
  handleEditItem,
  onDelete,
  maxIndex,
  index
}: {
  item: UserType
  handleEditItem: (item: UserType) => void
  onDelete: (id: string) => void
  maxIndex: number
  index: number
}) {
  const { copiedId, handleCopyText } = useCopyText()

  return (
    <div
      className={`bg-white dark:bg-darkPrimary grid grid-cols-10 items-center gap-2 py-3 cursor-pointer border-t-0 border border-[#dedede] dark:border-darkBorder px-4 ${index + 1 === maxIndex ? "rounded-bl-xl rounded-br-xl" : ""}`}
      key={item._id}
    >
      <div className="col-span-2 flex items-center justify-between">
        <div className="truncate w-[75%] text-blue-500">{item._id}</div>
        <button onClick={() => handleCopyText(item._id)} className="p-1 border rounded mr-2">
          {copiedId === item._id ? <ClipboardCheck color="#8d99ae" size={12} /> : <Copy color="#8d99ae" size={12} />}
        </button>
      </div>
      <div className="col-span-1 text-black dark:text-white">{item.name}</div>
      <div className="col-span-1 break-words text-black dark:text-white">{item.role}</div>
      <div className="col-span-1 break-words text-black dark:text-white">{item.employeeInfo?.department}</div>
      <div className="col-span-1 text-center dark:text-white text-red-500 font-semibold">
        {formatCurrency(item.employeeInfo?.salary as number)}
      </div>
      <div className="col-span-1 text-black dark:text-white">
        {item.employeeInfo?.contract_type
          ? item.employeeInfo.contract_type.charAt(0).toUpperCase() +
            item.employeeInfo.contract_type.slice(1).toLowerCase()
          : ""}
      </div>
      <div className="col-span-1 flex justify-center">
        {item.employeeInfo?.status === "active" && (
          <div className=" text-[13px] font-medium py-1 px-2 border border-[#b2ffb4] bg-[#b2ffb4] text-[#04710c] text-center rounded-full flex gap-1 justify-center items-center">
            Active
          </div>
        )}
        {item.employeeInfo?.status === "inactive" && (
          <div className="text-[13px] font-medium py-1 px-2 border border-[#ffdcdc] bg-[#ffdcdc] text-[#f00] text-center rounded-full flex gap-1 justify-center items-center">
            Inactive
          </div>
        )}
        {item.employeeInfo?.status === "suspended" && (
          <div className="text-[13px] font-medium py-1 px-2 border border-[#ffdcdc] bg-[#ffdcdc] text-[#f00] text-center rounded-full flex gap-1 justify-center items-center">
            Suspended
          </div>
        )}
      </div>
      <div className="col-span-1 text-black dark:text-white">
        {convertDateTime((item.employeeInfo?.hire_date as Date).toString())}
      </div>

      <div className="col-span-1 flex items-center justify-center gap-2">
        <button onClick={() => handleEditItem(item)}>
          <Pencil color="orange" size={18} />
        </button>
        <AlertDialog>
          <AlertDialogTrigger>
            <Trash2 color="red" size={18} />
          </AlertDialogTrigger>
          <AlertDialogContent className="dark:bg-darkPrimary">
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
              <AlertDialogDescription>
                Không thể hoàn tác hành động này. Thao tác này sẽ xóa vĩnh viễn dữ liệu của bạn.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="dark:bg-darkPrimary">Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(item._id)} className="bg-red-500 hover:bg-red-600 text-white">
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
