import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { motion } from "framer-motion"
import { useContext, useEffect, useState } from "react"
import Input from "src/Components/Input"
import { schemaAddReceipt, SchemaAddReceiptType } from "src/Client/Utils/rule"
import { useFieldArray, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { convertDateTime, formatCurrency, parseCurrencyToNumber } from "src/Helpers/common"
import DropdownList from "../ManageSupplies/Components/DropdownList"
import { keepPreviousData, useMutation, useQueries, useQuery } from "@tanstack/react-query"
import { SuccessResponse } from "src/Types/utils.type"
import Button from "src/Components/Button"
import { toast } from "react-toastify"
import { CreateReceiptBodyReq } from "src/Types/product.type"
import { ProductAPI } from "src/Apis/admin/product.api"
import { SupplierAPI } from "src/Apis/admin/supplier.api"
import { ReceiptAPI } from "src/Apis/admin/receipt.api"
import { AppContext } from "src/Context/authContext"
import { useCheckPermission } from "src/Hook/useRolePermissions"

type FormData = Pick<SchemaAddReceiptType, "importDate" | "totalItem" | "totalAmount" | "items">

const formData = schemaAddReceipt.pick(["importDate", "totalItem", "totalAmount", "items"])

export default function AddReceipt() {
  const { permissions } = useContext(AppContext)
  const { hasPermission } = useCheckPermission(permissions)

  const [quantityProduct, setQuantityProduct] = useState("1")

  // xử lý form
  const {
    control,
    register,
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(formData),
    defaultValues: {
      totalItem: 1,
      totalAmount: "0",
      importDate: "",
      items: []
    }
  })

  const { fields, replace } = useFieldArray({
    control, // Liên kết với form.
    name: "items" // Quản lý trường items trong form.
  })

  useEffect(() => {
    setValue("importDate", convertDateTime(new Date().toISOString()))
  }, [setValue])

  useEffect(() => {
    const newLength = Number(quantityProduct) // ban đầu là 2

    const newItems = Array.from({ length: newLength }, () => ({
      supplierId: "",
      productId: "",
      quantity: "1",
      pricePerUnit: "0",
      totalPrice: "0"
    }))
    replace(newItems)

    setInputValueProducts(Array(newLength).fill(""))
  }, [quantityProduct, replace])

  const [inputValueProducts, setInputValueProducts] = useState<string[]>([])

  const getNameProducts = useQuery({
    queryKey: ["nameProductReceipt"],
    queryFn: () => {
      return ProductAPI.getNameProducts()
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 15 * 60 * 1000, // dưới 1 phút nó không gọi lại api
    placeholderData: keepPreviousData // giữ data cũ trong 1p
  })

  const listNameProduct = getNameProducts.data?.data as SuccessResponse<{
    result: string[]
  }>

  const listNameProductResult = listNameProduct?.result.result

  const getNameSuppliersBasedOnNameProduct = useQueries({
    queries: inputValueProducts.map((productName, index) => ({
      queryKey: ["nameSupplierBasedOnNameProductReceipt", `${productName}-${index}`],
      queryFn: () => {
        return SupplierAPI.getNameSuppliersLinkedToProduct(productName)
      },
      enabled: !!productName
    }))
  })

  const pricePerUnitQueries = useQueries({
    queries: fields.map((_, index) => ({
      queryKey: ["pricePerUnit", inputValueProducts[index], watch(`items.${index}.supplierId`)],
      queryFn: () => {
        return ReceiptAPI.getPricePerUnitBasedOnProductAndSupplier({
          name_product: inputValueProducts[index],
          name_supplier: watch(`items.${index}.supplierId`)
        })
      },
      enabled: !!inputValueProducts[index] && !!watch(`items.${index}.supplierId`)
    }))
  })

  useEffect(() => {
    let total = 0
    fields.map((_, index) => {
      const quantity = watch(`items.${index}.quantity`)
      const pricePerUnit = pricePerUnitQueries[index].data?.data?.result?.result.importPrice
      total = total + Number(quantity || 0) * Number(pricePerUnit || 0)
      setValue("totalAmount", formatCurrency(total))
      if (pricePerUnit) {
        setValue(`items.${index}.pricePerUnit`, formatCurrency(pricePerUnit))
      } else {
        setValue(`items.${index}.pricePerUnit`, "0")
      }
      setValue(`items.${index}.totalPrice`, formatCurrency(Number(quantity || 0) * Number(pricePerUnit || 0)))
    })
  }, [fields, setValue, pricePerUnitQueries, watch])

  const AddReceiptMutation = useMutation({
    mutationFn: (data: CreateReceiptBodyReq) => {
      return ReceiptAPI.createReceipt(data)
    }
  })

  const handleSubmitAddReceipt = handleSubmit((data) => {
    const body: CreateReceiptBodyReq = {
      importDate: data.importDate,
      totalItem: Number(data.totalItem),
      totalAmount: Number(parseCurrencyToNumber(data.totalAmount as string)),
      items: data.items.map((item) => ({
        productId: item.productId,
        supplierId: item.supplierId,
        quantity: Number(item.quantity),
        pricePerUnit: Number(parseCurrencyToNumber(item.pricePerUnit)),
        totalPrice: Number(parseCurrencyToNumber(item.totalPrice))
      }))
    }
    AddReceiptMutation.mutate(body, {
      onSuccess: () => {
        toast.success("Thêm đơn nhập hàng thành công!", {
          autoClose: 1500
        })
        reset()
        setQuantityProduct("1")
      }
    })
  })

  return (
    <div>
      <Helmet>
        <title>Quản lý đơn nhập hàng</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />
      <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
        Thêm đơn nhập hàng
      </h1>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmitAddReceipt} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <Input
                name="importDate"
                register={register}
                nameInput="Ngày nhập hàng"
                classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                className="relative flex-grow"
                classNameLabel="font-semibold mb-1 block"
                classNameError="hidden"
                disabled
              />
            </div>
            <div className="col-span-1">
              <Input
                name="totalItem"
                register={register}
                nameInput="Số lượng sản phẩm"
                classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                className="relative flex-grow"
                classNameLabel="font-semibold mb-1 block"
                classNameError="hidden"
                onChange={(event) => {
                  setQuantityProduct(event.target.value)
                  setValue("totalItem", Number(event.target.value))
                }}
                value={quantityProduct}
              />
            </div>
            <div className="col-span-1">
              <Input
                name="totalAmount"
                register={register}
                nameInput="Tổng thành tiền (đ)"
                classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px] text-base text-red-500 font-semibold"
                className="relative flex-grow"
                classNameLabel="font-semibold mb-1 block text-base text-red-500"
                classNameError="hidden"
                disabled
              />
            </div>
          </div>
          <div>
            <h2 className="mt-4 text-base font-medium mb-2">Danh sách thông tin sản phẩm</h2>
            <div className="grid grid-cols-1 gap-4">
              {fields.map((field, index) => {
                const listNameSupplier = getNameSuppliersBasedOnNameProduct[index]?.data?.data as SuccessResponse<{
                  result: string[]
                }>
                const listNameSupplierResult = listNameSupplier?.result.result

                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="p-4 bg-white dark:bg-darkPrimary rounded-md mb-2 shadow-md">
                      <span className="tracking-wide text-[15px] font-semibold p-1 px-3 mb-2 inline-block bg-blue-200 rounded-md text-white dark:text-black">
                        {index + 1}
                      </span>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                          <DropdownList
                            name={`items.${index}.productId`}
                            isAddItem={true}
                            register={register}
                            listItem={listNameProductResult}
                            onSelect={(item) => {
                              setValue(`items.${index}.productId`, item)
                              setInputValueProducts((prev) => {
                                const newArr = [...prev]
                                newArr[index] = item
                                return newArr
                              })
                            }}
                            index={index}
                            nameInput="Chọn sản phẩm"
                            setInputValueProductCPNFather_2={(e, idx) => {
                              setInputValueProducts((prev) => {
                                const newArr = [...prev]
                                newArr[idx] = e
                                return newArr
                              })
                            }}
                            classNameWrapper="relative w-full"
                          />
                          <span className="text-red-500 text-[13px] font-semibold min-h-[1.25rem] block">
                            {errors.items?.[index]?.productId?.message}
                          </span>
                        </div>
                        <div className="col-span-1">
                          <DropdownList
                            name={`items.${index}.supplierId`}
                            isAddItem={true}
                            register={register}
                            listItem={listNameSupplierResult}
                            onSelect={(item) => setValue(`items.${index}.supplierId`, item)}
                            nameInput="Chọn nhà cung cấp"
                            classNameWrapper="relative w-full"
                          />
                          <span className="text-red-500 text-[13px] font-semibold min-h-[1.25rem] block">
                            {errors.items?.[index]?.supplierId?.message}
                          </span>
                        </div>
                        <Input
                          name={`items.${index}.pricePerUnit`}
                          register={register}
                          nameInput="Giá nhập (đ)"
                          classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                          className="relative flex-grow"
                          classNameLabel="font-semibold mb-1 block"
                          classNameError="hidden"
                          disabled
                        />
                        <Input
                          name={`items.${index}.quantity`}
                          register={register}
                          nameInput="Số lượng"
                          classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                          className="relative flex-grow"
                          classNameLabel="font-semibold mb-1 block"
                          classNameError="hidden"
                        />
                        <Input
                          name={`items.${index}.totalPrice`}
                          register={register}
                          nameInput="Giá tiền (đ)"
                          classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px] text-red-500 font-semibold"
                          className="relative flex-grow"
                          classNameLabel="font-semibold mb-1 block"
                          classNameError="hidden"
                          disabled
                        />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                disabled={!hasPermission("receipt:create")}
                classNameButton="mt-1 p-2 px-3 bg-red-500 text-white font-semibold rounded-sm hover:bg-red-500/80 duration-200 disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed"
                nameButton="Xóa"
                type="submit"
              />
              <Button
                disabled={!hasPermission("receipt:create")}
                classNameButton="mt-1 p-2 px-3 bg-blue-500 text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200 disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed"
                nameButton="Thêm đơn nhập hàng"
                type="submit"
              />
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
