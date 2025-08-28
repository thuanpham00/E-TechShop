import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { Plus, X } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { adminAPI } from "src/Apis/admin.api"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import DateSelect from "src/Components/DateSelect"
import Input from "src/Components/Input"
import InputFileImage from "src/Components/InputFileImage"
import { CreateCustomerBodyReq } from "src/Types/product.type"
import avatarDefault from "src/Assets/img/avatarDefault.png"
import { MediaAPI } from "src/Apis/media.api"
import { ObjectId } from "bson"
import { isError422 } from "src/Helpers/utils"
import { ErrorResponse } from "src/Types/utils.type"
import { roles } from "src/Helpers/role_permission"

interface Props {
  setAddItem: React.Dispatch<React.SetStateAction<boolean>>
  addItem: boolean
}

const formDataAdd = schemaAuth.pick([
  "name",
  "email",
  "phone",
  "date_of_birth",
  "avatar",
  "password",
  "confirm_password",
  "id",
  "role"
])

type FormDataAdd = Pick<
  SchemaAuthType,
  "name" | "email" | "phone" | "date_of_birth" | "avatar" | "password" | "confirm_password" | "id" | "role"
>

export default function AddStaff({ setAddItem, addItem }: Props) {
  const queryClient = useQueryClient()
  const {
    handleSubmit,
    register,
    control,
    watch,
    setError,
    setValue,
    formState: { errors }
  } = useForm<FormDataAdd>({ resolver: yupResolver(formDataAdd) })

  const addCustomerMutation = useMutation({
    mutationFn: (body: CreateCustomerBodyReq) => {
      return adminAPI.customer.createCustomer(body)
    }
  })

  const updateImageProfileMutation = useMutation({
    mutationFn: (body: { file: File; userId: string }) => {
      return MediaAPI.uploadImageProfile(body.file, body.userId)
    }
  })

  const [file, setFile] = useState<File>()

  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : ""
  }, [file])

  const handleChangeImage = (file?: File) => {
    setFile(file)
  }

  useEffect(() => {
    setValue("avatar", avatarDefault)
  }, [setValue])

  const avatarWatch = watch("avatar")
  const date_of_birth = watch("date_of_birth")

  const handleAddCustomerSubmit = handleSubmit(async (data) => {
    const idUser = new ObjectId().toHexString() // Trả về string như "665e0bcb9142f3e54365e1ef"

    let avatarName = avatarDefault
    if (file) {
      const avatar = await updateImageProfileMutation.mutateAsync({
        file: file as File,
        userId: idUser as string
      })
      avatarName = avatar.data.result.url
    }
    const body: CreateCustomerBodyReq = {
      name: data.name,
      email: data.email,
      password: data.password,
      confirm_password: data.confirm_password,
      phone: data.phone,
      date_of_birth: data.date_of_birth as Date,
      avatar: avatarName,
      id: idUser.toString(),
      role: roles.CUSTOMER
    }
    addCustomerMutation.mutate(body, {
      onSuccess: () => {
        toast.success("Thêm người dùng thành công", { autoClose: 1500 })
        setAddItem(false)
        queryClient.invalidateQueries({ queryKey: ["listCustomer"] }) // validate mọi trang liên quan -> sẽ gọi lại api
      },
      onError: (error) => {
        if (isError422<ErrorResponse<FormDataAdd>>(error)) {
          const formError = error.response?.data.errors
          if (formError?.email) {
            setError("email", {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              message: (formError.email as any).msg
            })
          }
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
            <button onClick={() => setAddItem(false)} className="absolute right-2 top-2">
              <X color="gray" size={22} />
            </button>
            <form onSubmit={handleAddCustomerSubmit} className="bg-white dark:bg-darkPrimary rounded-xl w-[900px]">
              <h3 className="py-2 px-4 text-lg font-semibold tracking-wide rounded-md text-black dark:text-white">
                Thông tin nhân viên
              </h3>
              <div className="p-4 pt-0">
                <h2 className="text-black dark:text-white">Thông tin cơ bản</h2>
                <div className="mt-2 flex justify-between">
                  <div className="grid grid-cols-12 flex-wrap gap-4 w-2/3">
                    <div className="col-span-6">
                      <Input
                        name="name"
                        register={register}
                        placeholder="Nhập họ tên"
                        messageErrorInput={errors.name?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                        className="relative flex-1"
                        classNameLabel="text-black dark:text-white"
                        nameInput="Họ tên"
                      />
                    </div>
                    <div className="col-span-6">
                      <Input
                        name="email"
                        register={register}
                        placeholder="Nhập email"
                        messageErrorInput={errors.email?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                        className="relative flex-1"
                        classNameLabel="text-black dark:text-white"
                        nameInput="Email"
                      />
                    </div>
                    <div className="col-span-6">
                      <Input
                        name="password"
                        register={register}
                        placeholder="Nhập mật khẩu"
                        messageErrorInput={errors.password?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                        className="relative flex-1"
                        classNameLabel="text-black dark:text-white"
                        nameInput="Mật khẩu"
                      />
                    </div>
                    <div className="col-span-6">
                      <Input
                        name="confirm_password"
                        register={register}
                        placeholder="Nhập mật khẩu"
                        messageErrorInput={errors.confirm_password?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                        className="relative flex-1"
                        classNameLabel="text-black dark:text-white"
                        nameInput="Xác nhận mật khẩu"
                      />
                    </div>
                    <div className="col-span-6">
                      <Input
                        name="phone"
                        register={register}
                        placeholder="Nhập số điện thoại"
                        messageErrorInput={errors.phone?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                        className="relative flex-1"
                        classNameLabel="text-black dark:text-white"
                        nameInput="Số điện thoại"
                      />
                    </div>
                    <div className="col-span-6">
                      {/* dùng <Controller/> khi và chỉ khi component không hỗ trợ register (register giúp theo dõi giá trị trong form) */}
                      {/* control giúp theo dõi giá trị, validate và đồng bộ dữ liệu giữa form và component tùy chỉnh  */}
                      <Controller
                        name="date_of_birth"
                        control={control}
                        render={({ field }) => {
                          return (
                            <DateSelect
                              value={date_of_birth}
                              onChange={field.onChange}
                              errorMessage={errors.date_of_birth?.message}
                            />
                          )
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-center w-1/3">
                    <div className="mb-2 text-black dark:text-white">Ảnh đại diện</div>
                    <img
                      src={previewImage || avatarWatch}
                      className="h-28 w-28 rounded-full mx-auto"
                      alt="avatar default"
                    />
                    <InputFileImage onChange={handleChangeImage} />
                  </div>
                </div>
                <h2 className="text-black dark:text-white">Thông tin làm việc</h2>
                <div className="mt-2 flex justify-between gap-8">
                  <div className="w-2/3 grid grid-cols-12 flex-wrap gap-4">
                    <div className="col-span-6">
                      <Input
                        name="name"
                        register={register}
                        placeholder="Nhập họ tên"
                        messageErrorInput={errors.name?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                        className="relative flex-1"
                        classNameLabel="text-black dark:text-white"
                        nameInput="Loại hợp đồng"
                      />
                    </div>
                    <div className="col-span-6">
                      {/* dùng <Controller/> khi và chỉ khi component không hỗ trợ register (register giúp theo dõi giá trị trong form) */}
                      {/* control giúp theo dõi giá trị, validate và đồng bộ dữ liệu giữa form và component tùy chỉnh  */}
                      <Controller
                        name="date_of_birth"
                        control={control}
                        render={({ field }) => {
                          return (
                            <DateSelect
                              nameInputSelect="Ngày vào làm"
                              value={date_of_birth}
                              onChange={field.onChange}
                              errorMessage={errors.date_of_birth?.message}
                            />
                          )
                        }}
                      />
                    </div>
                    <div className="col-span-6">
                      <Input
                        name="email"
                        register={register}
                        placeholder="Nhập email"
                        messageErrorInput={errors.email?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                        className="relative flex-1"
                        classNameLabel="text-black dark:text-white"
                        nameInput="Loại hợp đồng"
                      />
                    </div>
                    <div className="col-span-6">
                      <Input
                        name="phone"
                        register={register}
                        placeholder="Nhập số điện thoại"
                        messageErrorInput={errors.phone?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                        className="relative flex-1"
                        classNameLabel="text-black dark:text-white"
                        nameInput="Lương"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    type="submit"
                    icon={<Plus size={18} />}
                    nameButton="Thêm"
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
