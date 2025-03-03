import { ClipboardCheck, Copy, Pencil, SquareMousePointer, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { path } from "src/Constants/path"
import { convertDateTime } from "src/Helpers/common"
import useCopyText from "src/Hook/useCopyText"
import { BrandItemType } from "src/Types/product.type"

export default function BrandItem({
  item,
  handleEditItem,
  listTotalProduct
}: {
  item: BrandItemType
  handleEditItem: (id: string) => void
  listTotalProduct: {
    brand: string
    total: string
  }[]
}) {
  const navigate = useNavigate()
  const { copiedId, handleCopyText } = useCopyText()

  const handleEditCustomerItem = (id: string) => {
    handleEditItem(id)
  }

  const handleNavigateCategoryDetail = (id: string, nameCategory: string) => {
    navigate(`${path.AdminCategories}/${id}`, {
      state: nameCategory
    })
  }
  return (
    <div>
      <div
        className="bg-white grid grid-cols-12 items-center gap-2 py-3 cursor-pointer border-t-0 border border-[#dedede] last:border-b-0 px-4 last:rounded-bl-md last:rounded-br-md"
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
        <div className="col-span-2">
          <div className="flex-1 flex justify-center items-center gap-1">
            <button onClick={() => handleEditCustomerItem(item._id)}>
              <Pencil color="orange" size={18} />
            </button>
            <Trash2 color="red" size={18} />
          </div>
        </div>
        <div className="col-span-2 break-words">
          {listTotalProduct.map((itemTotal) => {
            if (itemTotal.brand === item._id) {
              return (
                <div key={itemTotal.brand} className="flex justify-center items-center gap-2">
                  <span className="font-semibold text-[#3b82f6]">{itemTotal.total}</span>
                  <span>|</span>
                  <button onClick={() => handleNavigateCategoryDetail(item._id, item.name)}>
                    <SquareMousePointer color="blue" size={18} />
                  </button>
                </div>
              )
            }
          })}
        </div>
      </div>
    </div>
  )
}
