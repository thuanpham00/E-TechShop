import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
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
  categoryId: string | undefined
}

type FormData = Pick<SchemaAuthType, "name">
const formData = schemaAuth.pick(["name"])

export default function AddBrand({ setAddItem, categoryId }: Props) {
  const queryClient = useQueryClient()
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(formData) })

  const addBrandMutation = useMutation({
    mutationFn: (body: { name: string; categoryId: string }) => {
      return adminAPI.category.createBrand({ name: body.name, categoryId: categoryId as string })
    }
  })

  const handleAddBrandSubmit = handleSubmit((data) =>
    addBrandMutation.mutate(
      { name: data.name, categoryId: categoryId as string },
      {
        onSuccess: () => {
          toast.success("Thêm thương hiệu thành công", { autoClose: 1500 })
          setAddItem(false)
          queryClient.invalidateQueries({ queryKey: ["listBrand"] }) // validate mọi trang liên quan -> sẽ gọi lại api
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
      }
    )
  )

  return (
    <AnimatePresence>
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
          <button onClick={() => setAddItem(false)} className="absolute right-2 top-1">
            <X color="gray" size={22} />
          </button>
          <form onSubmit={handleAddBrandSubmit} className="bg-white dark:bg-darkPrimary rounded-md">
            <h3 className="py-2 px-4 text-[15px] font-medium bg-[#f2f2f2] rounded-md">Thông tin thương hiệu</h3>
            <div className="w-full h-[1px] bg-[#dadada]"></div>
            <div className="p-4 pt-0">
              <div className="mt-4 flex items-center gap-4">
                <Input
                  name="name"
                  register={register}
                  placeholder="Nhập tên thương hiệu"
                  messageErrorInput={errors.name?.message}
                  classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                  className="relative flex-1"
                  nameInput="Tên thương hiệu"
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
