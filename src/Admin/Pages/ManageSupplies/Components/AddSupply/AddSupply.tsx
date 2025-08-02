/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { adminAPI } from "src/Apis/admin.api"
import { schemaSupplyUpdate, SchemaSupplyUpdateType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import { isError422 } from "src/Helpers/utils"
import { ErrorResponse, SuccessResponse } from "src/Types/utils.type"
import DropdownList from "../DropdownList"
import { AnimatePresence, motion } from "framer-motion"
import { formatCurrency } from "src/Helpers/common"

interface Props {
  setAddItem: React.Dispatch<React.SetStateAction<boolean>>
  addItem: boolean
}

type FormData = Pick<
  SchemaSupplyUpdateType,
  "productId" | "supplierId" | "importPrice" | "warrantyMonths" | "leadTimeDays" | "description"
>

const formData = schemaSupplyUpdate.pick([
  "productId",
  "supplierId",
  "importPrice",
  "warrantyMonths",
  "leadTimeDays",
  "description"
])

export default function AddSupply({ setAddItem, addItem }: Props) {
  const queryClient = useQueryClient()
  const {
    handleSubmit,
    register,
    setError,
    setValue,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(formData) })

  const addSupplyMutation = useMutation({
    mutationFn: (body: {
      productId: string
      supplierId: string
      importPrice: number
      warrantyMonths: number
      leadTimeDays: number
      description: string
    }) => {
      return adminAPI.supply.createSupply(body)
    }
  })

  const handleAddSupplySubmit = handleSubmit((data) => {
    addSupplyMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Thêm liên kết cung ứng thành công", { autoClose: 1500 })
        setAddItem(false)
        queryClient.invalidateQueries({ queryKey: ["listSupply"] }) // validate mọi trang liên quan -> sẽ gọi lại api
      },
      onError: (error) => {
        // lỗi từ server trả về
        if (isError422<ErrorResponse<FormData>>(error)) {
          const formError = error.response?.data.errors
          if (formError?.importPrice)
            setError("importPrice", {
              message: (formError.importPrice as any).msg // lỗi 422 từ server trả về
            })
        }
      }
    })
  })

  const [inputValueProduct, setInputValueProduct] = useState("")

  const getNameProducts = useQuery({
    queryKey: ["nameProduct"],
    queryFn: () => {
      return adminAPI.product.getNameProducts()
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 15 * 60 * 1000, // dưới 1 phút nó không gọi lại api
    placeholderData: keepPreviousData // giữ data cũ trong 1p
  })

  const listNameProduct = getNameProducts.data?.data as SuccessResponse<{
    result: string[]
  }>
  const listNameProductResult = listNameProduct?.result.result

  const getNameSuppliersBasedOnNameProduct = useQuery({
    queryKey: ["nameSupplierBasedOnNameProduct", inputValueProduct],
    queryFn: () => {
      return adminAPI.supplier.getNameSuppliersNotLinkedToProduct(inputValueProduct)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    enabled: !!inputValueProduct // nó chỉ chạy khi có inputValueProduct
  })

  const listNameSupplier = getNameSuppliersBasedOnNameProduct.data?.data as SuccessResponse<{
    result: string[]
  }>
  const listNameSupplierResult = listNameSupplier?.result.result

  const getPriceProductSelected = useQuery({
    queryKey: ["priceProductSelected", inputValueProduct],
    queryFn: () => {
      return adminAPI.supply.getPriceSellProduct({ name: inputValueProduct })
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    enabled: !!inputValueProduct // nó chỉ chạy khi có inputValueProduct
  })
  const sellPriceValue = getPriceProductSelected.data?.data?.result

  return (
    <AnimatePresence>
      {addItem === true && (
        <motion.div
          initial={{ opacity: 0 }} // khởi tạo là 0
          animate={{ opacity: 1 }} // xuất hiện dần là 1
          exit={{ opacity: 0 }} // biến mất là 0
          className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative"
          >
            <button onClick={() => setAddItem(false)} className="absolute right-2 top-2">
              <X color="gray" size={22} />
            </button>
            <form
              autoComplete="off"
              onSubmit={handleAddSupplySubmit}
              className="bg-white dark:bg-darkPrimary rounded-md w-[700px]"
            >
              <h3 className="py-2 px-4 text-lg font-semibold tracking-wide rounded-md">Thông tin cung ứng</h3>
              <div className="p-4 pt-0">
                <div className="mt-4 bg-[#fff] dark:bg-darkBorder">
                  <DropdownList
                    name="productId"
                    isAddItem={true}
                    register={register}
                    listItem={listNameProductResult}
                    onSelect={(item) => setValue("productId", item)}
                    nameInput="Chọn sản phẩm"
                    setInputValueProductCPNFather={(e) => setInputValueProduct(e)}
                  />
                </div>
                <div className="mt-4 bg-[#fff] dark:bg-darkBorder">
                  <DropdownList
                    name="supplierId"
                    isAddItem={true}
                    register={register}
                    listItem={listNameSupplierResult}
                    onSelect={(item) => setValue("supplierId", item)}
                    nameInput="Chọn nhà cung cấp"
                  />
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <Input
                    name="importPrice"
                    register={register}
                    placeholder="Nhập giá nhập"
                    messageErrorInput={errors.importPrice?.message}
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                    className="relative flex-1"
                    nameInput="Giá nhập"
                  />
                  <Input
                    name="sellPrice"
                    value={formatCurrency(Number(sellPriceValue) || 0)}
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                    className="relative flex-1"
                    nameInput="Giá bán hiện tại"
                    readOnly
                  />
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <Input
                    name="importPrice"
                    register={register}
                    placeholder="Nhập giá nhập"
                    messageErrorInput={errors.importPrice?.message}
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                    className="relative flex-1"
                    nameInput="Giá nhập"
                  />
                  <Input
                    name="leadTimeDays"
                    register={register}
                    placeholder="Nhập thời gian cung ứng"
                    messageErrorInput={errors.leadTimeDays?.message}
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                    className="relative flex-1"
                    nameInput="Thời gian cung ứng"
                  />
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <Input
                    name="description"
                    register={register}
                    placeholder="Nhập mô tả"
                    messageErrorInput={errors.description?.message}
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                    className="relative flex-1"
                    nameInput="Ghi chú (Optional)"
                  />
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    type="submit"
                    icon={<Plus size={18} />}
                    nameButton="Thêm"
                    classNameButton="w-[120px] px-4 py-2 bg-blue-500 mt-2 w-full text-white font-semibold rounded-3xl hover:bg-blue-500/80 duration-200 flex items-center gap-1"
                  />
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
