import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { isUndefined, omit, omitBy } from "lodash"
import { Helmet } from "react-helmet-async"
import { createSearchParams, useNavigate } from "react-router-dom"
import { Fragment } from "react/jsx-runtime"
import NavigateBack from "src/Admin/Components/NavigateBack"
import Skeleton from "src/Components/Skeleton"
import useQueryParams from "src/Hook/useQueryParams"
import { queryParamConfigSupplier } from "src/Types/queryParams.type"
import Pagination from "src/Components/Pagination"
import { path } from "src/Constants/path"
import SupplierItem from "./Components/SupplierItem"
import { SuccessResponse } from "src/Types/utils.type"
import { adminAPI } from "src/Apis/admin.api"
import { SupplierItemType, UpdateSupplierBodyReq } from "src/Types/product.type"
import { HttpStatusCode } from "src/Constants/httpStatus"
import Button from "src/Components/Button"
import { useCallback, useEffect, useState } from "react"
import { FolderUp, Plus, RotateCcw, Search, X } from "lucide-react"
import { toast } from "react-toastify"
import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, useForm } from "react-hook-form"
import { cleanObject, convertDateTime } from "src/Helpers/common"
import DatePicker from "src/Admin/Components/DatePickerRange"
import Input from "src/Components/Input"
import {
  schemaSupplier,
  SchemaSupplierType,
  schemaSupplierUpdate,
  SchemaSupplierUpdateType
} from "src/Client/Utils/rule"
import { queryClient } from "src/main"

type FormDataUpdate = Pick<
  SchemaSupplierUpdateType,
  | "name"
  | "contactName"
  | "email"
  | "phone"
  | "id"
  | "address"
  | "description"
  | "taxCode"
  | "created_at"
  | "updated_at"
>

const formDataUpdate = schemaSupplierUpdate.pick([
  "name",
  "contactName",
  "email",
  "phone",
  "id",
  "address",
  "description",
  "taxCode",
  "created_at",
  "updated_at"
])

type FormDataSearch = Pick<
  SchemaSupplierType,
  | "name"
  | "email"
  | "phone"
  | "contactName"
  | "created_at_start"
  | "created_at_end"
  | "updated_at_start"
  | "updated_at_end"
>

const formDataSearch = schemaSupplier.pick([
  "name",
  "email",
  "phone",
  "contactName",
  "created_at_start",
  "created_at_end",
  "updated_at_start",
  "updated_at_end"
])

export default function ManageSuppliers() {
  const navigate = useNavigate()
  // const queryClient = useQueryClient()
  const queryParams: queryParamConfigSupplier = useQueryParams()
  const queryConfig: queryParamConfigSupplier = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "10", // mặc định limit =
      name: queryParams.name,
      email: queryParams.email,
      phone: queryParams.phone,
      contactName: queryParams.contactName,
      created_at_start: queryParams.created_at_start,
      created_at_end: queryParams.created_at_end,
      updated_at_start: queryParams.updated_at_start,
      updated_at_end: queryParams.updated_at_end
    },
    isUndefined
  )

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["listSupplier", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.supplier.getSuppliers(queryConfig as queryParamConfigSupplier, controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 3 phút nó không gọi lại api

    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<{
    result: SupplierItemType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
  }>
  const listSupplier = result?.result?.result

  const page_size = Math.ceil(Number(result?.result.total) / Number(result?.result.limit))

  const [idCategory, setIdCategory] = useState<string | null>(null)

  const handleEditItem = useCallback((id: string) => {
    setIdCategory(id)
  }, [])

  const handleExitsEditItem = () => {
    setIdCategory(null)
  }

  const getInfoSupplier = useQuery({
    queryKey: ["supplier", idCategory],
    queryFn: () => {
      return adminAPI.supplier.getSupplierDetail(idCategory as string)
    },
    enabled: Boolean(idCategory) // chỉ chạy khi idCustomer có giá trị
  })

  const infoCategory = getInfoSupplier.data?.data as SuccessResponse<{ result: SupplierItemType }>

  console.log(infoCategory)
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
      contactName: "",
      email: "",
      address: "",
      phone: "",
      description: "",
      taxCode: "",
      created_at: "",
      updated_at: ""
    } // giá trị khởi tạo
  })

  useEffect(() => {
    if (profile) {
      setValue("id", profile._id)
      setValue("name", profile.name)
      setValue("contactName", profile.contactName)
      setValue("email", profile.email)
      setValue("address", profile.address as string)
      setValue("phone", profile.phone)
      setValue("description", profile.description as string)
      setValue("taxCode", profile.taxCode as string)
      setValue("created_at", convertDateTime(profile.created_at))
      setValue("updated_at", convertDateTime(profile.updated_at))
    }
  }, [profile, setValue])

  const updateCategoryMutation = useMutation({
    mutationFn: (body: { id: string; body: UpdateSupplierBodyReq }) => {
      return adminAPI.category.updateCategoryDetail(body.id, body.body)
    }
  })

  const handleSubmitUpdate = handleSubmit((data) => {
    console.log(data)
    // updateCategoryMutation.mutate(
    //   { id: idCategory as string, body: data },
    //   {
    //     onSuccess: () => {
    //       setIdCategory(null)
    //       toast.success("Cập nhật thành công", { autoClose: 1500 })
    //       queryClient.invalidateQueries({ queryKey: ["listSupplier", queryConfig] })
    //     },
    //     onError: (error) => {
    //       if (isError400<ErrorResponse<MessageResponse>>(error)) {
    //         const msg = error.response?.data as ErrorResponse<{ message: string }>
    //         const msg2 = msg.message
    //         setError("name", {
    //           message: msg2
    //         })
    //       }
    //     }
    //   }
    // )
  })

  const {
    register: registerFormSearch,
    handleSubmit: handleSubmitFormSearch,
    reset: resetFormSearch,
    control: controlFormSearch,
    trigger
  } = useForm<FormDataSearch>({
    resolver: yupResolver(formDataSearch)
  })

  const handleSubmitSearch = handleSubmitFormSearch(
    (data) => {
      const params = cleanObject({
        ...queryConfig,
        name: data.name,
        email: data.email,
        phone: data.phone,
        contactName: data.contactName,
        created_at_start: data.created_at_start?.toISOString(),
        created_at_end: data.created_at_end?.toISOString(),
        updated_at_start: data.updated_at_start?.toISOString(),
        updated_at_end: data.updated_at_end?.toISOString()
      })
      navigate({
        pathname: path.AdminSuppliers,
        search: createSearchParams(params).toString()
      })
    },
    (error) => {
      if (error.created_at_end) {
        toast.error(error.created_at_end?.message, { autoClose: 1500 })
      }
      if (error.updated_at_end) {
        toast.error(error.updated_at_end?.message, { autoClose: 1500 })
      }
    }
  )

  const handleResetFormSearch = () => {
    const filteredSearch = omit(queryConfig, [
      "name",
      "email",
      "phone",
      "contactName",
      "created_at_start",
      "created_at_end",
      "updated_at_start",
      "updated_at_end"
    ])
    resetFormSearch()
    navigate({ pathname: path.AdminSuppliers, search: createSearchParams(filteredSearch).toString() })
  }

  if (isError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.response?.status === HttpStatusCode.NotFound) {
      navigate(path.AdminNotFound, { replace: true })
    }
  }

  return (
    <div>
      <Helmet>
        <title>Quản lý nhà cung cấp</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />
      <div className="text-lg font-bold py-2 text-[#3A5BFF]">Nhà cung cấp</div>
      <div className="p-4 bg-white dark:bg-darkPrimary mb-3 border border-[#dedede] dark:border-darkBorder rounded-md">
        <h1 className="text-[15px] font-medium">Tìm kiếm</h1>
        <div>
          <form onSubmit={handleSubmitSearch}>
            <div className="mt-1 grid grid-cols-2">
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] rounded-tl-md">
                <span className="w-1/3">Tên nhà cung cấp</span>
                <div className="w-2/3 relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    <Input
                      name="name"
                      register={registerFormSearch}
                      placeholder="Nhập tên nhà cung cấp"
                      classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                      className="relative flex-grow"
                      classNameError="hidden"
                    />
                  </div>
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] rounded-tr-md">
                <span className="w-1/3">Tên người đại diện</span>
                <div className="w-2/3 relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    <Input
                      name="contactName"
                      register={registerFormSearch}
                      placeholder="Nhập tên người đại diện"
                      classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                      className="relative flex-grow"
                      classNameError="hidden"
                    />
                  </div>
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkBorder border border-[#dadada] border-t-0">
                <span className="w-1/3">Email</span>
                <div className="w-2/3 relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    <Input
                      name="email"
                      register={registerFormSearch}
                      placeholder="Nhập email"
                      classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                      className="relative flex-grow"
                      classNameError="hidden"
                    />
                  </div>
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkBorder border border-[#dadada] border-t-0">
                <span className="w-1/3">Số điện thoại</span>
                <div className="w-2/3 relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    <Input
                      name="phone"
                      register={registerFormSearch}
                      placeholder="Nhập số điện thoại"
                      classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                      className="relative flex-grow"
                      classNameError="hidden"
                    />
                  </div>
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] border-t-0 rounded-bl-md">
                <span className="w-1/3">Ngày tạo</span>
                <div className="w-2/3 relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    <Controller
                      name="created_at_start"
                      control={controlFormSearch}
                      render={({ field }) => {
                        return (
                          <DatePicker
                            value={field.value as Date}
                            onChange={(event) => {
                              field.onChange(event)
                              trigger("created_at_end")
                            }}
                          />
                        )
                      }}
                    />
                    <span>-</span>
                    <Controller
                      name="created_at_end"
                      control={controlFormSearch}
                      render={({ field }) => {
                        return (
                          <DatePicker
                            value={field.value as Date}
                            onChange={(event) => {
                              field.onChange(event)
                              trigger("created_at_start")
                            }}
                          />
                        )
                      }}
                    />
                  </div>
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] border-t-0 rounded-br-md">
                <span className="w-1/3">Ngày cập nhật</span>
                <div className="w-2/3 relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    <Controller
                      name="updated_at_start"
                      control={controlFormSearch}
                      render={({ field }) => {
                        return (
                          <DatePicker
                            value={field.value as Date}
                            onChange={(event) => {
                              field.onChange(event)
                              trigger("updated_at_end")
                            }}
                          />
                        )
                      }}
                    />
                    <span>-</span>
                    <Controller
                      name="updated_at_end"
                      control={controlFormSearch}
                      render={({ field }) => {
                        return (
                          <DatePicker
                            value={field.value as Date}
                            onChange={(event) => {
                              field.onChange(event)
                              trigger("updated_at_start")
                            }}
                          />
                        )
                      }}
                    />
                  </div>
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button
                  // onClick={() => setAddItem(true)}
                  icon={<Plus size={15} />}
                  nameButton="Thêm mới"
                  classNameButton="p-2 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
                />
                <Button
                  icon={<FolderUp size={15} />}
                  nameButton="Export"
                  classNameButton="p-2 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-md hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleResetFormSearch}
                  type="button"
                  icon={<RotateCcw size={15} />}
                  nameButton="Xóa bộ lọc tìm kiếm"
                  classNameButton="p-2 bg-[#f2f2f2] border border-[#dedede] w-full text-black font-medium hover:bg-[#dedede]/80 rounded-md duration-200 text-[13px] flex items-center gap-1 h-[35px]"
                />
                <Button
                  type="submit"
                  icon={<Search size={15} />}
                  nameButton="Tìm kiếm"
                  classNameButton="p-2 px-3 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1 h-[35px]"
                  className="flex-shrink-0"
                />
              </div>
            </div>
          </form>
        </div>
        {isLoading && <Skeleton />}
        {!isFetching && (
          <div>
            <div className="mt-4">
              <div className="bg-[#f2f2f2] dark:bg-darkPrimary grid grid-cols-10 items-center gap-2 py-3 border border-[#dedede] dark:border-darkBorder px-4 rounded-tl-md rounded-tr-md">
                <div className="col-span-2 text-[14px] font-semibold">ID</div>
                <div className="col-span-2 text-[14px] font-semibold">Tên nhà cung cấp</div>
                <div className="col-span-1 text-[14px] font-semibold">Người đại diện </div>
                <div className="col-span-1 text-[14px] font-semibold">Email</div>
                <div className="col-span-1 text-[14px] font-semibold">Số điện thoại</div>
                <div className="col-span-1 text-[14px] font-semibold">Ngày tạo</div>
                <div className="col-span-1 text-[14px] font-semibold">Ngày cập nhật</div>
                <div className="col-span-1 text-[14px] text-center font-semibold">Hành động</div>
              </div>
              <div className="">
                {listSupplier.length > 0 ? (
                  listSupplier.map((item) => (
                    <Fragment key={item._id}>
                      <SupplierItem handleEditItem={handleEditItem} item={item} />
                    </Fragment>
                  ))
                ) : (
                  <div className="text-center mt-4">Không tìm thấy kết quả</div>
                )}
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
                <div className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60"></div>
                <div className="z-20 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <button onClick={handleExitsEditItem} className="absolute right-2 top-1">
                    <X color="gray" size={22} />
                  </button>
                  <form className="p-4 bg-white dark:bg-darkPrimary rounded-md w-[900px]">
                    <h3 className="text-[15px] font-medium">Thông tin nhà cung cấp</h3>
                    <div className="mt-4 flex items-center gap-4">
                      <Input
                        name="id"
                        register={register}
                        placeholder="Nhập id"
                        messageErrorInput={errors.id?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Id"
                        disabled
                      />
                      <Input
                        name="name"
                        register={register}
                        placeholder="Nhập tên nhà cung cấp"
                        messageErrorInput={errors.name?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Tên nhà cung cấp"
                      />
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <Input
                        name="contactName"
                        register={register}
                        placeholder="Nhập họ tên"
                        messageErrorInput={errors.contactName?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Tên người đại diện"
                      />
                      <Input
                        name="address"
                        register={register}
                        placeholder="Nhập địa chỉ"
                        messageErrorInput={errors.address?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Địa chỉ"
                      />
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <Input
                        name="email"
                        register={register}
                        placeholder="Nhập email"
                        messageErrorInput={errors.email?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Email"
                      />
                      <Input
                        name="phone"
                        register={register}
                        placeholder="Nhập số điện thoại"
                        messageErrorInput={errors.phone?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Số điện thoại"
                      />
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <Input
                        name="taxCode"
                        register={register}
                        placeholder="Nhập tax-code"
                        messageErrorInput={errors.taxCode?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Tax-Code"
                        disabled
                      />
                      <Input
                        name="description"
                        register={register}
                        placeholder="Nhập mô tả"
                        messageErrorInput={errors.name?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Mô tả"
                      />
                    </div>
                    <div className="mt-2 flex items-center gap-4">
                      <Input
                        name="created_at"
                        register={register}
                        placeholder="Nhập ngày tạo"
                        messageErrorInput={errors.created_at?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Ngày tạo"
                        disabled
                      />
                      <Input
                        name="updated_at"
                        register={register}
                        placeholder="Nhập ngày tạo cập nhật"
                        messageErrorInput={errors.updated_at?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
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
            {/* {addItem ? <AddCategory setAddItem={setAddItem} /> : ""} */}
          </div>
        )}
      </div>
    </div>
  )
}
