/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { isUndefined, omit, omitBy } from "lodash"
import { Helmet } from "react-helmet-async"
import { createSearchParams, useNavigate } from "react-router-dom"
import NavigateBack from "src/Admin/Components/NavigateBack"
import Skeleton from "src/Components/Skeleton"
import useQueryParams from "src/Hook/useQueryParams"
import { queryParamConfigSupplier } from "src/Types/queryParams.type"
import { path } from "src/Constants/path"
import { ErrorResponse, MessageResponse, SuccessResponse } from "src/Types/utils.type"
import { SupplierItemType, UpdateSupplierBodyReq } from "src/Types/product.type"
import { HttpStatusCode } from "src/Constants/httpStatus"
import Button from "src/Components/Button"
import { useEffect, useState } from "react"
import {
  ArrowUpFromLine,
  ArrowUpNarrowWide,
  ClipboardCheck,
  FolderUp,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X
} from "lucide-react"
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
import { isError400, isError422 } from "src/Helpers/utils"
import AddSupplier from "./Components/AddSupplier"
import useDownloadExcel from "src/Hook/useDownloadExcel"
import { motion, AnimatePresence } from "framer-motion"
import { Collapse, CollapseProps, Empty, Modal, Select, Table } from "antd"
import "../ManageOrders/ManageOrders.css"
import { useTheme } from "src/Admin/Components/Theme-provider/Theme-provider"
import { ColumnsType } from "antd/es/table"
import { SupplierAPI } from "src/Apis/admin/supplier.api"
import useSortList from "src/Hook/useSortList"

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
  const { theme } = useTheme()
  const isDarkMode = theme === "dark" || theme === "system"
  const navigate = useNavigate()
  const { handleSort } = useSortList()
  const { downloadExcel } = useDownloadExcel()
  // const queryClient = useQueryClient()
  const queryParams: queryParamConfigSupplier = useQueryParams()
  const queryConfig: queryParamConfigSupplier = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit =
      name: queryParams.name,
      email: queryParams.email,
      phone: queryParams.phone,
      contactName: queryParams.contactName,
      created_at_start: queryParams.created_at_start,
      created_at_end: queryParams.created_at_end,
      updated_at_start: queryParams.updated_at_start,
      updated_at_end: queryParams.updated_at_end,

      sortBy: queryParams.sortBy || "new" // mặc định sort mới nhất
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
      return SupplierAPI.getSuppliers(queryConfig as queryParamConfigSupplier, controller.signal)
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

  // xử lý gọi api chi tiết
  const [addItem, setAddItem] = useState<boolean | SupplierItemType | null>(null)

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
    if (addItem !== null && typeof addItem === "object") {
      setValue("id", addItem._id)
      setValue("name", addItem.name)
      setValue("contactName", addItem.contactName)
      setValue("email", addItem.email)
      setValue("address", addItem.address as string)
      setValue("phone", addItem.phone)
      setValue("description", addItem.description as string)
      setValue("taxCode", addItem.taxCode as string)
      setValue("created_at", convertDateTime(addItem.created_at))
      setValue("updated_at", convertDateTime(addItem.updated_at))
    }
  }, [addItem, setValue])

  const updateCategoryMutation = useMutation({
    mutationFn: (body: { id: string; body: UpdateSupplierBodyReq }) => {
      return SupplierAPI.updateSupplierDetail(body.id, body.body)
    }
  })

  const handleSubmitUpdate = handleSubmit((data) => {
    updateCategoryMutation.mutate(
      { id: (addItem as SupplierItemType)._id as string, body: data },
      {
        onSuccess: () => {
          setAddItem(null)
          toast.success("Cập nhật thành công", { autoClose: 1500 })
          queryClient.invalidateQueries({ queryKey: ["listSupplier", queryConfig] })
        },
        onError: (error) => {
          // lỗi từ server trả về
          if (isError422<ErrorResponse<FormDataUpdate>>(error)) {
            const formError = error.response?.data.errors
            if (formError?.email)
              setError("email", {
                message: (formError.email as any).msg // lỗi 422 từ server trả về
              })
            if (formError?.name)
              setError("name", {
                message: (formError.name as any).msg // lỗi 422 từ server trả về
              })
          }
        }
      }
    )
  })

  const deleteSupplierMutation = useMutation({
    mutationFn: (id: string) => {
      return SupplierAPI.deleteSupplierDetail(id)
    }
  })

  const handleDeleteSupplier = (id: string) => {
    deleteSupplierMutation.mutate(id, {
      onSuccess: () => {
        const data = queryClient.getQueryData(["listSupplier", queryConfig])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data_2 = (data as any).data as SuccessResponse<{
          result: SupplierItemType[]
          total: string
          page: string
          limit: string
          totalOfPage: string
        }>
        if (data && data_2.result.result.length === 1 && Number(queryConfig.page) > 1) {
          navigate({
            pathname: path.AdminSuppliers,
            search: createSearchParams({
              ...queryConfig,
              page: (Number(queryConfig.page) - 1).toString()
            }).toString()
          })
        }
        queryClient.invalidateQueries({ queryKey: ["listSupplier"] })
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
        page: 1,
        sortBy: "new",
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

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: <h1 className="text-[16px] font-semibold tracking-wide text-black dark:text-white">Bộ lọc & Tìm kiếm</h1>,
      children: (
        <section>
          <div className="bg-white dark:bg-darkPrimary mb-3 dark:border-darkBorder rounded-2xl">
            <form onSubmit={handleSubmitSearch}>
              <div className="mt-1 grid grid-cols-2">
                <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkPrimary border border-[#dadada] rounded-tl-xl">
                  <span className="w-1/3 dark:text-white">Tên nhà cung cấp</span>
                  <div className="w-2/3 relative h-full">
                    <div className="mt-2 w-full flex items-center gap-2">
                      <Input
                        name="name"
                        register={registerFormSearch}
                        placeholder="Nhập tên nhà cung cấp"
                        classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md text-black dark:text-white"
                        className="relative flex-grow"
                        classNameError="hidden"
                      />
                    </div>
                    <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                  </div>
                </div>
                <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkPrimary border border-[#dadada] rounded-tr-xl">
                  <span className="w-1/3 dark:text-white">Tên người đại diện</span>
                  <div className="w-2/3 relative h-full">
                    <div className="mt-2 w-full flex items-center gap-2">
                      <Input
                        name="contactName"
                        register={registerFormSearch}
                        placeholder="Nhập tên người đại diện"
                        classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md text-black dark:text-white"
                        className="relative flex-grow"
                        classNameError="hidden"
                      />
                    </div>
                    <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                  </div>
                </div>
                <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary border border-[#dadada] border-t-0">
                  <span className="w-1/3 dark:text-white">Email</span>
                  <div className="w-2/3 relative h-full">
                    <div className="mt-2 w-full flex items-center gap-2">
                      <Input
                        name="email"
                        register={registerFormSearch}
                        placeholder="Nhập email"
                        classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md text-black dark:text-white"
                        className="relative flex-grow"
                        classNameError="hidden"
                      />
                    </div>
                    <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                  </div>
                </div>
                <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary border border-[#dadada] border-t-0">
                  <span className="w-1/3 dark:text-white">Số điện thoại</span>
                  <div className="w-2/3 relative h-full">
                    <div className="mt-2 w-full flex items-center gap-2">
                      <Input
                        name="phone"
                        register={registerFormSearch}
                        placeholder="Nhập số điện thoại"
                        classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md text-black dark:text-white"
                        className="relative flex-grow"
                        classNameError="hidden"
                      />
                    </div>
                    <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                  </div>
                </div>
                <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkPrimary border border-[#dadada] border-t-0 rounded-bl-xl">
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
                <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkPrimary border border-[#dadada] border-t-0 rounded-br-xl">
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
                  classNameButton="py-2 px-3 bg-[#f2f2f2] border border-[#dedede] w-full text-black font-medium hover:bg-[#dedede]/80 rounded-md duration-200 text-[13px] flex items-center gap-1 h-[35px]"
                />
                <Button
                  type="submit"
                  icon={<Search size={15} />}
                  nameButton="Tìm kiếm"
                  classNameButton="py-2 px-3 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1 h-[35px]"
                  className="flex-shrink-0"
                />
              </div>
            </form>
          </div>
        </section>
      )
    }
  ]

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      toast.success("Đã sao chép ID", { autoClose: 1200 })
    } catch {
      toast.error("Sao chép thất bại", { autoClose: 1200 })
    }
  }

  const columns: ColumnsType<SupplierItemType> = [
    {
      title: "Mã nhà cung cấp",
      dataIndex: "_id",
      key: "_id",
      width: 240,
      render: (id: string) => (
        <div className="flex items-center justify-between">
          <div className="truncate w-[80%] text-blue-500">{id}</div>
          <button onClick={() => copyId(id)} className="p-1 border rounded ml-2">
            <ClipboardCheck color="#8d99ae" size={14} />
          </button>
        </div>
      )
    },
    {
      title: "Tên nhà cung cấp",
      dataIndex: "name",
      key: "name",
      width: 220,
      render: (name: string) => <div className="text-black dark:text-white break-words">{name}</div>
    },
    {
      title: "Người đại diện",
      dataIndex: "contactName",
      key: "contactName",
      width: 180,
      render: (v: string) => <div className="break-words text-black dark:text-white">{v}</div>
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      render: (v: string) => <div className="break-words text-black dark:text-white">{v}</div>
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 140,
      render: (v: string) => <div className="text-black dark:text-white">{v}</div>
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (v: string) => <div>{convertDateTime(v)}</div>
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 160,
      render: (v: string) => <div>{convertDateTime(v)}</div>
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setAddItem(record)} className="p-1">
            <Pencil color="orange" size={18} />
          </button>
          <button
            onClick={() =>
              Modal.confirm({
                title: "Bạn có chắc chắn muốn xóa?",
                content: "Không thể hoàn tác hành động này. Thao tác này sẽ xóa vĩnh viễn dữ liệu của bạn.",
                okText: "Xóa",
                okButtonProps: { danger: true },
                cancelText: "Hủy",
                onOk: () => handleDeleteSupplier(record._id)
              })
            }
            className="p-1"
          >
            <Trash2 color="red" size={18} />
          </button>
        </div>
      )
    }
  ]

  useEffect(() => {
    if (isError) {
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
        <title>Quản lý nhà cung cấp</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />
      <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
        Nhà cung cấp
      </h1>

      <Collapse items={items} defaultActiveKey={["2"]} className="bg-white dark:bg-darkPrimary dark:border-none" />

      <section className="mt-4">
        <div className="bg-white dark:bg-darkPrimary mb-3 dark:border-darkBorder rounded-2xl">
          {isLoading && <Skeleton />}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => downloadExcel(listSupplier)}
                icon={<FolderUp size={15} />}
                nameButton="Export"
                classNameButton="py-2 px-3 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-md hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1"
              />
              <Select
                defaultValue="Mới nhất"
                className="select-sort"
                onChange={(value) => handleSort(value, queryConfig, path.AdminSuppliers)}
                suffixIcon={<ArrowUpNarrowWide color={isDarkMode ? "white" : "black"} />}
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
                classNameButton="py-2 px-3 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
              />
            </div>
          </div>
          {!isFetching ? (
            <div>
              {listSupplier?.length > 0 ? (
                <Table
                  rowKey={(r) => r._id}
                  dataSource={listSupplier}
                  columns={columns}
                  loading={isLoading}
                  pagination={{
                    current: Number(queryConfig.page),
                    pageSize: Number(queryConfig.limit),
                    total: Number(result?.result.total || 0),
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "20", "50"],
                    onChange: (page, pageSize) => {
                      navigate({
                        pathname: path.AdminSuppliers,
                        search: createSearchParams({
                          ...queryConfig,
                          page: page.toString(),
                          limit: pageSize.toString()
                        }).toString()
                      })
                    }
                  }}
                  rowClassName={(_, index) => (index % 2 === 0 ? "bg-[#f2f2f2]" : "bg-white")}
                  scroll={{ x: "max-content" }}
                />
              ) : (
                <div className="text-center mt-4">
                  <Empty />
                </div>
              )}
            </div>
          ) : (
            <Skeleton />
          )}

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
                  <form onSubmit={handleSubmitUpdate} className="bg-white dark:bg-darkPrimary rounded-md w-[900px]">
                    <h3 className="py-2 px-4 text-lg font-semibold tracking-wide rounded-md text-black dark:text-white">
                      Thông tin nhà cung cấp
                    </h3>
                    <div className="p-4 pt-0">
                      <div className="mt-4 flex items-center gap-4">
                        <Input
                          name="id"
                          register={register}
                          placeholder="Nhập id"
                          messageErrorInput={errors.id?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                          className="relative flex-1"
                          classNameLabel="text-black dark:text-white"
                          nameInput="Mã nhà cung cấp"
                          disabled
                        />
                        <Input
                          name="taxCode"
                          register={register}
                          placeholder="Nhập tax-code"
                          messageErrorInput={errors.taxCode?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                          className="relative flex-1"
                          classNameLabel="text-black dark:text-white"
                          nameInput="Mã số thuế"
                          disabled
                        />
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <Input
                          name="name"
                          register={register}
                          placeholder="Nhập tên nhà cung cấp"
                          messageErrorInput={errors.name?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                          className="relative flex-1"
                          classNameLabel="text-black dark:text-white"
                          nameInput="Tên nhà cung cấp"
                        />
                        <Input
                          name="contactName"
                          register={register}
                          placeholder="Nhập họ tên"
                          messageErrorInput={errors.contactName?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                          className="relative flex-1"
                          classNameLabel="text-black dark:text-white"
                          nameInput="Tên người đại diện"
                        />
                      </div>
                      <div className="mt-4 flex items-center gap-4">
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
                      <div className="mt-4 flex items-center gap-4">
                        <Input
                          name="address"
                          register={register}
                          placeholder="Nhập địa chỉ"
                          messageErrorInput={errors.address?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                          className="relative flex-1"
                          classNameLabel="text-black dark:text-white"
                          nameInput="Địa chỉ"
                        />
                        <Input
                          name="description"
                          register={register}
                          placeholder="Nhập mô tả"
                          messageErrorInput={errors.description?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                          className="relative flex-1"
                          classNameLabel="text-black dark:text-white"
                          nameInput="Mô tả"
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
                      <div className="flex items-center justify-end">
                        <Button
                          type="submit"
                          icon={<ArrowUpFromLine size={18} />}
                          nameButton="Lưu thay đổi"
                          classNameButton="w-[120px] px-3 py-2 bg-blue-500 mt-2 w-full text-white font-semibold rounded-md hover:bg-blue-500/80 duration-200 flex items-center gap-1 shadow-xl text-[13px]"
                        />
                      </div>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AddSupplier setAddItem={setAddItem} addItem={addItem} />
        </div>
      </section>
    </div>
  )
}
