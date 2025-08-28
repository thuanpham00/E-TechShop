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
import { useEffect, useRef, useState } from "react"

interface Props {
  item: ReceiptItemType
}

export default function ReceiptItem({ item }: Props) {
  const listProductInReceipt = useRef<HTMLDivElement>(null)
  const { copiedId, handleCopyText } = useCopyText()
  const [showDetail, setShowDetail] = useState<boolean>(false)
  // có 20 đơn nhập hàng thì mỗi đơn là 1 ReceiptItem thì mỗi component item sẽ tạo 1 state riêng khi click vào item nào thì xử lý bên trong component đó

  useEffect(() => {
    const clickOutHideList = (event: MouseEvent) => {
      if (listProductInReceipt.current && !listProductInReceipt.current.contains(event.target as Node)) {
        setShowDetail(false)
      }
    }

    document.addEventListener("mousedown", clickOutHideList)
    return () => document.removeEventListener("mousedown", clickOutHideList)
  }, [])

  return (
    <div className="py-4 mb-2 bg-white/80 dark:bg-darkPrimary border border-[#dedede] dark:border-gray-700 px-3 rounded-xl cursor-pointer shadow-lg">
      <div className="flex items-center justify-between">
        <div className="text-base py-1 px-2 flex items-center gap-2 bg-[#e5e5e5] border border-[#dadada] rounded-md">
          <span>Đơn nhập hàng: </span>
          <h2 className="font-semibold">#{item._id}</h2>
          <button onClick={() => handleCopyText(item._id)} className="p-1 border rounded mr-2">
            {copiedId === item._id ? <ClipboardCheck color="#8d99ae" size={12} /> : <Copy color="#8d99ae" size={12} />}
          </button>
        </div>
        <div className="text-base flex items-center gap-1 text-black dark:text-white">
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
          <button onClick={() => setShowDetail((prev) => !prev)} className="text-sm text-red-500 hover:underline">
            {showDetail ? "Ẩn chi tiết" : `Xem chi tiết (${item?.items?.length}) sản phẩm`}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
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
      {showDetail && (
        <div className="transition-all ease-in-out duration-500 w-screen h-screen bg-black/20 fixed right-0 top-0 z-10 opacity-100">
          <div
            ref={listProductInReceipt}
            className="fixed right-4 top-0 z-20 bg-white dark:bg-darkPrimary w-[600px] h-screen overflow-y-scroll p-2"
          >
            <div className="text-lg text-center font-semibold mb-2 tracking-wide text-black dark:text-white">
              Danh sách sản phẩm ({item.items.length})
            </div>
            {item?.items?.map((product, index) => (
              <div key={index} className="flex items-stretch mb-4 ">
                <div className="w-[10%] p-2 rounded-tl-lg rounded-bl-lg text-black text-lg flex items-center justify-center tracking-wide text-[15px] font-semibold px-3 bg-blue-200">
                  #{index + 1}
                </div>
                <div className="w-[90%] grid grid-cols-2 gap-4 px-4 py-2 bg-white/80 dark:bg-darkPrimary rounded-tr-lg rounded-br-lg border border-gray-300">
                  <div className="col-span-2 flex items-center justify-between gap-1">
                    <span className="w-1/4 font-semibold dark:text-white">Mã sản phẩm: </span>
                    <div className="flex-grow">
                      <span className="w-full flex items-center justify-between border border-gray-300 p-2 rounded-md dark:bg-darkSecond dark:text-white">
                        <span>{product.productId._id}</span>
                        <button
                          onClick={() => handleCopyText(product.productId._id)}
                          className="p-1 border rounded mr-2"
                        >
                          {copiedId === product.productId._id ? (
                            <ClipboardCheck color="#8d99ae" size={12} />
                          ) : (
                            <Copy color="#8d99ae" size={12} />
                          )}
                        </button>
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center gap-1">
                    <span className="w-1/4 font-semibold dark:text-white">Mã nhà cung cấp: </span>
                    <div className="w-3/4">
                      <span className="w-full flex items-center justify-between border border-gray-300 p-2 rounded-md dark:bg-darkSecond dark:text-white">
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

                  <div className="col-span-2 flex items-center gap-1">
                    <span className="w-1/4 font-semibold dark:text-white">Tên sản phẩm: </span>
                    <div className="w-3/4">
                      <span className="w-full flex items-center justify-between border border-gray-300 p-2 rounded-md dark:bg-darkSecond">
                        <span className="dark:text-white">{product.productId.name}</span>
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center gap-1">
                    <span className="w-1/4 font-semibold dark:text-white">Nhà sản xuất: </span>
                    <div className="w-3/4">
                      <span className="w-full flex items-center justify-between border border-gray-300 p-2 rounded-md dark:bg-darkSecond">
                        <span className="dark:text-white">{product.supplierId.name}</span>
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center gap-1">
                    <span className="w-1/4 font-semibold dark:text-white">Số lượng: </span>
                    <div className="w-3/4">
                      <span className="w-full flex items-center justify-between border border-gray-300 p-2 rounded-md dark:bg-darkSecond">
                        <span className="dark:text-white">{product.quantity}</span>
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center gap-1">
                    <span className="w-1/4 font-semibold dark:text-white">Giá nhập: </span>
                    <div className="w-3/4">
                      <span className="w-full flex items-center justify-between border border-gray-300 p-2 rounded-md dark:bg-darkSecond">
                        <span className="text-red-500 font-semibold">{formatCurrency(product.pricePerUnit)}đ</span>
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center gap-1">
                    <span className="w-1/4 font-semibold dark:text-white">Tổng tiền sản phẩm: </span>
                    <div className="w-3/4">
                      <span className="w-full block font-semibold border border-gray-300 p-2 rounded-md text-red-500 dark:bg-darkSecond">
                        {formatCurrency(product.totalPrice)}đ
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    <span className="w-1/4 font-semibold dark:text-white">Hình ảnh: </span>
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
      )}
    </div>
  )
}
