import { ClipboardCheck, Copy } from "lucide-react"
import useCopyText from "src/Hook/useCopyText"
import { ReceiptItemType } from "src/Types/product.type"
import { convertDateTime, formatCurrency } from "src/Helpers/common"
import { useNavigate } from "react-router-dom"
import { queryParamConfigReceipt } from "src/Types/queryParams.type"

interface Props {
  item: ReceiptItemType
  queryConfig: queryParamConfigReceipt
}

export default function ReceiptItem({ item, queryConfig }: Props) {
  console.log(item)
  const navigate = useNavigate()
  const { copiedId, handleCopyText } = useCopyText()

  const statusInfo = (() => {
    const s = item.status || ""
    if (["DRAFT"].includes(s)) {
      return {
        label: "Phiếu nháp",
        className:
          "bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-200/20 dark:text-yellow-300 dark:border-yellow-600"
      }
    }
    if (["RECEIVED"].includes(s)) {
      return {
        label: "Đã nhập hàng",
        className:
          "bg-green-100 text-green-700 border border-green-300 dark:bg-green-200/20 dark:text-green-300 dark:border-green-600"
      }
    }
    return {
      label: item.status || "Không xác định",
      className:
        "bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-200/20 dark:text-gray-300 dark:border-gray-600"
    }
  })()

  return (
    <div className="mt-4 py-4 mb-2 bg-white/80 dark:bg-darkPrimary border border-[#dedede] dark:border-gray-700 px-3 rounded-xl cursor-pointer shadow-lg">
      <div className="flex items-center justify-between">
        <div className="text-base py-1 px-2 flex items-center gap-2 bg-[#e5e5e5] dark:bg-darkSecond border border-[#dadada] dark:border-darkBorder rounded-md">
          <span>Đơn nhập hàng: </span>
          <h2 className="font-semibold">#{item._id}</h2>
          <button onClick={() => handleCopyText(item._id)} className="p-1 border rounded mr-2">
            {copiedId === item._id ? <ClipboardCheck color="#8d99ae" size={12} /> : <Copy color="#8d99ae" size={12} />}
          </button>
        </div>
        <div className="text-base flex items-center gap-2 text-black dark:text-white">
          <span className={`px-2 py-1 rounded-md text-sm font-medium ${statusInfo.className}`}>{statusInfo.label}</span>
          <span>Ngày nhập hàng: </span>
          <span className="font-semibold">{convertDateTime(item.importDate)}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 items-center gap-2 pt-2 px-1" key={item._id}>
        <div className="col-span-1">
          <div className="flex items-center gap-1">
            <span className="text-black dark:text-white">Số lượng sản phẩm:</span>
            <span className="text-red-500 font-semibold">{item.totalItem}</span>
          </div>
        </div>
        <div className="col-span-1 ml-auto">
          <div className="flex items-center gap-1">
            <span className="text-black dark:text-white">Tổng giá trị đơn:</span>
            <span className="text-red-500 font-semibold px-2 py-1 bg-red-100 rounded-md border border-red-500">
              {formatCurrency(item.totalAmount)}đ
            </span>
          </div>
        </div>
        <div className="col-span-1">
          <div className="flex items-center gap-1 text-black dark:text-white">
            <span>Ngày tạo:</span>
            <span className="font-semibold">{convertDateTime(item.created_at)}</span>
          </div>
        </div>
        <div className="col-span-1 ml-auto">
          <div className="flex items-center gap-1 text-black dark:text-white">
            <span>Ngày cập nhật:</span>
            <span className="font-semibold">{convertDateTime(item.updated_at)}</span>
          </div>
        </div>
        <div className="col-span-2">
          <span className="text-black dark:text-white">Ghi chú:</span>
          <textarea
            rows={3}
            disabled
            className="mt-1 block border border-[#dadada] p-2 w-full rounded-md dark:bg-darkPrimary text-black dark:text-white"
            value={item.note ? item.note : "Không có ghi chú"}
          />
        </div>
      </div>
      <div className="py-2 px-1">
        <div className="flex items-center justify-end">
          <button
            onClick={() =>
              navigate(`/admin/receipts/${item._id}`, {
                state: { data: item, queryConfig: queryConfig }
              })
            }
            className="text-sm text-red-500 hover:underline"
          >
            {`Xem chi tiết (${item?.items?.length}) sản phẩm`}
          </button>
        </div>
      </div>
    </div>
  )
}
