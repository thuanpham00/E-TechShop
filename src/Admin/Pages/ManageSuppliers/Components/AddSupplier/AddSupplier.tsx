/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { Fragment } from "react/jsx-runtime"
import { adminAPI } from "src/Apis/admin.api"
import { schemaSupplierUpdate, SchemaSupplierUpdateType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import { isError422 } from "src/Helpers/utils"
import { ErrorResponse } from "src/Types/utils.type"

interface Props {
  setAddItem: React.Dispatch<React.SetStateAction<boolean>>
}

type FormData = Pick<
  SchemaSupplierUpdateType,
  "name" | "contactName" | "email" | "phone" | "address" | "description" | "taxCode"
>

const formData = schemaSupplierUpdate.pick([
  "name",
  "contactName",
  "email",
  "phone",
  "address",
  "description",
  "taxCode"
])

export default function AddSupplier({ setAddItem }: Props) {
  const queryClient = useQueryClient()
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(formData) })

  const addCategoryMutation = useMutation({
    mutationFn: (body: {
      name: string
      contactName: string
      email: string
      phone: string
      address: string
      description: string
    }) => {
      return adminAPI.supplier.createSupplier(body)
    }
  })

  const handleAddSupplierSubmit = handleSubmit((data) => {
    addCategoryMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Thêm nhà cung cấp thành công", { autoClose: 1500 })
        setAddItem(false)
        queryClient.invalidateQueries({ queryKey: ["listSupplier"] }) // validate mọi trang liên quan -> sẽ gọi lại api
      },
      onError: (error) => {
        // lỗi từ server trả về
        if (isError422<ErrorResponse<FormData>>(error)) {
          const formError = error.response?.data.errors
          if (formError?.email)
            setError("email", {
              message: (formError.email as any).msg // lỗi 422 từ server trả về
            })
          if (formError?.taxCode) {
            setError("taxCode", {
              message: (formError.taxCode as any).msg // lỗi 422 từ server trả về
            })
          }
        }
      }
    })
  })

  return (
    <Fragment>
      <div className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60"></div>
      <div className="z-20 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <button onClick={() => setAddItem(false)} className="absolute right-2 top-1">
          <X color="gray" size={22} />
        </button>
        <form onSubmit={handleAddSupplierSubmit} className="bg-white dark:bg-darkPrimary rounded-md w-[900px]">
          <h3 className="py-2 px-4 text-[15px] font-medium bg-[#f2f2f2] rounded-md">Thông tin nhà cung cấp</h3>
          <div className="w-full h-[1px] bg-[#dadada]"></div>
          <div className="p-4 pt-0">
            <div className="mt-4 flex items-center gap-4">
              <Input
                name="name"
                register={register}
                placeholder="Nhập tên nhà cung cấp"
                messageErrorInput={errors.name?.message}
                classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                className="relative flex-1"
                nameInput="Tên nhà cung cấp"
              />
              <Input
                name="contactName"
                register={register}
                placeholder="Nhập họ tên"
                messageErrorInput={errors.contactName?.message}
                classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                className="relative flex-1"
                nameInput="Tên người đại diện"
              />
            </div>
            <div className="mt-4 flex items-center gap-4">
              <Input
                name="email"
                register={register}
                placeholder="Nhập email"
                messageErrorInput={errors.email?.message}
                classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                className="relative flex-1"
                nameInput="Email"
              />
              <Input
                name="phone"
                register={register}
                placeholder="Nhập số điện thoại"
                messageErrorInput={errors.phone?.message}
                classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                className="relative flex-1"
                nameInput="Số điện thoại"
              />
            </div>
            <div className="mt-4 flex items-center gap-4">
              <Input
                name="taxCode"
                register={register}
                placeholder="Nhập mã số thuế"
                messageErrorInput={errors.taxCode?.message}
                classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                className="relative flex-1"
                nameInput="Mã số thuế"
              />
              <Input
                name="address"
                register={register}
                placeholder="Nhập địa chỉ"
                messageErrorInput={errors.address?.message}
                classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                className="relative flex-1"
                nameInput="Địa chỉ"
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
