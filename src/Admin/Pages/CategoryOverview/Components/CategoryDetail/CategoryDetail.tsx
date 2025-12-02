import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Modal, Select } from "antd"
import { ArrowUpFromLine, Trash2 } from "lucide-react"
import { useContext, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { CategoryAPI } from "src/Apis/admin/category.api"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import { AppContext } from "src/Context/authContext"
import { convertDateTime } from "src/Helpers/common"
import { isError400 } from "src/Helpers/utils"
import { useCheckPermission } from "src/Hook/useRolePermissions"
import { CategoryItemType, UpdateCategoryBodyReq } from "src/Types/product.type"
import { queryParamConfigCategory } from "src/Types/queryParams.type"
import { ErrorResponse, MessageResponse } from "src/Types/utils.type"

type FormDataUpdate = Pick<SchemaAuthType, "name" | "id" | "created_at" | "updated_at"> & {
  is_active?: "active" | "inactive"
  desc?: string
}

const formDataUpdate = schemaAuth.pick(["name", "id", "created_at", "updated_at"])

export default function CategoryDetail({
  dataCategory,
  queryConfig
}: {
  dataCategory: CategoryItemType
  queryConfig: queryParamConfigCategory
}) {
  const { permissions } = useContext(AppContext)
  const { hasPermission } = useCheckPermission(permissions)

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const {
    register,
    formState: { errors },
    setValue,
    setError,
    control,
    handleSubmit
  } = useForm<FormDataUpdate>({
    resolver: yupResolver(formDataUpdate),
    defaultValues: {
      id: "",
      name: "",
      desc: "",
      is_active: "active",
      created_at: "",
      updated_at: ""
    } // giá trị khởi tạo
  })

  useEffect(() => {
    if (dataCategory) {
      setValue("id", dataCategory._id)
      setValue("name", dataCategory.name)
      setValue("is_active", dataCategory.is_active ? "active" : "inactive")
      setValue("desc", dataCategory.desc || "")
      setValue("created_at", convertDateTime(dataCategory.created_at))
      setValue("updated_at", convertDateTime(dataCategory.updated_at))
    }
  }, [dataCategory, setValue])

  const updateCategoryMutation = useMutation({
    mutationFn: (body: { id: string; body: UpdateCategoryBodyReq }) => {
      return CategoryAPI.updateCategoryDetail(body.id, body.body)
    }
  })

  const handleSubmitUpdate = handleSubmit((data) => {
    const payload = {
      name: data.name,
      is_active: data.is_active === "active" ? true : false,
      desc: data.desc
    }
    updateCategoryMutation.mutate(
      { id: dataCategory._id as string, body: payload },
      {
        onSuccess: () => {
          toast.success("Cập nhật thành công", { autoClose: 1500 })
          queryClient.invalidateQueries({ queryKey: ["listCategory", queryConfig] })
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
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => {
      return CategoryAPI.deleteCategory(id)
    }
  })

  const handleDeleteCategory = (id: string) => {
    deleteCategoryMutation.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["listCategory"] })
        navigate({
          pathname: "/admin/categories"
        })
        toast.success("Xóa thành công!", { autoClose: 1500 })
      },
      onError: (error) => {
        if (isError400<ErrorResponse<MessageResponse>>(error)) {
          toast.error(error.response?.data.message, {
            autoClose: 1500
          })
        }
      }
    })
  }

  return (
    <div>
      <form
        onSubmit={handleSubmitUpdate}
        className="bg-white dark:bg-darkPrimary rounded-md border border-gray-200 dark:border-darkBorder shadow-md"
      >
        <h3 className="py-2 px-4 text-lg font-semibold tracking-wide rounded-md text-black dark:text-white">
          Thông tin danh mục
        </h3>
        <div className="p-4 pt-0">
          <div className="mt-4 flex items-center gap-4">
            <Input
              name="id"
              register={register}
              placeholder="Nhập họ tên"
              messageErrorInput={errors.id?.message}
              classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
              className="relative flex-1"
              classNameLabel="text-black dark:text-white"
              nameInput="Mã danh mục"
              disabled
            />
            <Input
              name="name"
              register={register}
              placeholder="Nhập họ tên"
              messageErrorInput={errors.name?.message}
              classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
              className="relative flex-1"
              classNameLabel="text-black dark:text-white"
              nameInput="Tên danh mục"
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
              placeholder="Nhập ngày tạo cập nhật"
              messageErrorInput={errors.updated_at?.message}
              classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
              className="relative flex-1"
              classNameLabel="text-black dark:text-white"
              nameInput="Ngày cập nhật"
              disabled
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
          <div className="w-full mt-4">
            <Input
              name="desc"
              register={register}
              placeholder="Nhập mô tả"
              classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
              className="relative flex-1"
              classNameLabel="text-black dark:text-white"
              nameInput="Mô tả danh mục"
            />
          </div>
          <div className="flex items-center justify-end mt-4 gap-2">
            <Button
              onClick={() =>
                Modal.confirm({
                  title: "Bạn có chắc chắn muốn xóa?",
                  content: "Không thể hoàn tác hành động này. Thao tác này sẽ xóa vĩnh viễn dữ liệu của bạn.",
                  okText: "Xóa",
                  okButtonProps: { danger: true },
                  cancelText: "Hủy",
                  onOk: () => handleDeleteCategory(dataCategory._id)
                })
              }
              icon={<Trash2 size={18} />}
              nameButton="Xóa"
              type="button"
              disabled={!hasPermission("category:delete")}
              classNameButton="w-[120px] p-4 py-2 bg-red-500 w-full text-white font-semibold rounded-md hover:bg-red-500/80 duration-200 flex items-center gap-1 text-[12px] disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed"
            />
            <Button
              type="submit"
              icon={<ArrowUpFromLine size={18} />}
              nameButton="Lưu thay đổi"
              disabled={!hasPermission("category:update")}
              classNameButton="w-[120px] p-4 py-2 bg-blue-500 w-full text-white font-semibold rounded-md hover:bg-blue-500/80 duration-200 flex items-center gap-1 text-[12px] disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </form>
    </div>
  )
}
