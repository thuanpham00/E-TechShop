import { ClipboardCheck, Copy, Pencil, Trash2 } from "lucide-react"
import { convertDateTime } from "src/Helpers/common"
import useCopyText from "src/Hook/useCopyText"
import { ProductItemType } from "src/Types/product.type"
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

export default function ProductItem({
  item
  // handleEditItem
  // onDelete
}: {
  item: ProductItemType
  onDelete?: (id: string) => void
  handleEditItem?: (id: string) => void
}) {
  // const navigate = useNavigate()
  const { copiedId, handleCopyText } = useCopyText()

  // const handleEditCustomerItem = (id: string) => {
  //   handleEditItem(id)
  // }

  // const handleNavigateCategoryDetail = (id: string, nameCategory: string) => {
  //   navigate(`${path.AdminProducts}/${id}`, {
  //     state: nameCategory
  //   })
  // }

  return (
    <div
      className="bg-white dark:bg-darkPrimary grid grid-cols-12 items-center gap-4 py-3 cursor-pointer border-t-0 border border-[#dedede] dark:border-darkBorder last:border-b-0 px-4 last:rounded-bl-md last:rounded-br-md"
      key={item._id}
    >
      <div className="col-span-2 flex items-center justify-between">
        <div className="truncate w-[75%] text-blue-500">{item._id}</div>
        <button onClick={() => handleCopyText(item._id)} className="p-1 border rounded mr-2">
          {copiedId === item._id ? <ClipboardCheck color="#8d99ae" size={12} /> : <Copy color="#8d99ae" size={12} />}
        </button>
      </div>
      <div className="col-span-2">
        <img src={item.banner.url} alt={item._id} className="h-auto w-full object-cover" />
      </div>
      <div className="col-span-1 font-semibold">{item.name}</div>
      <div className="col-span-1">{item.brand[0].name}</div>
      <div className="col-span-1">{item.category[0].name}</div>
      <div className="col-span-1">{item.price}</div>
      <div className="col-span-1">{item.stock}</div>
      <div className="col-span-1 break-words">{convertDateTime(item.created_at)}</div>
      <div className="col-span-1 break-words">{convertDateTime(item.updated_at)}</div>
      <div className="col-span-1 flex items-center justify-center gap-2">
        <button>
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
              <AlertDialogAction className="bg-red-500 hover:bg-red-600">Xóa</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
