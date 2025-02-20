import { ClipboardCheck, Copy, Pencil, Trash2 } from "lucide-react"
import { convertDateTime } from "src/Helpers/common"
import useCopyText from "src/Hook/useCopyText"
import { User } from "src/Types/user.type"

export default function CustomerItem({ item, handleEditItem }: { item: User; handleEditItem: (id: string) => void }) {
  const { copiedId, handleCopyText } = useCopyText()

  const handleEditCustomerItem = (id: string) => {
    handleEditItem(id)
  }

  return (
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
      <div className="col-span-2 break-words">{item.email}</div>
      <div className="col-span-1 text-center">{item.numberPhone}</div>
      <div className="col-span-2 flex justify-center">
        {item.verify === 1 ? (
          <div className=" text-[13px] font-medium py-1 px-2 border border-[#38b000] bg-[#38b000]/20 text-[#38b000] text-center rounded-full flex gap-1 justify-center items-center">
            Verified
          </div>
        ) : item.verify === 0 ? (
          <div className="text-[13px] font-medium py-1 px-2 border border-[#df0019] bg-[#df0019]/20 text-[#df0019] text-center rounded-full flex gap-1 justify-center items-center">
            Unverified
          </div>
        ) : (
          <div className="text-[13px] font-medium py-1 px-2 border border-[#df0019] bg-[#df0019]/20 text-[#df0019] text-center rounded-full flex gap-1 justify-center items-center">
            Banned
          </div>
        )}
      </div>
      <div className="col-span-2">{convertDateTime(item.updated_at)}</div>
      <div className="col-span-1 flex items-center justify-center gap-2">
        <button onClick={() => handleEditCustomerItem(item._id)}>
          <Pencil color="orange" size={18} />
        </button>
        <Trash2 color="red" size={18} />
      </div>
    </div>
  )
}
