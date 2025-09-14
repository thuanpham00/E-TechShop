/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { Select } from "antd"
import { motion } from "framer-motion"
import { Plus, X } from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import DateSelect from "src/Components/DateSelect"
import Input from "src/Components/Input"
import InputFileImage from "src/Components/InputFileImage"
import { queryParamConfigCustomer } from "src/Types/queryParams.type"
import avatarDefault from "src/Assets/img/avatarDefault.png"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { SuccessResponse } from "src/Types/utils.type"
import { Role } from "src/Admin/Pages/ManageRoles/ManageRoles"
import { adminAPI } from "src/Apis/admin.api"
import { AppContext } from "src/Context/authContext"
import { convertDateTime } from "src/Helpers/common"

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
  "salary",
  "created_at",
  "updated_at"
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
  | "created_at"
  | "updated_at"
>

export default function StaffDetail({
  addItem,
  setAddItem,
  queryConfig
}: {
  addItem: any
  setAddItem: React.Dispatch<any>
  queryConfig: queryParamConfigCustomer
}) {
  const { userId } = useContext(AppContext)
  const { data: dataRole } = useQuery({
    queryKey: ["listRoleInStaff", userId],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.role.getRoles(controller.signal)
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
    register,
    formState: { errors },
    setValue,
    control,
    // setError,
    handleSubmit,
    watch
  } = useForm<FormDataAdd>({ resolver: yupResolver(formDataAdd) })

  useEffect(() => {
    if (addItem !== null && typeof addItem === "object") {
      if (addItem.avatar === "") {
        setValue("avatar", avatarDefault)
      } else {
        setValue("avatar", addItem.avatar)
      }
      setValue("id", addItem._id)
      setValue("name", addItem.name)
      setValue("email", addItem.email)
      setValue("phone", addItem.numberPhone)
      setValue("date_of_birth", new Date(addItem.date_of_birth))
      setValue("roleInStaff", addItem.role)
      setValue("contract_type", addItem.employeeInfo?.contract_type)
      setValue("status", addItem.employeeInfo?.status)
      setValue("salary", addItem.employeeInfo?.salary)
      setValue("department", addItem.employeeInfo?.department)
      setValue("hire_date", new Date(addItem.employeeInfo?.hire_date))
      setValue("created_at", convertDateTime(addItem.created_at))
      setValue("updated_at", convertDateTime(addItem.updated_at))
    }
  }, [addItem, setValue])

  const [file, setFile] = useState<File>()

  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : ""
  }, [file])

  const handleChangeImage = (file?: File) => {
    setFile(file)
  }

  const avatarWatch = watch("avatar")
  const date_of_birth = watch("date_of_birth")

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
        <form className="bg-white dark:bg-darkPrimary rounded-xl w-[1050px]">
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

                  <div className="col-span-6">
                    <Input
                      name="created_at"
                      register={register}
                      placeholder="Nhập ngày khởi tạo"
                      messageErrorInput={errors.created_at?.message}
                      classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                      className="relative flex-1"
                      classNameLabel="text-black dark:text-white"
                      nameInput="Ngày tạo"
                      disabled
                    />
                  </div>
                  <div className="col-span-6">
                    <Input
                      name="updated_at"
                      register={register}
                      placeholder="Nhập ngày cập nhật"
                      messageErrorInput={errors.updated_at?.message}
                      classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                      className="relative flex-1"
                      classNameLabel="text-black dark:text-white"
                      nameInput="Ngày cập nhật"
                      disabled
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
                                { value: "active", label: "Hoạt động" },
                                { value: "inactive", label: "Không hoạt động" },
                                { value: "suspended", label: "Bị tạm dừng" }
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
                classNameButton="w-[120px] p-4 py-2 bg-blue-500 mt-2 w-full text-white font-semibold rounded-3xl hover:bg-blue-500/80 duration-200 flex items-center gap-1"
              />
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
