import { yupResolver } from "@hookform/resolvers/yup"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FolderUp, Plus, Search, X } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { useForm } from "react-hook-form"
import { Fragment } from "react/jsx-runtime"
import { adminAPI } from "src/Apis/admin.api"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import Skeleton from "src/Components/Skeleton"
import useQueryParams from "src/Hook/useQueryParams"
import { queryParamConfig, queryParamConfigCategory } from "src/Types/queryParams.type"
import { ErrorResponse, MessageResponse, SuccessResponse } from "src/Types/utils.type"
import { path } from "src/Constants/path"
import { useCallback, useEffect, useState } from "react"
import Pagination from "src/Components/Pagination"
import CategoryItem from "./Components/CategoryItem"
import { BrandItemType, CategoryItemType, UpdateCategoryBodyReq } from "src/Types/product.type"
import { isUndefined, omitBy } from "lodash"
import { convertDateTime } from "src/Helpers/common"
import { toast } from "react-toastify"
import { isError401 } from "src/Helpers/utils"

type FormDataUpdate = Pick<SchemaAuthType, "name" | "id" | "created_at" | "updated_at">
const formDataUpdate = schemaAuth.pick(["name", "id", "created_at", "updated_at"])

export default function ManageCategories() {
  const queryClient = useQueryClient()
  const queryParams: queryParamConfigCategory = useQueryParams()
  const queryConfig: queryParamConfigCategory = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit =
      name: queryParams.name
    },
    isUndefined
  )

  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["listCategories", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.getCategories(queryConfig as queryParamConfig, controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 5 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<{
    result: CategoryItemType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
  }>
  const page_size = Math.ceil(Number(result?.result.total) / Number(result?.result.limit))

  const [idCategory, setIdCategory] = useState<string | null>(null)

  const handleEditItem = useCallback((id: string) => {
    setIdCategory(id)
  }, [])

  const handleExitsEditItem = () => {
    setIdCategory(null)
  }

  const getInfoCategory = useQuery({
    queryKey: ["category", idCategory],
    queryFn: () => {
      return adminAPI.getCategoryDetail(idCategory as string)
    },
    enabled: Boolean(idCategory) // chỉ chạy khi idCustomer có giá trị
  })

  const infoCategory = getInfoCategory.data?.data as SuccessResponse<{ result: BrandItemType }>
  const profile = infoCategory?.result?.result

  const {
    register,
    formState: { errors },
    setValue,
    setError,
    handleSubmit
  } = useForm<FormDataUpdate>({
    resolver: yupResolver(formDataUpdate),
    defaultValues: {
      id: "",
      name: "",
      created_at: "",
      updated_at: ""
    } // giá trị khởi tạo
  })

  useEffect(() => {
    if (profile) {
      setValue("id", profile._id)
      setValue("name", profile.name)
      setValue("created_at", convertDateTime(profile.created_at))
      setValue("updated_at", convertDateTime(profile.updated_at))
    }
  }, [profile, setValue])

  const updateCategoryMutation = useMutation({
    mutationFn: (body: { id: string; body: UpdateCategoryBodyReq }) => {
      return adminAPI.updateCategoryDetail(body.id, body.body)
    }
  })

  const handleSubmitUpdate = handleSubmit((data) => {
    updateCategoryMutation.mutate(
      { id: idCategory as string, body: data },
      {
        onSuccess: () => {
          setIdCategory(null)
          toast.success("Cập nhật thành công", { autoClose: 1500 })
          queryClient.invalidateQueries({ queryKey: ["listCategories", queryConfig] })
        },
        onError: (error) => {
          if (isError401<ErrorResponse<MessageResponse>>(error)) {
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

  return (
    <div>
      <Helmet>
        <title>Quản lý danh mục</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <div className="p-4 bg-white mb-3 border border-[#dedede] rounded-md">
        <h1 className="text-[15px] font-medium">Tìm kiếm</h1>
        <form className="mt-1">
          <div className="flex items-center gap-4">
            <Input
              name="name1"
              register={register}
              placeholder="Nhập tên thể loại"
              // messageErrorInput={errors.name1?.message}
              classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md"
              className="relative flex-1"
              nameInput="Tên thể loại"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              icon={<Search size={15} />}
              nameButton="Tìm kiếm"
              classNameButton="p-2 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
            />
            <Button
              icon={<X size={15} />}
              nameButton="Xóa"
              classNameButton="p-2 bg-white border border-[#dedede] w-full text-black font-medium rounded-md hover:bg-[#dedede]/80 duration-200 text-[13px] flex items-center gap-1"
            />
          </div>
        </form>
      </div>
      <div>
        <div className="bg-white border border-b-0 border-[#dedede] p-4 pb-2 flex items-center justify-between rounded-tl-md rounded-tr-md">
          <h2 className="text-[15px] font-medium">Danh mục thể loại sản phẩm</h2>
          <div className="flex items-center gap-2">
            <Button
              icon={<FolderUp size={15} />}
              nameButton="Export"
              classNameButton="p-2 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
            />
            <Button
              icon={<Plus size={15} />}
              nameButton="Thêm mới"
              classNameButton="p-2 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
            />
          </div>
        </div>
        {isLoading && <Skeleton />}
        {!isFetching ? (
          <div>
            <div>
              <div className="bg-[#f2f2f2] grid grid-cols-10 items-center gap-2 py-3 border border-[#dedede] px-4">
                <div className="col-span-2 text-[14px] font-medium">ID</div>
                <div className="col-span-2 text-[14px] font-medium">Tên thể loại</div>
                <div className="col-span-2 text-[14px] font-medium">Ngày tạo</div>
                <div className="col-span-2 text-[14px] font-medium">Ngày cập nhật</div>
                <div className="col-span-2 text-[14px] text-center font-medium">Hành động</div>
              </div>
              <div className="">
                {result?.result?.result?.map((item) => (
                  <Fragment key={item._id}>
                    <CategoryItem handleEditItem={handleEditItem} item={item} />
                  </Fragment>
                ))}
              </div>
            </div>
            <Pagination
              data={result}
              queryConfig={queryConfig}
              page_size={page_size}
              pathNavigate={path.AdminCategories}
            />
            {idCategory !== null ? (
              <Fragment>
                <div className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60 "></div>
                <div className="z-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <button onClick={handleExitsEditItem} className="absolute right-2 top-1">
                    <X color="gray" size={22} />
                  </button>
                  <form onSubmit={handleSubmitUpdate} className="p-4 bg-white rounded-md">
                    <h3 className="text-[15px] font-medium">Thông tin thể loại</h3>
                    <div className="mt-4 flex items-center gap-4">
                      <Input
                        name="id"
                        register={register}
                        placeholder="Nhập họ tên"
                        messageErrorInput={errors.id?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Id"
                        disabled
                      />
                      <Input
                        name="name"
                        register={register}
                        placeholder="Nhập họ tên"
                        messageErrorInput={errors.name?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-white focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Tên thể loại"
                      />
                    </div>
                    <div className="mt-2 flex items-center gap-4">
                      <Input
                        name="created_at"
                        register={register}
                        placeholder="Nhập ngày tạo"
                        messageErrorInput={errors.created_at?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Ngày tạo"
                        disabled
                      />
                      <Input
                        name="updated_at"
                        register={register}
                        placeholder="Nhập ngày tạo cập nhật"
                        messageErrorInput={errors.updated_at?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Ngày cập nhật"
                        disabled
                      />
                    </div>

                    <div className="flex items-center justify-end">
                      <Button
                        type="submit"
                        nameButton="Cập nhật"
                        classNameButton="w-[120px] p-4 py-2 bg-blue-500 mt-2 w-full text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
                      />
                    </div>
                  </form>
                </div>
              </Fragment>
            ) : (
              ""
            )}
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  )
}
