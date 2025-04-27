/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { Fragment } from "react/jsx-runtime"
import { adminAPI } from "src/Apis/admin.api"
import { schemaSupplyCreate, SchemaSupplyCreateType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import { SuccessResponse } from "src/Types/utils.type"

interface Props {
  setAddItem: React.Dispatch<React.SetStateAction<boolean>>
}

type FormData = Pick<
  SchemaSupplyCreateType,
  "productId" | "supplierId" | "importPrice" | "warrantyMonths" | "leadTimeDays" | "description"
>

const formData = schemaSupplyCreate.pick([
  "productId",
  "supplierId",
  "importPrice",
  "warrantyMonths",
  "leadTimeDays",
  "description"
])

export default function AddSupply({ setAddItem }: Props) {
  const queryClient = useQueryClient()
  const {
    handleSubmit,
    register,
    // setError,
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
      }
      // onError: (error) => {
      //   // lỗi từ server trả về
      //   if (isError422<ErrorResponse<FormData>>(error)) {
      //     const formError = error.response?.data.errors
      //     if (formError?.email)
      //       setError("email", {
      //         message: (formError.email as any).msg // lỗi 422 từ server trả về
      //       })
      //     if (formError?.taxCode) {
      //       setError("taxCode", {
      //         message: (formError.taxCode as any).msg // lỗi 422 từ server trả về
      //       })
      //     }
      //   }
      // }
    })
  })

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

  const getNameSuppliers = useQuery({
    queryKey: ["nameSupplier"],
    queryFn: () => {
      return adminAPI.supplier.getNameSuppliers()
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 15 * 60 * 1000, // dưới 1 phút nó không gọi lại api
    placeholderData: keepPreviousData // giữ data cũ trong 1p
  })

  const listNameSupplier = getNameSuppliers.data?.data as SuccessResponse<{
    result: string[]
  }>

  const listNameSupplierResult = listNameSupplier?.result.result

  const [activeField, setActiveField] = useState<"name_product" | "name_supplier" | null>(null) // check coi input nào đang focus
  const [inputValueProduct, setInputValueProduct] = useState("")
  const [inputValueSupplier, setInputValueSupplier] = useState("")
  const [filterList, setFilterList] = useState<string[]>([])
  const inputRef_1 = useRef<HTMLDivElement>(null)
  const inputRef_2 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = setTimeout(() => {
      if (activeField === "name_product") {
        const filtered = listNameProductResult?.filter((item) =>
          item.toLowerCase().includes(inputValueProduct.toLowerCase())
        )
        setFilterList(filtered || [])
      } else if (activeField === "name_supplier") {
        const filtered = listNameSupplierResult?.filter((item) =>
          item.toLowerCase().includes(inputValueSupplier.toLowerCase())
        )
        setFilterList(filtered || [])
      }
    })

    return () => clearTimeout(handler)
  }, [inputValueProduct, inputValueSupplier, activeField, listNameProductResult, listNameSupplierResult])

  useEffect(() => {
    const clickOutHideList = (event: MouseEvent) => {
      if (
        (inputRef_1.current && !inputRef_1.current.contains(event.target as Node)) ||
        (inputRef_2.current && !inputRef_2.current.contains(event.target as Node))
      ) {
        // nơi được click nằm ngoài vùng phần tử
        setActiveField(null)
        setFilterList([])
      }
    }

    document.addEventListener("mousedown", clickOutHideList)

    return () => document.removeEventListener("mousedown", clickOutHideList)
  }, [])

  const handleClickItemList = (item: string) => {
    if (activeField === "name_product") {
      setValue("productId", item)
      setInputValueProduct(item)
    } else if (activeField === "name_supplier") {
      setValue("supplierId", item)
      setInputValueSupplier(item)
    }
    setActiveField(null)
    setFilterList([])
  }

  return (
    <Fragment>
      <div className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60"></div>
      <div className="z-20 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <button onClick={() => setAddItem(false)} className="absolute right-2 top-1">
          <X color="gray" size={22} />
        </button>
        <form
          autoComplete="off"
          onSubmit={handleAddSupplySubmit}
          className="bg-white dark:bg-darkPrimary rounded-md w-[700px]"
        >
          <h3 className="py-2 px-4 text-[15px] font-medium bg-[#f2f2f2] rounded-md">Thông tin cung ứng</h3>
          <div className="w-full h-[1px] bg-[#dadada]"></div>
          <div className="p-4 pt-0">
            <div className="mt-4 bg-[#fff] dark:bg-darkBorder">
              <div className="relative h-full">
                <div className="mt-2 w-full flex items-center gap-2 relative">
                  <Input
                    name="productId"
                    register={register}
                    placeholder="Nhập tên sản phẩm"
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                    className="relative flex-grow"
                    classNameError="hidden"
                    nameInput="Chọn sản phẩm"
                    onFocus={() => setActiveField("name_product")}
                    onChange={(event) => setInputValueProduct(event.target.value)}
                  />
                  {activeField === "name_product" && filterList.length > 0 && (
                    <div
                      ref={inputRef_1}
                      className="absolute top-[58px] left-0 bg-[#fff] z-20 rounded-md w-full h-[250px] overflow-y-auto shadow-lg"
                    >
                      {filterList.map((item) => (
                        <button
                          key={item}
                          className="p-2 border border-[#dadada] w-full text-left text-[13px] first:rounded-tl-md first:rounded-tr-md last:rounded-bl-md last:rounded-br-md hover:bg-[#dadada] duration-200 border-b-0 last:border-b"
                          onClick={() => handleClickItemList(item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 bg-[#fff] dark:bg-darkBorder">
              <div className="relative h-full">
                <div className="mt-2 w-full flex items-center gap-2 relative">
                  <Input
                    name="supplierId"
                    register={register}
                    placeholder="Nhập tên nhà cung cấp"
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                    className="relative flex-grow"
                    classNameError="hidden"
                    nameInput="Chọn nhà cung cấp"
                    onFocus={() => setActiveField("name_supplier")}
                    onChange={(event) => setInputValueSupplier(event.target.value)}
                  />
                  {activeField === "name_supplier" && filterList.length > 0 && (
                    <div
                      ref={inputRef_2}
                      className="absolute top-[58px] left-0 bg-[#fff] z-20 rounded-md w-full h-[200px] overflow-y-auto shadow-lg"
                    >
                      {filterList.map((item) => (
                        <button
                          key={item}
                          className="p-2 border border-[#dadada] w-full text-left text-[13px] first:rounded-tl-md first:rounded-tr-md last:rounded-bl-md last:rounded-br-md hover:bg-[#dadada] duration-200 border-b-0"
                          onClick={() => handleClickItemList(item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
            </div>
            <div className="mt-4 flex items-center gap-4">
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
                nameButton="Thêm"
                classNameButton="w-[120px] p-4 py-2 bg-blue-500 mt-2 w-full text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
              />
            </div>
          </div>
        </form>
      </div>
    </Fragment>
  )
}
