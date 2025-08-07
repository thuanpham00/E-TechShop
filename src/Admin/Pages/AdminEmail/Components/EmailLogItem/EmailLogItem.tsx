import { EmailLogItemType } from "src/Types/product.type"
import { Tag } from "antd"
import { convertDateTime } from "src/Helpers/common"

export default function EmailLogItem({
  item,
  index,
  maxIndex
}: {
  item: EmailLogItemType
  maxIndex: number
  index: number
}) {
  return (
    <div
      className={`bg-white dark:bg-darkPrimary grid grid-cols-12 items-center gap-2 py-3 cursor-pointer border-t-0 border border-[#dedede] dark:border-darkBorder px-4 ${index + 1 === maxIndex ? "rounded-bl-xl rounded-br-xl" : ""}`}
      key={item._id}
    >
      <div className="col-span-1 flex items-center justify-between">
        <div className="truncate w-[75%] text-blue-500">{item.resend_id}</div>
      </div>
      <div className="col-span-2">{item.from}</div>
      <div className="col-span-2 break-words">{item.to}</div>
      <div className="col-span-3 break-words">{item.subject}</div>
      <div className="col-span-2 break-words">{item.type}</div>
      <div className="col-span-1 break-words">
        <Tag color="green">{item.status}</Tag>
      </div>
      <div className="col-span-1 break-words">{convertDateTime(item.created_at)}</div>
    </div>
  )
}
