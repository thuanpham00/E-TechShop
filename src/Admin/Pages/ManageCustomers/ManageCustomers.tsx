/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Filter, FolderUp, Plus, Search, X } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { Controller, useForm } from "react-hook-form"
import { adminAPI } from "src/Apis/admin.api"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import { path } from "src/Constants/path"
import useQueryParams from "src/Hook/useQueryParams"
import { queryParamConfig, queryParamConfigCustomer } from "src/Types/queryParams.type"
import { UserType } from "src/Types/user.type"
import { ErrorResponse, SuccessResponse } from "src/Types/utils.type"
import { Fragment } from "react/jsx-runtime"
import { useCallback, useEffect, useMemo, useState } from "react"
import avatarDefault from "src/Assets/img/avatarDefault.png"
import { UpdateBodyReq } from "src/Types/product.type"
import { toast } from "react-toastify"
import { MediaAPI } from "src/Apis/media.api"
import { isError422 } from "src/Helpers/utils"
import { createSearchParams, useNavigate } from "react-router-dom"
import omitBy from "lodash/omitBy"
import isUndefined from "lodash/isUndefined"
import { omit } from "lodash"
import { cleanObject, convertDateTime } from "src/Helpers/common"
import { HttpStatusCode } from "src/Constants/httpStatus"
import NavigateBack from "src/Admin/Components/NavigateBack"
import CustomerItem from "./Components/CustomerItem"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import Skeleton from "src/Components/Skeleton"
import Pagination from "src/Components/Pagination"
import DateSelect from "src/Components/DateSelect"
import InputFileImage from "src/Components/InputFileImage"

type FormDataUpdate = Pick<
  SchemaAuthType,
  "id" | "email" | "name" | "numberPhone" | "avatar" | "date_of_birth" | "verify" | "created_at" | "updated_at"
>

const formDataUpdate = schemaAuth.pick([
  "id",
  "email",
  "name",
  "numberPhone",
  "avatar",
  "date_of_birth",
  "verify",
  "created_at",
  "updated_at"
])

type FormDataSearch = Pick<SchemaAuthType, "email" | "name" | "numberPhone">

export default function ManageCustomers() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Phân trang
  const queryParams: queryParamConfigCustomer = useQueryParams()
  const queryConfig: queryParamConfigCustomer = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit = 5
      email: queryParams.email,
      name: queryParams.name,
      phone: queryParams.phone
    },
    isUndefined
  )

  const { data, isFetching, isLoading, error, isError } = useQuery({
    queryKey: ["listCustomer", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.customer.getCustomers(queryConfig as queryParamConfig, controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 1 phút nó không gọi lại api
    placeholderData: keepPreviousData // giữ data cũ trong 1p
  })

  const result = data?.data as SuccessResponse<{
    result: UserType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
  }>
  const listCustomer = result?.result?.result
  const page_size = Math.ceil(Number(result?.result.total) / Number(result?.result.limit))

  const [idCustomer, setIdCustomer] = useState<string | null>(null)

  const handleEditItem = useCallback((id: string) => {
    setIdCustomer(id)
  }, [])

  const handleExitsEditItem = () => {
    setIdCustomer(null)
  }

  const getCustomerDetail = useQuery({
    queryKey: ["customer", idCustomer],
    queryFn: () => {
      return adminAPI.customer.getCustomerDetail(idCustomer as string)
    },
    enabled: Boolean(idCustomer) // chỉ chạy khi idCustomer có giá trị
  })
  const infoUser = getCustomerDetail.data?.data as SuccessResponse<{ result: UserType }>
  const profile = infoUser?.result?.result
  // console.log(idCustomer)
  // vì sao nó render 2 lần
  // lần 1 là component lần đầu mount (chạy console lần 1 + useQuery)
  // lần 2 là sau khi useQuery trả data về và re-render trang + chạy console lần 2

  const {
    register,
    formState: { errors },
    setValue,
    watch,
    control,
    handleSubmit,
    setError
  } = useForm<FormDataUpdate>({
    resolver: yupResolver(formDataUpdate),
    defaultValues: {
      id: "",
      email: "",
      name: "",
      numberPhone: "",
      avatar: "",
      date_of_birth: new Date(1990, 0, 1),
      verify: 0,
      created_at: "",
      updated_at: ""
    } // giá trị khởi tạo
  })

  // sau khi query idCustomer thì chạy useEffect
  // set value vào form
  useEffect(() => {
    if (profile) {
      if (profile.avatar === "") {
        setValue("avatar", avatarDefault)
      } else {
        setValue("avatar", profile.avatar)
      }
      setValue("id", profile._id)
      setValue("name", profile.name)
      setValue("email", profile.email)
      setValue("numberPhone", profile.numberPhone)
      setValue("verify", profile.verify)
      setValue("date_of_birth", new Date(profile.date_of_birth))
      setValue("created_at", convertDateTime(profile.created_at))
      setValue("updated_at", convertDateTime(profile.updated_at))
    }
  }, [profile, setValue])

  const [file, setFile] = useState<File>()

  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : ""
  }, [file])

  const handleChangeImage = (file?: File) => {
    setFile(file)
  }

  const avatarWatch = watch("avatar")
  const date_of_birth = watch("date_of_birth")

  const updateProfileMutation = useMutation({
    mutationFn: (body: { body: UpdateBodyReq; id: string }) => {
      return adminAPI.customer.updateProfileCustomer(body.id, body.body)
    }
  })

  const updateImageProfileMutation = useMutation({
    mutationFn: (body: { file: File; userId: string }) => {
      return MediaAPI.uploadImageProfile(body.file, body.userId)
    }
  })

  const handleSubmitUpdate = handleSubmit(async (data) => {
    try {
      let avatarName = avatarWatch
      if (file) {
        const avatar = await updateImageProfileMutation.mutateAsync({
          file: file as File,
          userId: idCustomer as string
        })
        avatarName = avatar.data.result.url
      }

      // Chuẩn bị dữ liệu cập nhật
      const updatedData: UpdateBodyReq = {
        avatar: avatarName as string,
        name: data.name,
        date_of_birth: data.date_of_birth
      }

      // Gửi request cập nhật
      updateProfileMutation.mutate(
        {
          body: {
            ...updatedData,
            numberPhone: data.numberPhone !== undefined ? data.numberPhone : undefined
          },
          id: idCustomer as string
        },
        {
          onSuccess: () => {
            toast.success("Cập nhật thành công!", { autoClose: 1500 })
            setIdCustomer(null)
            queryClient.invalidateQueries({ queryKey: ["listCustomer", queryConfig] })
          },
          onError: (error) => {
            if (isError422<ErrorResponse<FormDataUpdate>>(error)) {
              const formError = error.response?.data.errors
              if (formError?.name) {
                setError("name", {
                  message: (formError.name as any).msg
                })
              }
              if (formError?.numberPhone) {
                setError("numberPhone", {
                  message: (formError.numberPhone as any).msg
                })
              }
            }
          }
        }
      )
    } catch (error) {
      console.log("Lỗi submit: ", error)
    }
  })

  const deleteCustomerMutation = useMutation({
    mutationFn: (id: string) => {
      return adminAPI.customer.deleteProfileCustomer(id)
    }
  })

  const handleDeleteCustomer = (id: string) => {
    deleteCustomerMutation.mutate(id, {
      onSuccess: () => {
        // lấy ra query của trang hiện tại (có queryConfig)
        const data = queryClient.getQueryData(["listBrand", queryConfig])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data_2 = (data as any).data as SuccessResponse<{
          result: UserType[]
          total: string
          page: string
          limit: string
          totalOfPage: string
          listTotalProduct: { brand: string; total: string }[]
        }>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (data && data_2.result.result.length === 1 && Number(queryConfig.page) > 1) {
          navigate({
            pathname: path.AdminCustomers,
            search: createSearchParams({
              ...queryConfig,
              page: (Number(queryConfig.page) - 1).toString()
            }).toString()
          })
        }

        queryClient.invalidateQueries({ queryKey: ["listCustomer"] })
        toast.success("Xóa thành công!", { autoClose: 1500 })
      }
    })
  }

  const {
    register: registerFormSearch,
    handleSubmit: handleSubmitFormSearch,
    formState: { errors: formErrors },
    reset: resetFormSearch
  } = useForm<FormDataSearch>()

  const handleSubmitSearch = handleSubmitFormSearch((data) => {
    const params = cleanObject({
      ...queryConfig,
      email: data.email,
      name: data.name,
      phone: data.numberPhone
    })
    navigate({
      pathname: path.AdminCustomers,
      search: createSearchParams(params).toString()
    })
  })

  const handleResetFormSearch = () => {
    const filteredSearch = omit(queryConfig, ["email", "name", "phone"])
    resetFormSearch()
    navigate({ pathname: path.AdminCustomers, search: createSearchParams(filteredSearch).toString() })
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
        <title>Quản lý khách hàng</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />
      <div className="text-lg font-bold py-2 text-[#3A5BFF]">Khách hàng</div>
      <div className="p-4 bg-white dark:bg-darkPrimary mb-3 border border-[#dedede] dark:border-darkBorder rounded-md">
        <h1 className="text-[15px] font-medium">Tìm kiếm</h1>
        <div>
          <form onSubmit={handleSubmitSearch} className="mt-1 flex items-center gap-4">
            <Input
              name="email"
              register={registerFormSearch}
              placeholder="Nhập email"
              messageErrorInput={formErrors.email?.message}
              classNameInput="p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
              className="relative flex-1 basis-2/3"
              classNameError="hidden"
            />
            <Input
              name="name"
              register={registerFormSearch}
              placeholder="Nhập họ tên"
              messageErrorInput={formErrors.name?.message}
              classNameInput="p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
              className="relative flex-1 basis-1/3"
              classNameError="hidden"
            />
            <Input
              name="numberPhone"
              register={registerFormSearch}
              placeholder="Nhập số điện thoại"
              messageErrorInput={formErrors.numberPhone?.message}
              classNameInput="p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
              className="relative flex-1 basis-1/3"
              classNameError="hidden"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleResetFormSearch}
                type="button"
                icon={<X size={15} />}
                classNameButton="p-2 bg-[#f2f2f2] border border-[#dedede] w-full text-black font-medium hover:bg-[#dedede]/80 rounded-md duration-200 text-[13px] flex items-center gap-1 h-[35px]"
              />
              <Button
                type="submit"
                icon={<Search size={15} />}
                classNameButton="py-2 px-3 bg-blue-500 w-full text-white font-medium hover:bg-blue-500/80 rounded-md duration-200 text-[13px] flex items-center gap-1 h-[35px]"
              />
            </div>
          </form>
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              icon={<Filter size={15} />}
              nameButton="Bộ lọc"
              classNameButton="p-2 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-md hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1"
            />
            <Button
              icon={<FolderUp size={15} />}
              nameButton="Export"
              classNameButton="p-2 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-md hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1"
            />
            <Button
              icon={<Plus size={15} />}
              nameButton="Thêm mới"
              classNameButton="p-2 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
            />
          </div>
        </div>
        <div>
          {isLoading && <Skeleton />}
          {!isFetching && (
            <div>
              <div className="mt-4">
                <div className="bg-[#f2f2f2] dark:bg-darkPrimary grid grid-cols-12 items-center gap-2 py-3 border border-[#dedede] dark:border-darkBorder px-4 rounded-tl-md rounded-tr-md">
                  <div className="col-span-2 text-[14px] font-medium">ID</div>
                  <div className="col-span-2 text-[14px] font-medium">Họ Tên</div>
                  <div className="col-span-2 text-[14px] font-medium">Email</div>
                  <div className="col-span-1 text-[14px] text-center font-medium">Số điện thoại</div>
                  <div className="col-span-2 text-[14px] text-center font-medium">Trạng thái</div>
                  <div className="col-span-2 text-[14px] font-medium">Ngày cập nhật</div>
                  <div className="col-span-1 text-[14px] text-center font-medium">Hành động</div>
                </div>
                <div>
                  {listCustomer.length > 0 ? (
                    listCustomer?.map((item) => (
                      <Fragment key={item._id}>
                        <CustomerItem onDelete={handleDeleteCustomer} handleEditItem={handleEditItem} item={item} />
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
                pathNavigate={path.AdminCustomers}
              />
              {idCustomer !== null ? (
                <Fragment>
                  <div className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60 "></div>
                  <div className="z-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <button onClick={handleExitsEditItem} className="absolute right-2 top-1">
                      <X color="gray" size={22} />
                    </button>
                    <form onSubmit={handleSubmitUpdate} className="p-4 bg-white dark:bg-darkPrimary rounded-md">
                      <h3 className="text-[15px] font-medium">Thông tin khách hàng</h3>
                      <div className="mt-4 grid grid-cols-12 flex-wrap gap-4">
                        <div className="col-span-4">
                          <Input
                            name="id"
                            register={register}
                            placeholder="Nhập họ tên"
                            messageErrorInput={errors.id?.message}
                            classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                            className="relative flex-1"
                            nameInput="Id"
                            disabled
                          />
                        </div>
                        <div className="col-span-4">
                          <Input
                            name="email"
                            register={register}
                            placeholder="Nhập họ tên"
                            messageErrorInput={errors.email?.message}
                            classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                            className="relative flex-1"
                            nameInput="Email"
                            disabled
                          />
                        </div>
                        <div className="col-span-4">
                          <Input
                            name="name"
                            register={register}
                            placeholder="Nhập họ tên"
                            messageErrorInput={errors.name?.message}
                            classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                            className="relative flex-1"
                            nameInput="Họ tên"
                          />
                        </div>

                        <div className="col-span-4">
                          <Input
                            name="verify"
                            register={register}
                            messageErrorInput={errors.verify?.message}
                            classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                            className="relative flex-1"
                            nameInput="Trạng thái"
                            disabled
                            value={profile?.verify === 1 ? "Verified" : "Unverified"}
                          />
                        </div>

                        <div className="col-span-4">
                          <Input
                            name="numberPhone"
                            register={register}
                            placeholder="Nhập số điện thoại"
                            messageErrorInput={errors.numberPhone?.message}
                            classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                            className="relative flex-1"
                            nameInput="Số điện thoại"
                          />
                        </div>

                        <div className="col-span-4">
                          {/* dùng <Controller/> khi và chỉ khi component không hỗ trợ register (register giúp theo dõi giá trị trong form) */}
                          <Controller
                            name="date_of_birth"
                            control={control}
                            render={({ field }) => {
                              // console.log("field value: ", field.value)
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

                        <div className="col-span-4">
                          <Input
                            name="created_at"
                            register={register}
                            placeholder="Nhập ngày khởi tạo"
                            messageErrorInput={errors.created_at?.message}
                            classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                            className="relative flex-1"
                            nameInput="Ngày tạo"
                            disabled
                          />
                        </div>

                        <div className="col-span-4">
                          <Input
                            name="updated_at"
                            register={register}
                            placeholder="Nhập ngày cập nhật"
                            messageErrorInput={errors.updated_at?.message}
                            classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                            className="relative flex-1"
                            nameInput="Ngày cập nhật"
                            disabled
                          />
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="mb-2">Avatar</div>
                        <img
                          src={previewImage || avatarWatch}
                          className="h-28 w-28 rounded-full mx-auto"
                          alt="avatar default"
                        />
                        <InputFileImage onChange={handleChangeImage} />
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
          )}
        </div>
      </div>
    </div>
  )
}
