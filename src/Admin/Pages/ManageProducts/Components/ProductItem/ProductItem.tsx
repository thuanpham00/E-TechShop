import { ClipboardCheck, Copy, Pencil, Trash2 } from "lucide-react"
import { convertDateTime, formatCurrency } from "src/Helpers/common"
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
import { Image } from "antd"

export default function ProductItem({
  item,
  // handleEditItem
  // onDelete
  maxIndex,
  index
}: {
  item: ProductItemType
  onDelete?: (id: string) => void
  handleEditItem?: (id: string) => void
  maxIndex: number
  index: number
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
      className={`${index % 2 === 0 ? "bg-[#f2f2f2]" : "bg-white"} dark:bg-darkPrimary grid grid-cols-12 items-center gap-4 py-3 cursor-pointer border border-[#dedede] dark:border-darkBorder px-4 ${index + 1 === maxIndex ? "rounded-bl-lg rounded-br-lg" : ""}`}
      key={item._id}
    >
      <div className="col-span-1 flex items-center justify-between">
        <div className="truncate w-[75%] text-blue-500">{item._id}</div>
        <button onClick={() => handleCopyText(item._id)} className="p-1 border rounded mr-2">
          {copiedId === item._id ? <ClipboardCheck color="#8d99ae" size={12} /> : <Copy color="#8d99ae" size={12} />}
        </button>
      </div>
      <div className="col-span-2">
        <Image src={item.banner.url} loading="lazy" alt={item._id} className="h-auto w-full object-cover" />
      </div>
      <div className="col-span-2 font-semibold text-black dark:text-white">{item.name}</div>
      <div className="col-span-1 text-black dark:text-white">{item.brand[0].name}</div>
      <div className="col-span-1 text-black dark:text-white">{item.category[0].name}</div>
      <div className="col-span-1 text-red-600 font-semibold">{formatCurrency(item.price)}đ</div>
      <div className="col-span-1">
        {item.status === "out_of_stock" && (
          <div className=" text-[13px] font-medium py-1 px-2 border border-[#ffdcdc] bg-[#ffdcdc] text-[#f00] text-center rounded-full flex gap-1 justify-center items-center">
            Hết hàng
          </div>
        )}
        {item.status === "available" && (
          <div className="text-[13px] font-medium py-1 px-2 border border-[#b2ffb4] bg-[#b2ffb4] text-[#04710c] text-center rounded-full flex gap-1 justify-center items-center">
            Còn hàng
          </div>
        )}
        {item.status === "discontinued" && (
          <div className="text-[13px] font-medium py-1 px-2 border border-[#ffdcdc] bg-[#ffdcdc] text-[#04710c] text-center rounded-full flex gap-1 justify-center items-center">
            Ngừng kinh doanh
          </div>
        )}
      </div>
      <div className="col-span-1 break-words ml-4 text-black dark:text-white">{convertDateTime(item.created_at)}</div>
      <div className="col-span-1 break-words ml-4 text-black dark:text-white">{convertDateTime(item.updated_at)}</div>
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
