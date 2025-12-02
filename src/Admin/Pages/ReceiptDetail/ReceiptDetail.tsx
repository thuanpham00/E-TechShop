import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Button from "src/Components/Button"
import { ChevronLeft, ClipboardCheck, Copy } from "lucide-react"
import { ReceiptItemType, UpdateReceiptBodyReq } from "src/Types/product.type"
import { convertDateTime, formatCurrency, parseCurrencyToNumber } from "src/Helpers/common"
import useCopyText from "src/Hook/useCopyText"
import { Helmet } from "react-helmet-async"
import { useMutation, useQueryClient, keepPreviousData, useQuery, useQueries } from "@tanstack/react-query"
import { ReceiptAPI } from "src/Apis/admin/receipt.api"
import { toast } from "react-toastify"
import { useForm, useFieldArray } from "react-hook-form"
import Input from "src/Components/Input"
//
import { Select } from "antd"
import { SuccessResponse } from "src/Types/utils.type"
import { ProductAPI } from "src/Apis/admin/product.api"
import { SupplierAPI } from "src/Apis/admin/supplier.api"
import { AnimatePresence, motion } from "framer-motion"
import { path } from "src/Constants/path"

export default function ReceiptDetail() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const initialReceipt = state?.data as ReceiptItemType | undefined
  const { copiedId, handleCopyText } = useCopyText()
  const queryClient = useQueryClient()
  const [inputValueProducts, setInputValueProducts] = useState<string[]>([])
  // Product names
  const getNameProducts = useQuery({
    queryKey: ["nameProductReceipt"],
    queryFn: () => ProductAPI.getNameProducts(),
    retry: 0,
    staleTime: 15 * 60 * 1000,
    placeholderData: keepPreviousData
  })
  const listNameProduct = getNameProducts.data?.data as SuccessResponse<{ result: string[] }>
  const listNameProductResult = listNameProduct?.result?.result || []

  // Suppliers per product
  const getNameSuppliersBasedOnNameProduct = useQueries({
    queries: (inputValueProducts || []).map((productName, index) => ({
      queryKey: ["nameSupplierBasedOnNameProductReceipt", `${productName}-${index}`],
      queryFn: () => SupplierAPI.getNameSuppliersLinkedToProduct(productName),
      enabled: !!productName
    }))
  })

  // Import price per product-supplier selection (defined after fields)

  // Ensure supplier queries track current fields length (after fields exists)
  useEffect(() => {
    // will be updated after fields is defined below
  }, [])

  type FormData = {
    importDate: string
    totalItem: number
    totalAmount: string
    items: Array<{
      productId: string
      supplierId: string
      quantity: string
      pricePerUnit: string
      totalPrice: string
    }>
    note: string
  }

  const { control, register, setValue, watch, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      importDate: initialReceipt ? convertDateTime(initialReceipt.importDate) : "",
      totalItem: initialReceipt ? initialReceipt.items.reduce((s, i) => s + Number(i.quantity || 0), 0) : 0,
      totalAmount: initialReceipt
        ? formatCurrency(
            initialReceipt.items.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.pricePerUnit || 0), 0)
          )
        : "0",
      items: initialReceipt
        ? initialReceipt.items.map((i) => ({
            productId: i.productId.name || "",
            supplierId: i.supplierId.name || "",
            quantity: String(i.quantity || 0),
            pricePerUnit: formatCurrency(Number(i.pricePerUnit || 0)),
            totalPrice: formatCurrency(Number(i.quantity || 0) * Number(i.pricePerUnit || 0))
          }))
        : [],
      note: initialReceipt?.note || ""
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  // Import price per product-supplier selection (mirror AddReceipt behavior)
  const pricePerUnitQueries = useQueries({
    queries: (fields || []).map((_, index) => ({
      queryKey: ["pricePerUnitReceiptDetail", inputValueProducts[index], watch(`items.${index}.supplierId`)],
      queryFn: () =>
        ReceiptAPI.getPricePerUnitBasedOnProductAndSupplier({
          name_product: inputValueProducts[index],
          name_supplier: watch(`items.${index}.supplierId`)
        }),
      enabled: !!inputValueProducts[index] && !!watch(`items.${index}.supplierId`)
    }))
  })

  // Sync inputValueProducts length with fields after fields is available
  useEffect(() => {
    setInputValueProducts((prev) => {
      const next = [...prev]
      const len = fields.length
      if (len > next.length) {
        return next.concat(Array(len - next.length).fill(""))
      }
      return next.slice(0, len)
    })
  }, [fields.length])

  useEffect(() => {
    if (!initialReceipt) return
    reset({
      importDate: convertDateTime(initialReceipt.importDate),
      totalItem: initialReceipt.items.reduce((s, i) => s + Number(i.quantity || 0), 0),
      totalAmount: formatCurrency(
        initialReceipt.items.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.pricePerUnit || 0), 0)
      ),
      items: initialReceipt.items.map((i) => ({
        productId: i.productId.name || "",
        supplierId: i.supplierId.name || "",
        quantity: String(i.quantity || 0),
        pricePerUnit: formatCurrency(Number(i.pricePerUnit || 0)),
        totalPrice: formatCurrency(Number(i.quantity || 0) * Number(i.pricePerUnit || 0))
      })),
      note: initialReceipt.note || ""
    })
    setInputValueProducts(initialReceipt.items.map((i) => i.productId.name || ""))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReceipt])

  // Recompute totals whenever items change
  const watchItems = watch("items") || []
  const totalItemComputed = watchItems.reduce((sum, i) => sum + Number(i.quantity || 0), 0)
  const totalAmountComputed = watchItems.reduce(
    (sum, i) => sum + Number(i.quantity || 0) * Number(parseCurrencyToNumber(i.pricePerUnit || "0")),
    0
  )
  useEffect(() => {
    setValue("totalItem", totalItemComputed)
    setValue("totalAmount", formatCurrency(totalAmountComputed))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItemComputed, totalAmountComputed])

  // When pricePerUnit query resolves or quantity changes, update price and totals per item
  useEffect(() => {
    ;(fields || []).forEach((_, index) => {
      const qty = Number(watch(`items.${index}.quantity`) || 0)
      const importPrice = pricePerUnitQueries?.[index]?.data?.data?.result?.result?.importPrice ?? 0
      if (importPrice) {
        setValue(`items.${index}.pricePerUnit`, formatCurrency(importPrice))
      } else {
        const current = parseCurrencyToNumber(watch(`items.${index}.pricePerUnit`) || "0")
        setValue(`items.${index}.pricePerUnit`, formatCurrency(current || 0))
      }
      const unit = importPrice || Number(parseCurrencyToNumber(watch(`items.${index}.pricePerUnit`) || "0"))
      setValue(`items.${index}.totalPrice`, formatCurrency(qty * unit))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, pricePerUnitQueries, watch])

  const handleChangeQuantity = (index: number, value: string) => {
    const qty = Number(value || 0)
    const pricePerUnit = Number(parseCurrencyToNumber(watch(`items.${index}.pricePerUnit`) || "0"))
    setValue(`items.${index}.quantity`, String(qty))
    setValue(`items.${index}.totalPrice`, formatCurrency(qty * pricePerUnit))
  }

  const handleRemoveItem = (index: number) => {
    remove(index)
    setInputValueProducts((prev) => prev.filter((_, i) => i !== index))
    // Update count of field items immediately after removal
    setValue("totalItem", Math.max(0, (fields?.length || 0) - 1))
  }

  const handleAddItem = () => {
    append({ productId: "", supplierId: "", quantity: "1", pricePerUnit: "0", totalPrice: "0" })
    setInputValueProducts((prev) => [...prev, ""])
    // Update count of field items immediately after addition
    setValue("totalItem", (fields?.length || 0) + 1)
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateReceiptBodyReq }) => ReceiptAPI.updateReceipt(id, body)
  })

  const handleSaveUpdates = handleSubmit((data) => {
    const body: UpdateReceiptBodyReq = {
      importDate: initialReceipt?.importDate || new Date().toISOString(),
      totalItem: Number(data.totalItem),
      totalAmount: Number(parseCurrencyToNumber(data.totalAmount)),
      items: data.items
        .filter((i) => i.productId && i.supplierId)
        .map((i) => ({
          productId: i.productId,
          supplierId: i.supplierId,
          quantity: Number(i.quantity || 0),
          pricePerUnit: Number(parseCurrencyToNumber(i.pricePerUnit || "0")),
          totalPrice: Number(parseCurrencyToNumber(i.totalPrice || "0"))
        })),
      note: data.note
    }

    updateMutation.mutate(
      { id: initialReceipt?._id || "", body },
      {
        onSuccess: () => {
          toast.success("Cập nhật phiếu nhập thành công", { autoClose: 1500 })
          queryClient.invalidateQueries({ queryKey: ["listReceipt"] })
        }
      }
    )
  })

  const statusInfo = (() => {
    const s = initialReceipt?.status || ""
    if (["DRAFT"].includes(s)) {
      return {
        label: "Phiếu nháp",
        className:
          "bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-200/20 dark:text-yellow-300 dark:border-yellow-600"
      }
    }
    if (["RECEIVED"].includes(s)) {
      return {
        label: "Đã nhận",
        className:
          "bg-green-100 text-green-700 border border-green-300 dark:bg-green-200/20 dark:text-green-300 dark:border-green-600"
      }
    }
    return {
      label: initialReceipt?.status || "Không xác định",
      className:
        "bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-200/20 dark:text-gray-300 dark:border-gray-600"
    }
  })()

  if (!initialReceipt) {
    return <div className="p-4">Không có dữ liệu phiếu nhập</div>
  }

  return (
    <div className="space-y-4">
      <Helmet>
        <title>Quản lý đơn nhập hàng</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <button
        onClick={() => {
          navigate(path.AdminReceipts)
          window.location.reload()
        }}
        className="flex items-center gap-[2px] cursor-pointer"
      >
        <ChevronLeft size={16} />
        <span className="text-[14px] font-medium">Trở lại</span>
      </button>
      <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
        Đơn nhập hàng
      </h1>

      <div className="flex items-center justify-between">
        <div className="text-base py-1 px-2 flex items-center gap-2 bg-[#e5e5e5] dark:bg-darkSecond border border-[#dadada] dark:border-darkBorder rounded-md">
          <span>Đơn nhập hàng:</span>
          <span className="font-semibold">#{initialReceipt._id}</span>
          <button onClick={() => handleCopyText(initialReceipt._id)} className="p-1 border rounded">
            {copiedId === initialReceipt._id ? (
              <ClipboardCheck color="#8d99ae" size={12} />
            ) : (
              <Copy color="#8d99ae" size={12} />
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 text-black dark:text-white">
          <span className={`px-2 py-1 rounded-md text-sm font-medium ${statusInfo.className}`}>{statusInfo.label}</span>
          <span>Ngày nhập:</span>
          <span className="font-semibold">{convertDateTime(initialReceipt.importDate)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 text-black dark:text-white">
          <span>Tổng số lượng:</span>
          <span className="text-red-500 font-semibold">{totalItemComputed}</span>
        </div>
        <div className="flex items-center gap-2 text-black dark:text-white justify-end">
          <span>Tổng giá trị:</span>
          <span className="text-red-500 font-semibold px-2 py-1 bg-red-100 rounded-md border border-red-500">
            {formatCurrency(totalAmountComputed)}đ
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold dark:text-white">Danh sách sản phẩm ({fields.length})</div>
        <div className="flex items-center gap-2">
          <Button
            classNameButton="p-2 px-3 bg-blue-500 text-white rounded-md flex items-center gap-1"
            nameButton="Thêm sản phẩm"
            onClick={handleAddItem}
          />
          <Button
            classNameButton="p-2 px-3 bg-green-600 text-white rounded-md"
            nameButton="Lưu cập nhật"
            onClick={handleSaveUpdates}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, margin: 0, padding: 0 }}
              transition={{ duration: 0.15 }}
              style={{ overflow: "hidden" }}
            >
              <div className="grid grid-cols-12 gap-4 p-3 rounded-lg border border-gray-300 bg-white/80 dark:bg-darkPrimary">
                <div className="col-span-12 md:col-span-4">
                  <div className="text-sm text-black dark:text-white">Tên sản phẩm</div>
                  <Select
                    className="w-full"
                    placeholder="Chọn sản phẩm"
                    value={watch(`items.${index}.productId`) || undefined}
                    onChange={(itemName) => {
                      setValue(`items.${index}.productId`, itemName)
                      setInputValueProducts((prev) => {
                        const arr = [...prev]
                        arr[index] = itemName as string
                        return arr
                      })
                      setValue(`items.${index}.supplierId`, "")
                    }}
                    options={listNameProductResult.map((name) => ({ label: name, value: name }))}
                  />
                </div>

                <div className="col-span-12 md:col-span-3">
                  <Input
                    name={`items.${index}.quantity`}
                    register={register}
                    nameInput="Số lượng"
                    classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                    className="relative flex-grow"
                    classNameLabel="block"
                    classNameError="hidden"
                    onChange={(e) => handleChangeQuantity(index, e.target.value)}
                  />
                  <div className="mt-2">
                    <Input
                      name={`items.${index}.pricePerUnit`}
                      register={register}
                      nameInput="Giá nhập (đ)"
                      classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                      className="relative flex-grow"
                      classNameLabel="block"
                      classNameError="hidden"
                      disabled
                    />
                  </div>
                </div>

                <div className="col-span-12 md:col-span-3">
                  <Input
                    name={`items.${index}.totalPrice`}
                    register={register}
                    nameInput="Giá tiền (đ)"
                    classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px] text-red-500 font-semibold"
                    className="relative flex-grow"
                    classNameLabel="block"
                    classNameError="hidden"
                    disabled
                  />
                  <div className="mt-2">
                    <div className="text-sm text-black dark:text-white mb-1">Nhà cung cấp</div>
                    <Select
                      className="w-full"
                      placeholder="Chọn nhà cung cấp"
                      value={watch(`items.${index}.supplierId`) || undefined}
                      onChange={(val) => setValue(`items.${index}.supplierId`, val)}
                      options={
                        (
                          getNameSuppliersBasedOnNameProduct[index]?.data?.data as SuccessResponse<{ result: string[] }>
                        )?.result?.result?.map((name) => ({ label: name, value: name })) || []
                      }
                    />
                  </div>
                </div>

                <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                  <Button
                    classNameButton="p-2 px-3 bg-red-500 text-white rounded-md"
                    nameButton="Xóa"
                    onClick={() => handleRemoveItem(index)}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="col-span-2 text-right">
          <span className="text-black dark:text-white">Ngày tạo: </span>
          <span className="font-semibold text-black dark:text-white">{convertDateTime(initialReceipt.created_at)}</span>
        </div>
        <div className="col-span-2">
          <Input
            name="note"
            register={register}
            nameInput="Ghi chú"
            classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
            className="relative flex-grow"
            classNameLabel="mb-1 block font-semibold"
            classNameError="hidden"
          />
        </div>
      </div>
    </div>
  )
}
