/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FolderUp, Plus, Search, X } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { Controller, useForm } from "react-hook-form"
import { adminAPI } from "src/Apis/admin.api"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import Pagination from "src/Components/Pagination"
import Skeleton from "src/Components/Skeleton"
import { path } from "src/Constants/path"
import useQueryParams from "src/Hook/useQueryParams"
import { queryParamConfig, queryParamConfigCustomer } from "src/Types/queryParams.type"
import { User } from "src/Types/user.type"
import { ErrorResponse, SuccessResponse } from "src/Types/utils.type"
import { Fragment } from "react/jsx-runtime"
import { useCallback, useEffect, useMemo, useState } from "react"
import CustomerItem from "./Components/CustomerItem"
import avatarDefault from "src/Assets/img/avatarDefault.png"
import InputFileImage from "src/Components/InputFileImage"
import { UpdateBodyReq } from "src/Types/product.type"
import { toast } from "react-toastify"
import { MediaAPI } from "src/Apis/media.api"
import DateSelect from "../../../Components/DateSelect"
import { isError422 } from "src/Helpers/utils"
import { createSearchParams, useNavigate } from "react-router-dom"

type FormData = Pick<SchemaAuthType, "email" | "name" | "numberPhone" | "avatar" | "date_of_birth" | "verify">
const formData = schemaAuth.pick(["email", "name", "numberPhone", "avatar", "date_of_birth", "verify"])

type FormDataSearch = Pick<SchemaAuthType, "email" | "name" | "numberPhone">

export default function ManageCustomers() {
  const queryClient = useQueryClient()
  // Phân trang
  const queryParams: queryParamConfigCustomer = useQueryParams()
  const queryConfig: queryParamConfigCustomer = {
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

  const [idCustomer, setIdCustomer] = useState<string | null>(null)
  const handleEditItem = useCallback((id: string) => {
    setIdCustomer(id)
  }, [])

  const getInfoCustomer = useQuery({
    queryKey: ["customer", idCustomer],
    queryFn: () => {
      return adminAPI.getCustomer(idCustomer as string)
    },
    enabled: Boolean(idCustomer) // chỉ chạy khi idCustomer có giá trị
  })
  const infoUser = getInfoCustomer.data?.data as SuccessResponse<{ result: User }>
  const profile = infoUser?.result?.result
  // console.log(idCustomer)
  // vì sao nó render 2 lần
  // lần 1 là component lần đầu mount (chạy console lần 1 + useQuery)
  // lần 2 là sau khi useQuery trả data về và re-render trang + chạy console lần 2

  const handleExitsEditItem = () => {
    setIdCustomer(null)
  }

  const {
    register,
    formState: { errors },
    setValue,
    watch,
    control,
    handleSubmit,
    setError
  } = useForm<FormData>({
    resolver: yupResolver(formData),
    defaultValues: {
      email: "",
      name: "",
      numberPhone: "",
      avatar: "",
      date_of_birth: new Date(1990, 0, 1),
      verify: 0
    } // giá trị khởi tạo
  })

  // sau khi query idCustomer thì chạy useEffect
  useEffect(() => {
    if (profile) {
      if (profile.avatar === "") {
        setValue("avatar", avatarDefault)
      } else {
        setValue("avatar", profile.avatar)
      }
      setValue("name", profile.name)
      setValue("email", profile.email)
      setValue("numberPhone", profile.numberPhone)
      setValue("verify", profile.verify)
      setValue("date_of_birth", new Date(profile.date_of_birth))
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
      return adminAPI.updateProfileCustomer(body.id, body.body)
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
            if (isError422<ErrorResponse<FormData>>(error)) {
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
      return adminAPI.deleteProfileCustomer(id)
    }
  })

  const handleDeleteCustomer = (id: string) => {
    deleteCustomerMutation.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["listCustomer", queryConfig] })
        toast.success("Xóa thành công!", { autoClose: 1500 })
      }
    })
  }

  const {
    register: registerFormSearch,
    handleSubmit: handleSubmitFormSearch,
    formState: { errors: formErrors }
  } = useForm<FormDataSearch>()

  const navigate = useNavigate()
  const handleSubmitSearch = handleSubmitFormSearch((data) => {
    let bodySendSubmit = { ...queryConfig }
    if (data.email) {
      bodySendSubmit = {
        email: data.email
      }
    }
    if (data.numberPhone) {
      bodySendSubmit = {
        phone: data.numberPhone
      }
    }
    if (data.name) {
      bodySendSubmit = {
        name: data.name
      }
    }
    navigate({
      pathname: path.AdminCustomers,
      search: createSearchParams(bodySendSubmit).toString()
    })
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
        <form onSubmit={handleSubmitSearch} className="mt-1">
          <div className="flex items-center gap-4">
            <Input
              name="email"
              register={registerFormSearch}
              placeholder="Nhập email"
              messageErrorInput={formErrors.email?.message}
              classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md"
              className="relative flex-1"
              nameInput="Email"
            />
            <Input
              name="name"
              register={registerFormSearch}
              placeholder="Nhập họ tên"
              messageErrorInput={formErrors.name?.message}
              classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md"
              className="relative flex-1"
              nameInput="Họ tên"
            />
            <Input
              name="numberPhone"
              register={registerFormSearch}
              placeholder="Nhập số điện thoại"
              messageErrorInput={formErrors.numberPhone?.message}
              classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md"
              className="relative flex-1"
              nameInput="Số điện thoại"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="submit"
              icon={<Search size={15} />}
              nameButton="Tìm kiếm"
              classNameButton="p-2 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
            />
            <Button
              type="button"
              icon={<X size={15} />}
              nameButton="Xóa"
              classNameButton="p-2 bg-white border border-[#dedede] w-full text-black font-medium rounded-md hover:bg-[#dedede]/80 duration-200 text-[13px] flex items-center gap-1"
            />
          </div>
        </form>
      </div>
      <div>
        <div className="bg-white border border-b-0 border-[#dedede] p-4 flex items-center justify-between rounded-tl-md rounded-tr-md">
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
              <div className="bg-[#f2f2f2] grid grid-cols-12 items-center gap-2 py-3 border border-[#dedede] px-4">
                <div className="col-span-2 text-[14px] font-medium">ID</div>
                <div className="col-span-2 text-[14px] font-medium">Họ Tên</div>
                <div className="col-span-2 text-[14px] font-medium">Email</div>
                <div className="col-span-1 text-[14px] text-center font-medium">Số điện thoại</div>
                <div className="col-span-2 text-[14px] text-center font-medium">Trạng thái</div>
                <div className="col-span-2 text-[14px] font-medium">Ngày cập nhật</div>
                <div className="col-span-1 text-[14px] text-center font-medium">Hành động</div>
              </div>
              <div>
                {result?.result?.result?.map((item) => (
                  <Fragment key={item._id}>
                    <CustomerItem onDelete={handleDeleteCustomer} handleEditItem={handleEditItem} item={item} />
                  </Fragment>
                ))}
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
                  <form onSubmit={handleSubmitUpdate} className="p-4 bg-white rounded-md">
                    <h3 className="text-[15px] font-medium">Thông tin khách hàng</h3>
                    <div className="mt-4 flex items-center gap-4">
                      <Input
                        name="email"
                        register={register}
                        placeholder="Nhập họ tên"
                        messageErrorInput={errors.email?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Email"
                        disabled
                      />
                    </div>
                    <div className="mt-2 flex items-center gap-4">
                      <Input
                        name="name"
                        register={register}
                        placeholder="Nhập họ tên"
                        messageErrorInput={errors.name?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-white focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Họ tên"
                      />
                      <Input
                        name="numberPhone"
                        register={register}
                        placeholder="Nhập số điện thoại"
                        messageErrorInput={errors.numberPhone?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-white focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Số điện thoại"
                      />
                    </div>
                    <div className="mt-2 flex items-center gap-4">
                      <Input
                        name="verify"
                        register={register}
                        placeholder="Nhập họ tên"
                        messageErrorInput={errors.verify?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Trạng thái"
                        disabled
                        value={profile?.verify === 1 ? "Verified" : "Unverified"}
                      />

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
        ) : (
          ""
        )}
      </div>
    </div>
  )
}
