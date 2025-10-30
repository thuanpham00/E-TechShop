import { yupResolver } from "@hookform/resolvers/yup"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Plus, X } from "lucide-react"
import React, { useContext, useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import DateSelect from "src/Components/DateSelect"
import Input from "src/Components/Input"
import InputFileImage from "src/Components/InputFileImage"
import { CreateStaffBodyReq } from "src/Types/product.type"
import avatarDefault from "src/Assets/img/avatarDefault.png"
import { MediaAPI } from "src/Apis/media.api"
import { ObjectId } from "bson"
import { isError422 } from "src/Helpers/utils"
import { ErrorResponse, SuccessResponse } from "src/Types/utils.type"
import { Select } from "antd"
import { AppContext } from "src/Context/authContext"
import { Role } from "src/Admin/Pages/ManageRoles/ManageRoles"
import { RolePermissionAPI } from "src/Apis/admin/role.api"
import { StaffAPI } from "src/Apis/admin/staff.api"

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setAddItem: React.Dispatch<any>
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
  "roleInStaff",
  "department",
  "contract_type",
  "status",
  "hire_date",
  "salary"
])

type FormDataAdd = Pick<
  SchemaAuthType,
  | "name"
  | "email"
  | "phone"
  | "date_of_birth"
  | "avatar"
  | "password"
  | "confirm_password"
  | "id"
  | "roleInStaff"
  | "department"
  | "contract_type"
  | "status"
  | "hire_date"
  | "salary"
>

export default function AddStaff({ setAddItem }: Props) {
  const queryClient = useQueryClient()
  const { userId } = useContext(AppContext)
  const { data: dataRole } = useQuery({
    queryKey: ["listRoleInStaff", userId],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return RolePermissionAPI.getRoles(controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 1 * 60 * 1000, // dưới 3 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const resultDataRole = dataRole?.data as SuccessResponse<{
    result: Role[]
  }>
  const listRole = resultDataRole?.result?.result
    .filter((item) => item.key !== "ADMIN" && item.key !== "CUSTOMER")
    .map((item) => ({ idRole: item._id, name: item.name }))

  const {
    handleSubmit,
    register,
    control,
    watch,
    setError,
    setValue,
    formState: { errors }
  } = useForm<FormDataAdd>({ resolver: yupResolver(formDataAdd) })

  const addStaffMutation = useMutation({
    mutationFn: (body: CreateStaffBodyReq) => {
      return StaffAPI.createStaff(body)
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

  const handleAddStaffSubmit = handleSubmit(async (data) => {
    const idUser = new ObjectId().toHexString() // Trả về string như "665e0bcb9142f3e54365e1ef"

    let avatarName = avatarDefault
    if (file) {
      const avatar = await updateImageProfileMutation.mutateAsync({
        file: file as File,
        userId: idUser as string
      })
      avatarName = avatar.data.result.url
    }
    const body: CreateStaffBodyReq = {
      name: data.name,
      email: data.email,
      password: data.password,
      confirm_password: data.confirm_password,
      phone: data.phone,
      date_of_birth: data.date_of_birth as Date,
      avatar: avatarName,
      id: idUser.toString(),
      department: data.department,
      role: data.roleInStaff,
      contract_type: data.contract_type,
      status: data.status,
      hire_date: data.hire_date as Date,
      salary: data.salary
    }
    addStaffMutation.mutate(body, {
      onSuccess: () => {
        toast.success("Thêm người dùng thành công", { autoClose: 1500 })
        setAddItem(false)
        queryClient.invalidateQueries({ queryKey: ["listStaffs"] })
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
        <form onSubmit={handleAddStaffSubmit} className="bg-white dark:bg-darkPrimary rounded-xl w-[1050px]">
          <h3 className="py-2 px-4 text-lg font-semibold tracking-wide rounded-md text-black dark:text-white">
            Thông tin nhân viên
          </h3>
          <div className="p-4 pt-0">
            <h2 className="text-black dark:text-white font-semibold">Thông tin cơ bản</h2>
            <div className="flex justify-between gap-8">
              <div className="w-2/3">
                <div className="mt-2 grid grid-cols-12 flex-wrap gap-4">
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
                      type="password"
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
                      type="password"
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
                <h2 className="text-black dark:text-white font-semibold">Thông tin làm việc</h2>
                <div className="mt-2 flex justify-between gap-8">
                  <div className="grid grid-cols-12 flex-wrap gap-4">
                    <div className="col-span-4">
                      <span className="text-black dark:text-white">Vai trò</span>
                      <div className="mt-1">
                        <Controller
                          name="roleInStaff"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value ?? undefined}
                              onChange={field.onChange}
                              placeholder="Chọn vị trí"
                              className="select-status w-full"
                              options={listRole?.map((role) => ({
                                value: role.idRole, // truyền _id làm value
                                label: role.name // hiển thị name
                              }))}
                            />
                          )}
                        />
                        <span className="text-red-500 text-[13px] font-semibold min-h-[1.25rem] block">
                          {errors.roleInStaff?.message}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-4">
                      <span className="text-black dark:text-white">Loại hợp đồng</span>
                      <div className="mt-1">
                        <Controller
                          name="contract_type"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value ?? undefined}
                              onChange={field.onChange}
                              placeholder="Chọn loại hợp đồng"
                              className="select-status w-full"
                              options={[
                                { value: "permanent", label: "Hợp đồng dài hạn" },
                                { value: "fixed-term", label: "Hợp đồng xác định thời hạn" },
                                { value: "probation", label: "Thử việc" }
                              ]}
                            />
                          )}
                        />
                        <span className="text-red-500 text-[13px] font-semibold min-h-[1.25rem] block">
                          {errors.contract_type?.message}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-4">
                      <span className="text-black dark:text-white">Trạng thái tài khoản</span>
                      <div className="mt-1">
                        <Controller
                          name="status"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value ?? undefined} // đảm bảo không phải chuỗi rỗng
                              placeholder="Chọn trạng thái"
                              onChange={field.onChange}
                              className="select-status w-full"
                              options={[
                                { value: "Active", label: "Hoạt động" },
                                { value: "Inactive", label: "Không hoạt động" },
                                { value: "Suspended", label: "Bị tạm dừng" }
                              ]}
                            />
                          )}
                        />
                        <span className="text-red-500 text-[13px] font-semibold min-h-[1.25rem] block">
                          {errors.status?.message}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-4">
                      <Input
                        name="salary"
                        register={register}
                        placeholder="Nhập lương làm việc"
                        messageErrorInput={errors.salary?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                        className="relative flex-1"
                        classNameLabel="text-black dark:text-white"
                        nameInput="Lương"
                      />
                    </div>
                    <div className="col-span-4">
                      <span className="text-black dark:text-white">Phòng ban</span>
                      <div className="mt-1">
                        <Controller
                          name="department"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value ?? undefined}
                              onChange={field.onChange}
                              placeholder="Chọn loại hợp đồng"
                              className="select-status w-full h-[40px]"
                              options={[
                                { value: "Phòng Kinh doanh", label: "Phòng Kinh doanh" },
                                { value: "Phòng Kho vận", label: "Phòng Kho vận" }
                              ]}
                            />
                          )}
                        />
                        <span className="text-red-500 text-[13px] font-semibold min-h-[1.25rem] block">
                          {errors.department?.message}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-4">
                      <Controller
                        name="hire_date"
                        control={control}
                        render={({ field }) => {
                          return (
                            <DateSelect
                              nameInputSelect="Ngày vào làm"
                              value={field.value}
                              onChange={field.onChange}
                              errorMessage={errors.hire_date?.message}
                            />
                          )
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-1/3 flex items-center justify-center flex-col bg-[#dadada] rounded-sm px-4 shadow-sm">
                <div className="mb-2 text-black dark:text-white">Ảnh đại diện</div>
                <img
                  src={previewImage || avatarWatch}
                  className="h-28 w-28 rounded-full mx-auto"
                  alt="avatar default"
                />
                <InputFileImage onChange={handleChangeImage} />
              </div>
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
  )
}
