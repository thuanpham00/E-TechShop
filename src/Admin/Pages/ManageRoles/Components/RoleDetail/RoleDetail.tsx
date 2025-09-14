/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpFromLine, X } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { adminAPI } from "src/Apis/admin.api"
import { schemaRole, SchemaRoleType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import { convertDateTime } from "src/Helpers/common"

type FormData = Pick<SchemaRoleType, "_id" | "name" | "description" | "created_at" | "updated_at">
const formData = schemaRole.pick(["_id", "name", "description", "created_at", "updated_at"])

interface Props {
  setAddItem: React.Dispatch<any>
  dataItem: { name: string; description: string; _id: string; created_at: string; updated_at: string }
}

export default function RoleDetail({ setAddItem, dataItem }: Props) {
  const queryClient = useQueryClient()
  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit
  } = useForm<FormData>({
    resolver: yupResolver(formData),
    defaultValues: {
      _id: "",
      name: "",
      description: "",
      created_at: "",
      updated_at: ""
    } // giá trị khởi tạo
  })

  useEffect(() => {
    if (dataItem) {
      setValue("_id", dataItem._id)
      setValue("name", dataItem.name)
      setValue("description", dataItem.description)
      setValue("created_at", convertDateTime(dataItem.created_at))
      setValue("updated_at", convertDateTime(dataItem.updated_at))
    }
  }, [dataItem, setValue])

  const updateRoleMutation = useMutation({
    mutationFn: (body: { idRole: string; name: string; description: string }) => {
      return adminAPI.role.updateRole(body.idRole, { name: body.name, description: body.description })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listRole"] })
      setAddItem(null)
      toast.success("Cập nhật vai trò thành công", {
        autoClose: 1500
      })
    }
  })

  const handleSubmitUpdateRole = handleSubmit((data) => {
    updateRoleMutation.mutate({ idRole: dataItem._id, name: data.name, description: data.description })
  })

  return (
    <AnimatePresence>
      {dataItem && (
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
            <button onClick={() => setAddItem(null)} className="absolute right-2 top-2">
              <X color="gray" size={22} />
            </button>
            <form onSubmit={handleSubmitUpdateRole} className="bg-white dark:bg-darkPrimary rounded-md">
              <h3 className="py-2 px-4 text-lg font-semibold tracking-wide rounded-md text-black dark:text-white">
                Thông tin danh mục
              </h3>
              <div className="p-4 pt-0">
                <div className="mt-4 flex items-center gap-4">
                  <Input
                    name="_id"
                    register={register}
                    messageErrorInput={errors._id?.message}
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                    className="relative flex-1"
                    classNameLabel="text-black dark:text-white"
                    nameInput="Mã vai trò"
                    disabled
                  />
                  <Input
                    name="name"
                    register={register}
                    placeholder="Nhập tên vai trò"
                    messageErrorInput={errors.name?.message}
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                    className="relative flex-1"
                    classNameLabel="text-black dark:text-white"
                    nameInput="Tên vai trò"
                  />
                  <Input
                    name="description"
                    register={register}
                    placeholder="Nhập mô tả"
                    messageErrorInput={errors.description?.message}
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                    className="relative flex-1"
                    classNameLabel="text-black dark:text-white"
                    nameInput="Mô tả"
                  />
                </div>
                <div className="mt-2 flex items-center gap-4">
                  <Input
                    name="created_at"
                    register={register}
                    placeholder="Nhập ngày tạo"
                    messageErrorInput={errors.created_at?.message}
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                    className="relative flex-1"
                    classNameLabel="text-black dark:text-white"
                    nameInput="Ngày tạo"
                    disabled
                  />
                  <Input
                    name="updated_at"
                    register={register}
                    placeholder="Nhập ngày tạo"
                    messageErrorInput={errors.updated_at?.message}
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                    className="relative flex-1"
                    classNameLabel="text-black dark:text-white"
                    nameInput="Ngày cập nhật"
                    disabled
                  />
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    type="submit"
                    icon={<ArrowUpFromLine size={18} />}
                    nameButton="Cập nhật"
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
