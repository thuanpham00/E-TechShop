import { yupResolver } from "@hookform/resolvers/yup"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { FolderUp, Plus, Search, X } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { useForm } from "react-hook-form"
import { adminAPI } from "src/Apis/admin.api"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import Pagination from "src/Components/Pagination"
import Skeleton from "src/Components/Skeleton"
import { path } from "src/Constants/path"
import useQueryParams from "src/Hook/useQueryParams"
import { queryParamConfig } from "src/Types/queryParams.type"
import { User } from "src/Types/user.type"
import { SuccessResponse } from "src/Types/utils.type"
import CustomerItem from "./Components"
import { Fragment } from "react/jsx-runtime"
import { useCallback, useState } from "react"

type FormData = Pick<SchemaAuthType, "email" | "name" | "phone">
const formData = schemaAuth.pick(["email", "name", "phone"])
export default function ManageCustomers() {
  const queryParams: queryParamConfig = useQueryParams()
  const queryConfig: queryParamConfig = {
    page: queryParams.page || "1", // mặc định page = 1
    limit: queryParams.limit || "5" // mặc định limit = 5
  }

  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["listCustomer", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.getCustomers(queryConfig as queryParamConfig, controller.signal)
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
    formState: { errors },
    handleSubmit
  } = useForm<FormData>({ resolver: yupResolver(formData) })

  const handleSearchForm = handleSubmit((data) => console.log(data))

  const [idCustomer, setIdCustomer] = useState<string | null>(null)

  const handleEditItem = useCallback((id: string) => {
    setIdCustomer(id)
  }, [])

  console.log(idCustomer)
  const getInfoCustomer = useQuery({
    queryKey: ["customer", idCustomer],
    queryFn: () => {
      return adminAPI.getCustomer(idCustomer as string)
    },
    enabled: Boolean(idCustomer) // chỉ chạy khi idCustomer có giá trị
  })

  return (
    <div>
      <Helmet>
        <title>Quản lý khách hàng</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <div className="p-4 bg-white mb-3 border border-[#dedede] rounded-md">
        <h1 className="text-[15px] font-medium">Tìm kiếm</h1>
        <form onSubmit={handleSearchForm} className="mt-1">
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
            <Input
              name="phone"
              register={register}
              placeholder="Nhập số điện thoại"
              messageErrorInput={errors.phone?.message}
              classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md"
              className="relative flex-1"
              nameInput="Số điện thoại"
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
        <div className="bg-white border border-[#dedede] border-b-0 p-4 pb-2 flex items-center justify-between rounded-tl-md rounded-tr-md">
          <h2 className="text-[15px] font-medium">Danh sách Khách hàng</h2>
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
            <div className="border bg-white border-t-0 rounded-bl-md rounded-br-md px-4">
              <div className="grid grid-cols-12 items-center gap-2 border-b-2 border-b-[#dedede] py-3">
                <div className="col-span-2 text-[14px] font-medium">ID</div>
                <div className="col-span-2 text-[14px] font-medium">Họ Tên</div>
                <div className="col-span-2 text-[14px] font-medium">Email</div>
                <div className="col-span-1 text-[14px] text-center font-medium">Số điện thoại</div>
                <div className="col-span-2 text-[14px] text-center font-medium">Trạng thái</div>
                <div className="col-span-2 text-[14px] font-medium">Ngày cập nhật</div>
                <div className="col-span-1 text-[14px] text-center font-medium">Hành động</div>
              </div>
              {result.result.result.map((item) => (
                <Fragment key={item._id}>
                  <CustomerItem handleEditItem={handleEditItem} item={item} />
                </Fragment>
              ))}
            </div>
            <Pagination
              data={result}
              queryConfig={queryConfig}
              page_size={page_size}
              pathNavigate={path.AdminCustomers}
            />
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  )
}
