/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowUpFromLine, ArrowUpNarrowWide, FolderUp, Plus, RotateCcw, Search, X } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { Controller, useForm } from "react-hook-form"
import { adminAPI } from "src/Apis/admin.api"
import { schemaAuth, SchemaAuthType, schemaCustomer, SchemaCustomerType } from "src/Client/Utils/rule"
import { path } from "src/Constants/path"
import useQueryParams from "src/Hook/useQueryParams"
import { queryParamConfig, queryParamConfigCustomer } from "src/Types/queryParams.type"
import { UserType } from "src/Types/user.type"
import { ErrorResponse, SuccessResponse } from "src/Types/utils.type"
import { useEffect, useMemo, useState } from "react"
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
import DatePicker from "../../Components/DatePickerRange"
import useDownloadExcel from "src/Hook/useDownloadExcel"
import { motion, AnimatePresence } from "framer-motion"
import AddCustomer from "./Components/AddCustomer"
import { Collapse, CollapseProps, Empty, Select } from "antd"
import "../ManageOrders/ManageOrders.css"
import { useTheme } from "src/Admin/Components/Theme-provider/Theme-provider"

const formDataUpdate = schemaAuth.pick([
  "id",
  "name",
  "email",
  "verify",
  "numberPhone",
  "date_of_birth",
  "created_at",
  "updated_at",
  "avatar"
]) // giúp validate các field trong form

type FormDataUpdate = Pick<
  SchemaAuthType,
  "id" | "name" | "email" | "verify" | "numberPhone" | "date_of_birth" | "created_at" | "updated_at" | "avatar"
> // các field (type) trong 1 form

const formDataSearch = schemaCustomer.pick([
  "email",
  "name",
  "numberPhone",
  "verify",
  "created_at_start",
  "created_at_end",
  "updated_at_start",
  "updated_at_end"
])

type FormDataSearch = Pick<
  SchemaCustomerType,
  | "email"
  | "name"
  | "numberPhone"
  | "verify"
  | "created_at_start"
  | "created_at_end"
  | "updated_at_start"
  | "updated_at_end"
>

export default function ManageCustomers() {
  const { theme } = useTheme()
  const isDark = theme === "dark" || theme === "system"
  const { downloadExcel } = useDownloadExcel()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // xử lý lấy query-params
  const queryParams: queryParamConfigCustomer = useQueryParams()
  const queryConfig: queryParamConfigCustomer = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit = 5
      email: queryParams.email,
      name: queryParams.name,
      phone: queryParams.phone,
      verify: queryParams.verify,
      created_at_start: queryParams.created_at_start,
      created_at_end: queryParams.created_at_end,
      updated_at_start: queryParams.updated_at_start,
      updated_at_end: queryParams.updated_at_end,

      sortBy: queryParams.sortBy || "new" // mặc định sort mới nhất
    },
    isUndefined
  )

  // Gọi api danh sách + query-params và xử lý phân trang
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
    staleTime: 3 * 60 * 1000, // dưới 3 phút nó không gọi lại api
    placeholderData: keepPreviousData // giữ data cũ trong 3p
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

  // xử lý gọi api chi tiết
  const [addItem, setAddItem] = useState<boolean | UserType | null>(null)

  // console.log("chạy")
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
      name: "",
      email: "",
      verify: 0,
      numberPhone: "",
      date_of_birth: new Date(1990, 0, 1),
      created_at: "",
      updated_at: "",
      avatar: ""
    } // giá trị khởi tạo
  })

  // sau khi có addItem thì chạy useEffect
  // set value vào form
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
      setValue("numberPhone", addItem.numberPhone)
      setValue("verify", addItem.verify)
      setValue("date_of_birth", new Date(addItem.date_of_birth))
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

  // Gọi api cập nhật và fetch lại api
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
          userId: (addItem as UserType)._id as string
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
          id: (addItem as UserType)._id as string
        },
        {
          onSuccess: () => {
            toast.success("Cập nhật thành công!", { autoClose: 1500 })
            setAddItem(null)
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

  // Gọi api xóa và fetch lại api
  const deleteCustomerMutation = useMutation({
    mutationFn: (id: string) => {
      return adminAPI.customer.deleteProfileCustomer(id)
    }
  })

  const handleDeleteCustomer = (id: string) => {
    deleteCustomerMutation.mutate(id, {
      onSuccess: () => {
        // lấy ra query của trang hiện tại (có queryConfig)
        const data = queryClient.getQueryData(["listCustomer", queryConfig])
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
      },
      onError: (error: any) => {
        if (
          error.response.status === HttpStatusCode.Forbidden ||
          error.response.data.message === "Không có quyền truy cập!"
        )
          toast.error("Không có quyền truy cập", { autoClose: 1500 })
      }
    })
  }

  // Xử lý bộ lọc tìm kiếm và fetch lại api
  const {
    register: registerFormSearch,
    handleSubmit: handleSubmitFormSearch,
    formState: { errors: formErrors },
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
        page: 1,
        sortBy: "new",
        email: data.email,
        name: data.name,
        phone: data.numberPhone,
        verify: data.verify,
        created_at_start: data.created_at_start?.toISOString(),
        created_at_end: data.created_at_end?.toISOString(),
        updated_at_start: data.updated_at_start?.toISOString(),
        updated_at_end: data.updated_at_end?.toISOString()
      })
      navigate({
        pathname: path.AdminCustomers,
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
      "email",
      "name",
      "phone",
      "verify",
      "created_at_start",
      "created_at_end",
      "updated_at_start",
      "updated_at_end"
    ])
    resetFormSearch({
      name: "",
      email: "",
      verify: undefined,
      numberPhone: "",
      created_at_start: undefined,
      created_at_end: undefined,
      updated_at_start: undefined,
      updated_at_end: undefined
    })
    navigate({ pathname: path.AdminCustomers, search: createSearchParams(filteredSearch).toString() })
  }

  // xử lý sort ds
  const handleChangeSortListOrder = (value: string) => {
    const body = {
      ...queryConfig,
      sortBy: value
    }
    navigate({
      pathname: `${path.AdminCustomers}`,
      search: createSearchParams(body).toString()
    })
  }

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: <h1 className="text-[16px] font-semibold tracking-wide text-black dark:text-white">Bộ lọc & Tìm kiếm</h1>,
      children: (
        <section className="bg-white dark:bg-darkPrimary mb-3 dark:border-darkBorder rounded-2xl">
          <form onSubmit={handleSubmitSearch}>
            <div className="mt-1 grid grid-cols-2">
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary border border-[#dadada] rounded-tl-xl">
                <span className="w-1/3 dark:text-white">Email</span>
                <div className="w-2/3 relative h-full">
                  <Input
                    name="email"
                    register={registerFormSearch}
                    placeholder="Nhập email"
                    messageErrorInput={formErrors.email?.message}
                    classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md text-black dark:text-white"
                    className="relative mt-2"
                    classNameError="hidden"
                  />
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary  border border-[#dadada] rounded-tr-xl">
                <span className="w-1/3 dark:text-white">Họ tên</span>
                <div className="w-2/3 relative h-full">
                  <Input
                    name="name"
                    register={registerFormSearch}
                    placeholder="Nhập họ tên"
                    messageErrorInput={formErrors.name?.message}
                    classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md text-black dark:text-white"
                    className="relative mt-2"
                    classNameError="hidden"
                  />
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkPrimary border border-[#dadada] border-t-0">
                <span className="w-1/3 dark:text-white">Số điện thoại</span>
                <div className="w-2/3 relative h-full">
                  <Input
                    name="numberPhone"
                    register={registerFormSearch}
                    placeholder="Nhập số điện thoại"
                    messageErrorInput={formErrors.numberPhone?.message}
                    classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md text-black dark:text-white"
                    className="relative mt-2"
                    classNameError="hidden"
                  />
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkPrimary border border-[#dadada] border-t-0">
                <span className="w-1/3 dark:text-white">Trạng thái</span>
                <div className="w-2/3 relative h-full">
                  <Controller
                    name="verify"
                    control={controlFormSearch}
                    render={({ field }) => {
                      return (
                        <select
                          // {...field}
                          value={field.value ?? ""} // ✅ Giá trị từ form
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} // ✅ Cập nhật vào form
                          className="p-2 border border-gray-300 dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond w-full mt-2 rounded-md dark:text-white"
                        >
                          <option value="" disabled>
                            -- Chọn trạng thái --
                          </option>
                          <option value="1">Verify</option>
                          <option value="0">Unverified</option>
                        </select>
                      )
                    }}
                  />
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary border border-[#dadada] rounded-bl-xl border-t-0">
                <span className="w-1/3 dark:text-white">Ngày tạo</span>
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
                    <span className="text-black dark:text-white">-</span>
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
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary  border border-[#dadada] border-t-0 rounded-br-xl">
                <span className="w-1/3 dark:text-white">Ngày cập nhật</span>
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
                    <span className="text-black dark:text-white">-</span>
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
            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={handleResetFormSearch}
                type="button"
                icon={<RotateCcw size={15} />}
                nameButton="Xóa bộ lọc"
                classNameButton="py-2 px-3 bg-[#f2f2f2] border border-[#dedede] w-full text-black font-medium hover:bg-[#dedede]/80 rounded-3xl duration-200 text-[13px] flex items-center gap-1 h-[35px]"
              />
              <Button
                type="submit"
                icon={<Search size={15} />}
                nameButton="Tìm kiếm"
                classNameButton="py-2 px-3 bg-blue-500 w-full text-white font-medium hover:bg-blue-500/80 rounded-3xl duration-200 text-[13px] flex items-center gap-1 h-[35px]"
              />
            </div>
          </form>
        </section>
      )
    },
    {
      key: "2",
      label: (
        <h2 className="text-[16px] font-semibold tracking-wide text-black dark:text-white">Danh sách Khách hàng</h2>
      ),
      children: (
        <section className="bg-white dark:bg-darkPrimary mb-3 dark:border-darkBorder rounded-2xl">
          <div>
            {isLoading && <Skeleton />}
            {!isFetching && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => downloadExcel(listCustomer)}
                      icon={<FolderUp size={15} />}
                      nameButton="Export"
                      classNameButton="py-2 px-3 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-3xl hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1"
                    />
                    <Select
                      defaultValue="Mới nhất"
                      className="select-sort"
                      onChange={handleChangeSortListOrder}
                      suffixIcon={<ArrowUpNarrowWide color={isDark ? "white" : "black"} />}
                      options={[
                        { value: "old", label: "Cũ nhất" },
                        { value: "new", label: "Mới nhất" }
                      ]}
                    />
                  </div>
                  <div>
                    <Button
                      onClick={() => setAddItem(true)}
                      icon={<Plus size={15} />}
                      nameButton="Thêm mới"
                      classNameButton="py-2 px-3 bg-blue-500 w-full text-white font-medium rounded-3xl hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
                    />
                  </div>
                </div>
                <div>
                  <div className="bg-[#f2f2f2] dark:bg-darkPrimary grid grid-cols-10 items-center gap-2 py-3 border border-[#dedede] dark:border-darkBorder px-4 rounded-tl-xl rounded-tr-xl">
                    <div className="col-span-2 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                      Mã khách hàng
                    </div>
                    <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                      Họ Tên
                    </div>
                    <div className="col-span-2 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                      Email
                    </div>
                    <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase text-black dark:text-white">
                      Số điện thoại
                    </div>
                    <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase text-black dark:text-white">
                      Trạng thái
                    </div>
                    <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                      Ngày tạo
                    </div>
                    <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                      Ngày cập nhật
                    </div>
                    <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase text-black dark:text-white">
                      Hành động
                    </div>
                  </div>
                  <div>
                    {listCustomer?.length > 0 ? (
                      listCustomer?.map((item, index) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <CustomerItem
                            onDelete={handleDeleteCustomer}
                            handleEditItem={(item) => setAddItem(item)}
                            item={item}
                            maxIndex={listCustomer?.length}
                            index={index}
                          />
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center mt-4">
                        <Empty />
                      </div>
                    )}
                  </div>
                </div>
                <Pagination
                  data={result}
                  queryConfig={queryConfig}
                  page_size={page_size}
                  pathNavigate={path.AdminCustomers}
                />

                <AnimatePresence>
                  {addItem !== null && typeof addItem === "object" && (
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
                        <button onClick={() => setAddItem(null)} className="absolute right-2 top-2">
                          <X color="gray" size={22} />
                        </button>
                        <form
                          onSubmit={handleSubmitUpdate}
                          className="bg-white dark:bg-darkPrimary rounded-xl min-w-[900px]"
                        >
                          <h3 className="py-2 px-4 text-lg font-semibold tracking-wide rounded-md text-black dark:text-white">
                            Thông tin khách hàng
                          </h3>
                          <div className="p-4 pt-0">
                            <div className="mt-4 flex justify-between gap-8">
                              <div className="grid grid-cols-12 flex-wrap gap-4">
                                <div className="col-span-6">
                                  <Input
                                    name="id"
                                    register={register}
                                    placeholder="Nhập họ tên"
                                    messageErrorInput={errors.id?.message}
                                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                                    className="relative flex-1"
                                    classNameLabel="text-black dark:text-white"
                                    nameInput="Mã khách hàng"
                                    disabled
                                  />
                                </div>
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
                                    placeholder="Nhập họ tên"
                                    messageErrorInput={errors.email?.message}
                                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                                    className="relative flex-1"
                                    classNameLabel="text-black dark:text-white"
                                    nameInput="Email"
                                    disabled
                                  />
                                </div>
                                <div className="col-span-6">
                                  <Input
                                    name="verify"
                                    register={register}
                                    messageErrorInput={errors.verify?.message}
                                    classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                                    className="relative flex-1"
                                    nameInput="Trạng thái"
                                    classNameLabel="text-black dark:text-white"
                                    disabled
                                    value={addItem?.verify === 1 ? "Verified" : "Unverified"}
                                  />
                                </div>
                                <div className="col-span-6">
                                  <Input
                                    name="numberPhone"
                                    register={register}
                                    placeholder="Nhập số điện thoại"
                                    messageErrorInput={errors.numberPhone?.message}
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

                              <div className="flex items-center justify-center flex-col bg-[#dadada] rounded-sm px-4 shadow-sm">
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
                                icon={<ArrowUpFromLine size={18} />}
                                nameButton="Cập nhật"
                                classNameButton="w-[120px] p-4 py-2 bg-blue-500 mt-2 w-full text-white font-semibold rounded-3xl hover:bg-blue-500/80 duration-200 flex items-center gap-1"
                              />
                            </div>
                          </div>
                        </form>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>{addItem === true && <AddCustomer setAddItem={setAddItem} />}</AnimatePresence>
              </div>
            )}
          </div>
        </section>
      )
    }
  ]

  useEffect(() => {
    if (isError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (error as any).response?.data?.message
      const status = (error as any)?.response?.status
      if (message === "Không có quyền truy cập!") {
        toast.error(message, { autoClose: 1500 })
      }
      if (status === HttpStatusCode.NotFound) {
        navigate(path.AdminNotFound, { replace: true })
      }
    }
  }, [isError, error, navigate])

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
      <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
        Khách hàng
      </h1>

      <Collapse items={items} defaultActiveKey={["2"]} className="bg-white dark:bg-darkPrimary dark:border-none" />
    </div>
  )
}
