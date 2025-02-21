import { yupResolver } from "@hookform/resolvers/yup"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
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
import { queryParamConfig } from "src/Types/queryParams.type"
import { User } from "src/Types/user.type"
import { SuccessResponse } from "src/Types/utils.type"
import { path } from "src/Constants/path"
import { useCallback, useState } from "react"
import Pagination from "src/Components/Pagination"
import CategoryItem from "./Components/CategoryItem"

type FormData = Pick<SchemaAuthType, "email" | "name" | "numberPhone">
const formData = schemaAuth.pick(["email", "name", "numberPhone"])

export default function ManageCategories() {
  const queryParams: queryParamConfig = useQueryParams()
  const queryConfig: queryParamConfig = {
    page: queryParams.page || "1", // mặc định page = 1
    limit: queryParams.limit || "5" // mặc định limit = 5
  }

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
    result: User[]
    total: string
    page: string
    limit: string
    totalOfPage: string
  }>
  const page_size = Math.ceil(Number(result?.result.total) / Number(result?.result.limit))

  const {
    register,
    formState: { errors }
    // handleSubmit
  } = useForm<FormData>({ resolver: yupResolver(formData) })

  const [idCustomer, setIdCustomer] = useState<string | null>(null)

  const handleEditItem = useCallback((id: string) => {
    setIdCustomer(id)
  }, [])

  // console.log(idCustomer)
  // vì sao nó render 2 lần
  // lần 1 là component lần đầu mount (chạy console lần 1 + useQuery)
  // lần 2 là sau khi useQuery trả data về và re-render trang + chạy console lần 2
  const getInfoCustomer = useQuery({
    queryKey: ["customer", idCustomer],
    queryFn: () => {
      return adminAPI.getCustomer(idCustomer as string)
    },
    enabled: Boolean(idCustomer) // chỉ chạy khi idCustomer có giá trị
  })

  console.log(getInfoCustomer.data)

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
              name="email"
              register={register}
              placeholder="Nhập email"
              messageErrorInput={errors.email?.message}
              classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md"
              className="relative flex-1"
              nameInput="Email"
            />
            <Input
              name="name"
              register={register}
              placeholder="Nhập họ tên"
              messageErrorInput={errors.name?.message}
              classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md"
              className="relative flex-1"
              nameInput="Họ tên"
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
                {result.result.result.map((item) => (
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
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  )
}
