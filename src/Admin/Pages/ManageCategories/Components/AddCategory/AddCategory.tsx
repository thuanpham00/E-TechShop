import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"
import { Fragment } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { adminAPI } from "src/Apis/admin.api"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import { isError400 } from "src/Helpers/utils"
import { ErrorResponse, MessageResponse } from "src/Types/utils.type"

interface Props {
  setAddItem: React.Dispatch<React.SetStateAction<boolean>>
}

type FormData = Pick<SchemaAuthType, "name">
const formData = schemaAuth.pick(["name"])

export default function AddCategory({ setAddItem }: Props) {
  const queryClient = useQueryClient()
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(formData) })

  const addCategoryMutation = useMutation({
    mutationFn: (body: { name: string }) => {
      return adminAPI.category.createCategory({ name: body.name })
    }
  })

  const handleAddCategorySubmit = handleSubmit((data) =>
    addCategoryMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Thêm danh mục thành công", { autoClose: 1500 })
        setAddItem(false)
        queryClient.invalidateQueries({ queryKey: ["listCategory"] }) // validate mọi trang liên quan -> sẽ gọi lại api
      },
      onError: (error) => {
        if (isError400<ErrorResponse<MessageResponse>>(error)) {
          const msg = error.response?.data as ErrorResponse<{ message: string }>
          const msg2 = msg.message
          setError("name", {
            message: msg2
          })
        }
      }
    })
  )

  return (
    <Fragment>
      <div className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60"></div>
      <div className="z-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <button onClick={() => setAddItem(false)} className="absolute right-2 top-1">
          <X color="gray" size={22} />
        </button>
        <form onSubmit={handleAddCategorySubmit} className="bg-white dark:bg-darkPrimary rounded-md">
          <h3 className="py-2 px-4 text-[15px] font-medium bg-[#f2f2f2] rounded-md">Thông tin danh mục</h3>
          <div className="w-full h-[1px] bg-[#dadada]"></div>
          <div className="p-4 pt-0">
            <div className="mt-4 flex items-center gap-4">
              <Input
                name="name"
                register={register}
                placeholder="Nhập tên danh mục"
                messageErrorInput={errors.name?.message}
                classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                className="relative flex-1"
                nameInput="Tên danh mục"
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
