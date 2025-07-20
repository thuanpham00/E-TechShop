import { yupResolver } from "@hookform/resolvers/yup"
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { ArrowUpFromLine, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { adminAPI } from "src/Apis/admin.api"
import { schemaSupplyUpdate, SchemaSupplyUpdateType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import { convertDateTime } from "src/Helpers/common"
import { queryClient } from "src/main"
import { SupplyItemType, UpdateSupplyBodyReq } from "src/Types/product.type"
import { queryParamConfigSupply } from "src/Types/queryParams.type"
import { SuccessResponse } from "src/Types/utils.type"
import DropdownList from "../DropdownList"
import { AnimatePresence, motion } from "framer-motion"

type FormDataUpdate = Pick<
  SchemaSupplyUpdateType,
  | "id"
  | "productId"
  | "supplierId"
  | "importPrice"
  | "warrantyMonths"
  | "leadTimeDays"
  | "description"
  | "created_at"
  | "updated_at"
>

const formDataUpdate = schemaSupplyUpdate.pick([
  "id",
  "productId",
  "supplierId",
  "importPrice",
  "warrantyMonths",
  "leadTimeDays",
  "description",
  "created_at",
  "updated_at"
])

export default function SupplyDetail({
  idSupply,
  setIdSupply,
  queryConfig
}: {
  idSupply: string | null
  setIdSupply: React.Dispatch<React.SetStateAction<string | null>>
  queryConfig: queryParamConfigSupply
}) {
  const [inputValueProduct, setInputValueProduct] = useState("")

  const getInfoSupply = useQuery({
    queryKey: ["supplier", idSupply],
    queryFn: () => {
      return adminAPI.supply.getSupplyDetail(idSupply as string)
    },
    enabled: Boolean(idSupply) // chỉ chạy khi idCustomer có giá trị
  })

  const infoCategory = getInfoSupply.data?.data as SuccessResponse<{ result: SupplyItemType[] }>
  const profile = infoCategory?.result?.result[0]

  const {
    register,
    formState: { errors },
    setValue,
    // setError,
    handleSubmit,
    watch
  } = useForm<FormDataUpdate>({
    resolver: yupResolver(formDataUpdate),
    defaultValues: {
      id: "",
      productId: "",
      supplierId: "",
      importPrice: 0,
      warrantyMonths: 0,
      leadTimeDays: 0,
      description: ""
    } // giá trị khởi tạo
  })

  useEffect(() => {
    if (profile) {
      setValue("id", profile._id)
      setValue("productId", profile.productId[0].name)
      setValue("supplierId", profile.supplierId[0].name)
      setValue("importPrice", profile.importPrice)
      setValue("warrantyMonths", profile.warrantyMonths)
      setValue("leadTimeDays", profile.leadTimeDays)
      setValue("description", profile.description as string)
      setValue("created_at", convertDateTime(profile.created_at))
      setValue("updated_at", convertDateTime(profile.updated_at))
    }
  }, [profile, setValue])

  const updateCategoryMutation = useMutation({
    mutationFn: (body: { id: string; body: UpdateSupplyBodyReq }) => {
      return adminAPI.supply.updateSupplyDetail(body.id, body.body)
    }
  })

  const handleSubmitUpdate = handleSubmit((data) => {
    updateCategoryMutation.mutate(
      { id: idSupply as string, body: data },
      {
        onSuccess: () => {
          setIdSupply(null)
          toast.success("Cập nhật thành công", { autoClose: 1500 })
          queryClient.invalidateQueries({ queryKey: ["listSupply", queryConfig] })
        }
      }
    )
  })

  const handleExitsEditItem = () => {
    setIdSupply(null)
  }

  const getNameProducts = useQuery({
    queryKey: ["nameProduct"],
    queryFn: () => {
      return adminAPI.product.getNameProducts()
    },
    retry: 0,
    staleTime: 15 * 60 * 1000,
    placeholderData: keepPreviousData
  })
  const listNameProduct = getNameProducts.data?.data as SuccessResponse<{
    result: string[]
  }>
  const listNameProductResult = listNameProduct?.result.result

  const getNameSuppliersBasedOnNameProduct = useQuery({
    queryKey: ["nameSupplierBasedOnNameProduct", profile?.productId[0]?.name],
    queryFn: () => {
      return adminAPI.supplier.getNameSuppliersNotLinkedToProduct(profile?.productId[0]?.name || inputValueProduct)
    },
    retry: 0,
    placeholderData: keepPreviousData,
    enabled: !!profile?.productId[0]?.name
  })
  const listNameSupplierFilter = getNameSuppliersBasedOnNameProduct.data?.data as SuccessResponse<{
    result: string[]
  }>
  const listNameSupplierFilterResult = listNameSupplierFilter?.result.result

  const watchProduct = watch("productId")
  const watchSupplier = watch("supplierId")

  return (
    <AnimatePresence>
      {idSupply !== null && (
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
            <button onClick={handleExitsEditItem} className="absolute right-2 top-2">
              <X color="gray" size={22} />
            </button>
            <form onSubmit={handleSubmitUpdate} className="bg-white dark:bg-darkPrimary rounded-md w-[700px]">
              <h3 className="py-2 px-4 text-lg font-semibold tracking-wide rounded-md">Thông tin cung ứng</h3>
              <div className="p-4 pt-0">
                <div className="mt-4 bg-[#fff] dark:bg-darkBorder">
                  <Input
                    name="id"
                    register={register}
                    placeholder="Nhập mã cung ứng"
                    messageErrorInput={errors.importPrice?.message}
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                    className="relative flex-1"
                    nameInput="Mã cung ứng"
                    disabled
                  />
                  <DropdownList
                    name="productId"
                    isAddItem={true}
                    register={register}
                    listItem={listNameProductResult}
                    onSelect={(item) => setValue("productId", item)}
                    nameInput="Chọn sản phẩm"
                    value={watchProduct}
                    setInputValueProductCPNFather={setInputValueProduct}
                  />
                </div>

                <div className="mt-4 bg-[#fff] dark:bg-darkBorder">
                  <DropdownList
                    name="supplierId"
                    isAddItem={true}
                    register={register}
                    listItem={listNameSupplierFilterResult}
                    onSelect={(item) => setValue("supplierId", item)}
                    nameInput="Chọn nhà cung cấp"
                    value={watchSupplier}
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
                    name="warrantyMonths"
                    register={register}
                    placeholder="Nhập thời gian bảo hành"
                    messageErrorInput={errors.warrantyMonths?.message}
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                    className="relative flex-1"
                    nameInput="Thời gian bảo hành"
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
                <div className="mt-2 flex items-center gap-4">
                  <Input
                    name="created_at"
                    register={register}
                    placeholder="Nhập ngày tạo"
                    messageErrorInput={errors.created_at?.message}
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                    className="relative flex-1"
                    nameInput="Ngày tạo"
                    disabled
                  />
                  <Input
                    name="updated_at"
                    register={register}
                    placeholder="Nhập ngày tạo cập nhật"
                    messageErrorInput={errors.updated_at?.message}
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                    className="relative flex-1"
                    nameInput="Ngày cập nhật"
                    disabled
                  />
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    type="submit"
                    nameButton="Cập nhật"
                    icon={<ArrowUpFromLine size={18} />}
                    classNameButton="w-[120px] p-4 py-2 bg-blue-500 mt-2 w-full text-white font-semibold rounded-3xl hover:bg-blue-500/80 duration-200 flex items-center gap-1"
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
