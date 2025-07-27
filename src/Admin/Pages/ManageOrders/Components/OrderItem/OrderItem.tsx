import { ClipboardCheck, Copy, Pencil } from "lucide-react"
import useCopyText from "src/Hook/useCopyText"
import { OrderItemType } from "src/Types/product.type"
import { convertDateTime, formatCurrency } from "src/Helpers/common"
import { Tag } from "antd"
import { useMemo } from "react"

export default function OrderItem({
  item,
  maxIndex,
  index,
  handleEditItem
}: {
  item: OrderItemType
  maxIndex: number
  index: number
  handleEditItem: (id: string) => void
}) {
  const { copiedId, handleCopyText } = useCopyText()
  const status = item.status
  let color = ""
  switch (status) {
    case "Chờ xác nhận":
      color = "orange"
      break
    case "Đang xử lý":
      color = "blue"
      break
    case "Đang vận chuyển":
      color = "cyan"
      break
    case "Đã giao hàng":
      color = "green"
      break
    case "Đã hủy":
      color = "red"
      break
    default:
      color = "default"
  }

  const handleEditCustomerItem = (id: string) => {
    handleEditItem(id)
  }

  const countProductBuy = useMemo(() => {
    return item.products.reduce((total, item) => {
      return total + item.quantity
    }, 0)
  }, [item.products])

  return (
    <div>
      <div
        className={`bg-white dark:bg-darkPrimary grid grid-cols-12 items-center gap-4 py-3 cursor-pointer border-t-0 border border-[#dedede] dark:border-darkBorder px-4 ${index + 1 === maxIndex ? "rounded-bl-xl rounded-br-xl" : ""}`}
        key={item._id}
      >
        <div className="col-span-1 flex items-center justify-between">
          <div className="truncate w-[75%] text-blue-500">{item._id}</div>
          <button onClick={() => handleCopyText(item._id)} className="p-1 border rounded mr-2">
            {copiedId === item._id ? <ClipboardCheck color="#8d99ae" size={12} /> : <Copy color="#8d99ae" size={12} />}
          </button>
        </div>
        <div className="col-span-2">{item.customer_info ? item.customer_info.name : ""}</div>
        <div className="col-span-1 break-words">{item.customer_info ? item.customer_info.phone : ""}</div>
        <div className="col-span-2 text-center">{item.customer_info ? item.customer_info.address : ""}</div>
        <div className="col-span-1 text-red-500 font-semibold">
          {item.totalAmount ? formatCurrency(item.totalAmount) + "đ" : ""}
        </div>
        <div className="col-span-1 text-center text-red-500 font-semibold">
          {item.products ? "(" + countProductBuy + ")" : ""}
        </div>
        <div className="col-span-2 flex justify-center">
          <Tag color={color} className="text-sm text-center break-words whitespace-normal max-w-full">
            {status}
          </Tag>
        </div>
        <div className="col-span-1">{convertDateTime(item.created_at)}</div>
        <div className="col-span-1 flex items-center justify-center gap-2">
          <button onClick={() => handleEditCustomerItem(item._id)}>
            <Pencil color="orange" size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
