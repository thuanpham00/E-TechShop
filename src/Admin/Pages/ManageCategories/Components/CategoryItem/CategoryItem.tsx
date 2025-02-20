import { ClipboardCheck, Copy, Expand, Pencil, Trash2 } from "lucide-react"
import { convertDateTime } from "src/Helpers/common"
import useCopyText from "src/Hook/useCopyText"
import { CategoryItemType } from "src/Types/product.type"

export default function CategoryItem({
  item,
  handleEditItem
}: {
  item: CategoryItemType
  handleEditItem: (id: string) => void
}) {
  const { copiedId, handleCopyText } = useCopyText()

  const handleEditCustomerItem = (id: string) => {
    handleEditItem(id)
  }

  return (
    <div
      className="bg-white grid grid-cols-10 items-center gap-2 py-3 cursor-pointer border-t-0 border border-[#dedede] last:border-b-0 px-4 last:rounded-bl-md last:rounded-br-md"
      key={item._id}
    >
      <div className="col-span-2 flex items-center justify-between">
        <div className="truncate w-[75%] text-blue-500">{item._id}</div>
        <button onClick={() => handleCopyText(item._id)} className="p-1 border rounded mr-2">
          {copiedId === item._id ? <ClipboardCheck color="#8d99ae" size={12} /> : <Copy color="#8d99ae" size={12} />}
        </button>
      </div>
      <div className="col-span-2">{item.name}</div>
      <div className="col-span-2 break-words">{convertDateTime(item.created_at)}</div>
      <div className="col-span-2 break-words">{convertDateTime(item.updated_at)}</div>
      <div className="col-span-2 flex items-center justify-center gap-2">
        <Expand color="blue" size={18} />
        <button onClick={() => handleEditCustomerItem(item._id)}>
          <Pencil color="orange" size={18} />
        </button>
        <Trash2 color="red" size={18} />
      </div>
    </div>
  )
}
