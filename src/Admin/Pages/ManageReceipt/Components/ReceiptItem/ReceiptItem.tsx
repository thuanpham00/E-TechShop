import { ClipboardCheck, Copy, Pencil, Trash2 } from "lucide-react"
import useCopyText from "src/Hook/useCopyText"
import { ReceiptItemType } from "src/Types/product.type"
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
import { useState } from "react"

interface Props {
  item: ReceiptItemType
}

export default function ReceiptItem({ item }: Props) {
  const { copiedId, handleCopyText } = useCopyText()
  const [showDetail, setShowDetail] = useState<boolean>(false)
  // có 20 đơn nhập hàng thì mỗi đơn là 1 ReceiptItem thì mỗi component item sẽ tạo 1 state riêng khi click vào item nào thì xử lý bên trong component đó

  return (
    <div className="py-4 mb-2 bg-white/80 dark:bg-darkPrimary border border-[#dedede] dark:border-darkBorder px-3 rounded-xl cursor-pointer shadow-lg">
      <div className="flex items-center justify-between">
        <div className="text-base py-1 px-2 flex items-center gap-2 bg-[#e5e5e5] border border-[#dadada] rounded-md">
          <span>Đơn nhập hàng: </span>
          <h2 className="font-semibold">#{item._id}</h2>
          <button onClick={() => handleCopyText(item._id)} className="p-1 border rounded mr-2">
            {copiedId === item._id ? <ClipboardCheck color="#8d99ae" size={12} /> : <Copy color="#8d99ae" size={12} />}
          </button>
        </div>
        <div className="text-base flex items-center gap-1">
          <span>Ngày nhập hàng: </span>
          <span className="font-semibold">{convertDateTime(item.importDate)}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 items-center gap-2 pt-2 px-1" key={item._id}>
        <div className="col-span-1">
          <div className="flex items-center gap-1">
            <span>Số lượng sản phẩm:</span>
            <span className="text-red-500 font-semibold">{item.totalItem}</span>
          </div>
        </div>
        <div className="col-span-1 ml-auto">
          <div className="flex items-center gap-1">
            <span>Tổng giá trị đơn:</span>
            <span className="text-red-500 font-semibold px-2 py-1 bg-red-100 rounded-md border border-red-500">
              {formatCurrency(item.totalAmount)}đ
            </span>
          </div>
        </div>
        <div className="col-span-1">
          <div className="flex items-center gap-1">
            <span>Ngày tạo:</span>
            <span className="font-semibold">{convertDateTime(item.created_at)}</span>
          </div>
        </div>
        <div className="col-span-1 ml-auto">
          <div className="flex items-center gap-1">
            <span>Ngày cập nhật:</span>
            <span className="font-semibold">{convertDateTime(item.updated_at)}</span>
          </div>
        </div>
        <div className="col-span-2">
          <span>Ghi chú:</span>
          <textarea
            rows={3}
            disabled
            className="mt-1 block border border-[#dadada] p-2 w-full rounded-md dark:bg-darkPrimary"
          >
            {item.note ? item.note : "Không có ghi chú"}
          </textarea>
        </div>
      </div>
      <div className="py-2 px-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Danh sách sản phẩm: ({item.items.length})</h3>
          <button onClick={() => setShowDetail((prev) => !prev)} className="text-sm text-red-500 hover:underline">
            {showDetail ? "Ẩn chi tiết" : "Xem chi tiết"}
          </button>
        </div>
        <div
          className={`mt-2 transition-all ease-in-out duration-500 overflow-hidden ${
            showDetail ? "max-h-[999px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {item.items.map((product, index) => (
            <div key={index} className="flex items-stretch mb-4 ">
              <div className="w-[7%] p-2 rounded-tl-lg rounded-bl-lg text-black text-lg flex items-center justify-center tracking-wide text-[15px] font-semibold px-3 bg-blue-200">
                SP{index + 1}
              </div>
              <div className="w-[93%] grid grid-cols-2 gap-4 px-4 py-2 bg-[#edf2f4 rounded-tr-lg rounded-br-lg border border-gray-300">
                <div className="col-span-1 flex items-center justify-between gap-1">
                  <span className="w-1/4 font-semibold">Mã sản phẩm: </span>
                  <div className="flex-grow">
                    <span className="w-full flex items-center justify-between border border-gray-300 p-2 rounded-md">
                      <span>{product.productId._id}</span>
                      <button onClick={() => handleCopyText(product.productId._id)} className="p-1 border rounded mr-2">
                        {copiedId === product.productId._id ? (
                          <ClipboardCheck color="#8d99ae" size={12} />
                        ) : (
                          <Copy color="#8d99ae" size={12} />
                        )}
                      </button>
                    </span>
                  </div>
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <span className="w-1/4 font-semibold">Mã nhà cung cấp: </span>
                  <div className="w-3/4">
                    <span className="w-full flex items-center justify-between border border-gray-300 p-2 rounded-md">
                      <span>{product.supplierId._id}</span>
                      <button
                        onClick={() => handleCopyText(product.supplierId._id)}
                        className="p-1 border rounded mr-2"
                      >
                        {copiedId === product.supplierId._id ? (
                          <ClipboardCheck color="#8d99ae" size={12} />
                        ) : (
                          <Copy color="#8d99ae" size={12} />
                        )}
                      </button>
                    </span>
                  </div>
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <span className="w-1/4 font-semibold">Tên sản phẩm: </span>
                  <div className="w-3/4">
                    <span className="w-full flex items-center justify-between border border-gray-300 p-2 rounded-md">
                      <span>{product.productId.name}</span>
                    </span>
                  </div>
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <span className="w-1/4 font-semibold">Nhà sản xuất: </span>
                  <div className="w-3/4">
                    <span className="w-full flex items-center justify-between border border-gray-300 p-2 rounded-md">
                      <span>{product.supplierId.name}</span>
                    </span>
                  </div>
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <span className="w-1/4 font-semibold">Số lượng: </span>
                  <div className="w-3/4">
                    <span className="w-full flex items-center justify-between border border-gray-300 p-2 rounded-md">
                      <span>{product.quantity}</span>
                    </span>
                  </div>
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <span className="w-1/4 font-semibold">Giá nhập: </span>
                  <div className="w-3/4">
                    <span className="w-full flex items-center justify-between border border-gray-300 p-2 rounded-md">
                      <span className="text-red-500 font-semibold">{formatCurrency(product.pricePerUnit)}đ</span>
                    </span>
                  </div>
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <span className="w-1/4 font-semibold">Tổng tiền sản phẩm: </span>
                  <div className="w-3/4">
                    <span className="w-full block font-semibold border border-gray-300 p-2 rounded-md text-red-500">
                      {formatCurrency(product.totalPrice)}đ
                    </span>
                  </div>
                </div>
                <div className="col-span-1 flex items-center gap-2">
                  <span className="w-1/4 font-semibold">Hình ảnh: </span>
                  <div className="w-3/4">
                    <img
                      src={product.productId.banner.url}
                      alt={product.productId.name}
                      className="w-[150px] h-[150px] mt-2 object-cover rounded-md border border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-2 flex items-center justify-end gap-2">
        <button className="p-2 bg-yellow-100 hover:bg-blue-300 rounded-md duration-200">
          <Pencil color="orange" size={18} />
        </button>
        <AlertDialog>
          <AlertDialogTrigger className="p-2 bg-red-100 hover:bg-red-300 rounded-md duration-200">
            <Trash2 color="red" size={18} />
          </AlertDialogTrigger>
          <AlertDialogContent className="w-[350px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base">Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Không thể hoàn tác hành động này. Thao tác này sẽ xóa vĩnh viễn dữ liệu của bạn.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-sm">Hủy</AlertDialogCancel>
              <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-sm">Xóa</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
