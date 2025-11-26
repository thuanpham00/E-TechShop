/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, X } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import { isError400 } from "src/Helpers/utils"
import { ErrorResponse, MessageResponse } from "src/Types/utils.type"
import { motion, AnimatePresence } from "framer-motion"
import { Select } from "antd"
import { CategoryAPI } from "src/Apis/admin/category.api"

interface Props {
  setAddItem: React.Dispatch<any>
  addItem: any
}

type FormData = Pick<SchemaAuthType, "name"> & { is_active?: "active" | "inactive"; desc?: string } // type form
const formData = schemaAuth.pick(["name"]) // validation form

export default function AddCategory({ setAddItem, addItem }: Props) {
  const queryClient = useQueryClient()
  const {
    handleSubmit,
    register,
    setError,
    control,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(formData),
    defaultValues: {
      is_active: "active"
    }
  })

  const addCategoryMutation = useMutation({
    mutationFn: (body: { name: string; is_active: boolean; desc: string }) => {
      return CategoryAPI.createCategory({ name: body.name, is_active: body.is_active, desc: body.desc })
    }
  })

  const handleAddCategorySubmit = handleSubmit((data) => {
    const payload = {
      name: data.name,
      is_active: data.is_active === "active" ? true : false,
      desc: data.desc || ""
    }
    addCategoryMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Thêm danh mục thành công", { autoClose: 1500 })
        setAddItem(null)
        reset()
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
  })

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
            <button
              onClick={() => {
                setAddItem(null)
                reset()
              }}
              className="absolute right-2 top-2"
            >
              <X color="gray" size={22} />
            </button>
            <form onSubmit={handleAddCategorySubmit} className="bg-white dark:bg-darkPrimary rounded-md">
              <h3 className="py-2 px-4 text-lg font-semibold tracking-wide rounded-md text-black dark:text-white">
                Thông tin danh mục
              </h3>
              <div className="p-4 pt-0 w-[500px]">
                <div className="w-full">
                  <Input
                    name="name"
                    register={register}
                    placeholder="Nhập tên danh mục"
                    messageErrorInput={errors.name?.message}
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                    className="relative flex-1"
                    classNameLabel="text-black dark:text-white"
                    nameInput="Tên danh mục"
                  />
                </div>
                <div className="w-full">
                  <Input
                    name="desc"
                    register={register}
                    placeholder="Nhập mô tả"
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                    className="relative flex-1"
                    classNameLabel="text-black dark:text-white"
                    nameInput="Mô tả (nếu có)"
                  />
                </div>
                <div className="w-full">
                  <div className="text-black dark:text-white block mb-1">Trạng thái</div>
                  <Controller
                    control={control}
                    name="is_active"
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        className="mt-1 w-full"
                        options={[
                          { label: "Hiển thị", value: "active" },
                          { label: "Tắt", value: "inactive" }
                        ]}
                      />
                    )}
                  />
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    type="submit"
                    icon={<Plus size={18} />}
                    nameButton="Thêm"
                    classNameButton="w-[120px] px-3 py-2 bg-blue-500 mt-2 w-full text-white font-semibold rounded-md hover:bg-blue-500/80 duration-200 flex items-center gap-1 text-[13px]"
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
