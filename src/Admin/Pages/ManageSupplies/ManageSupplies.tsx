/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { isUndefined, omit, omitBy } from "lodash"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { createSearchParams, useNavigate } from "react-router-dom"
import NavigateBack from "src/Admin/Components/NavigateBack"
import Button from "src/Components/Button"
import Skeleton from "src/Components/Skeleton"
import { path } from "src/Constants/path"
import useDownloadExcel from "src/Hook/useDownloadExcel"
import useQueryParams from "src/Hook/useQueryParams"
import { SupplyItemType } from "src/Types/product.type"
import { queryParamConfigSupply } from "src/Types/queryParams.type"
import { SuccessResponse } from "src/Types/utils.type"
import { ArrowUpNarrowWide, ClipboardCheck, FolderUp, Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react"
import { toast } from "react-toastify"
import { Controller, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { schemaSupply, SchemaSupplyType } from "src/Client/Utils/rule"
import { cleanObject, convertDateTime, formatCurrency } from "src/Helpers/common"
import DatePicker from "src/Admin/Components/DatePickerRange"
import AddSupply from "./Components/AddSupply/AddSupply"
import { HttpStatusCode } from "src/Constants/httpStatus"
import SupplyDetail from "./Components/SupplyDetail"
import { queryClient } from "src/main"
import DropdownSearch from "./Components/DropdownSearch"
import { AnimatePresence } from "framer-motion"
import { Collapse, CollapseProps, Empty, Modal, Select, Table } from "antd"
import "../ManageOrders/ManageOrders.css"
import { useTheme } from "src/Admin/Components/Theme-provider/Theme-provider"
import { ColumnsType } from "antd/es/table"
import { ProductAPI } from "src/Apis/admin/product.api"
import { SupplierAPI } from "src/Apis/admin/supplier.api"
import { SupplyAPI } from "src/Apis/admin/supply.api"
import useSortList from "src/Hook/useSortList"

type FormDataSearch = Pick<
  SchemaSupplyType,
  "name_product" | "name_supplier" | "created_at_start" | "created_at_end" | "updated_at_start" | "updated_at_end"
>

const formDataSearch = schemaSupply.pick([
  "name_product",
  "name_supplier",
  "created_at_start",
  "created_at_end",
  "updated_at_start",
  "updated_at_end"
])

export default function ManageSupplies() {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark" || theme === "system"

  const navigate = useNavigate()
  const { downloadExcel } = useDownloadExcel()
  const { handleSort } = useSortList()

  const queryParams: queryParamConfigSupply = useQueryParams()
  const queryConfig: queryParamConfigSupply = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit = 5
      name_product: queryParams.name_product,
      name_supplier: queryParams.name_supplier,
      created_at_start: queryParams.created_at_start,
      created_at_end: queryParams.created_at_end,
      updated_at_start: queryParams.updated_at_start,
      updated_at_end: queryParams.updated_at_end,

      sortBy: queryParams.sortBy || "new" // mặc định sort mới nhất
    },
    isUndefined
  )

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["listSupply", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return SupplyAPI.getSupplies(queryConfig as queryParamConfigSupply, controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 3 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<{
    result: SupplyItemType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
  }>
  const listSupply = result?.result?.result

  // xử lý tìm kiếm
  const getNameProducts = useQuery({
    queryKey: ["nameProduct"],
    queryFn: () => {
      return ProductAPI.getNameProducts()
    },
    retry: 0,
    staleTime: 15 * 60 * 1000,
    placeholderData: keepPreviousData
  })
  const listNameProduct = getNameProducts.data?.data as SuccessResponse<{
    result: string[]
  }>
  const listNameProductResult = listNameProduct?.result.result

  const getNameSuppliers = useQuery({
    queryKey: ["nameSupplier"],
    queryFn: () => {
      return SupplierAPI.getNameSuppliers()
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 15 * 60 * 1000, // dưới 1 phút nó không gọi lại api
    placeholderData: keepPreviousData // giữ data cũ trong 1p
  })
  const listNameSupplier = getNameSuppliers.data?.data as SuccessResponse<{
    result: string[]
  }>
  const listNameSupplierResult = listNameSupplier?.result.result

  const {
    register: registerFormSearch,
    handleSubmit: handleSubmitFormSearch,
    reset: resetFormSearch,
    control: controlFormSearch,
    setValue: setValueSearch,
    trigger
  } = useForm<FormDataSearch>({
    resolver: yupResolver(formDataSearch)
  })

  // component cha này sẽ quản lý giá trị này
  const [inputProductValue, setInputProductValue] = useState("")
  const [inputSupplierValue, setInputSupplierValue] = useState("")

  const handleSubmitSearch = handleSubmitFormSearch(
    (data) => {
      const params = cleanObject({
        ...queryConfig,
        page: 1,
        sortBy: "new",
        name_product: data.name_product,
        name_supplier: data.name_supplier,
        created_at_start: data.created_at_start?.toISOString(),
        created_at_end: data.created_at_end?.toISOString(),
        updated_at_start: data.updated_at_start?.toISOString(),
        updated_at_end: data.updated_at_end?.toISOString()
      })
      navigate({
        pathname: path.AdminSupplies,
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
      "name_product",
      "name_supplier",
      "created_at_start",
      "created_at_end",
      "updated_at_start",
      "updated_at_end"
    ])
    resetFormSearch()
    setInputProductValue("")
    setInputSupplierValue("")
    navigate({ pathname: path.AdminSupplies, search: createSearchParams(filteredSearch).toString() })
  }

  const deleteSupplyMutation = useMutation({
    mutationFn: (id: string) => {
      return SupplyAPI.deleteSupplyDetail(id)
    }
  })

  const handleDeleteSupply = (id: string) => {
    deleteSupplyMutation.mutate(id, {
      onSuccess: () => {
        const data = queryClient.getQueryData(["listSupply", queryConfig])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data_2 = (data as any).data as SuccessResponse<{
          result: SupplyItemType[]
          total: string
          page: string
          limit: string
          totalOfPage: string
        }>
        if (data && data_2.result.result.length === 1 && Number(queryConfig.page) > 1) {
          navigate({
            pathname: path.AdminSupplies,
            search: createSearchParams({
              ...queryConfig,
              page: (Number(queryConfig.page) - 1).toString()
            }).toString()
          })
        }
        queryClient.invalidateQueries({ queryKey: ["listSupply"] })
        toast.success("Xóa thành công!", { autoClose: 1500 })
      }
    })
  }

  const [addItem, setAddItem] = useState<null | SupplyItemType | boolean>(null)

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: <h1 className="text-[16px] font-semibold tracking-wide text-black dark:text-white">Bộ lọc & Tìm kiếm</h1>,
      children: (
        <section>
          <div className="bg-white dark:bg-darkPrimary mb-3 dark:border-darkBorder rounded-2xl">
            <form onSubmit={handleSubmitSearch}>
              <div className="mt-1 grid grid-cols-2">
                <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkPrimary border border-[#dadada] rounded-tl-md">
                  <span className="w-[25%] dark:text-white">Tên sản phẩm</span>
                  <div className="w-[75%] relative h-full">
                    <DropdownSearch
                      name="name_product"
                      namePlaceholder="Nhập tên sản phẩm"
                      register={registerFormSearch}
                      listItem={listNameProductResult}
                      onSelect={(item) => setValueSearch("name_product", item)}
                      value={inputProductValue}
                      onChangeValue={setInputProductValue}
                    />
                    <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                  </div>
                </div>
                <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkPrimary border border-[#dadada] rounded-tr-md">
                  <span className="w-[25%] dark:text-white">Tên nhà cung cấp</span>
                  <div className="w-[75%] relative h-full">
                    <DropdownSearch
                      name="name_supplier"
                      namePlaceholder="Nhập tên nhà cung cấp"
                      register={registerFormSearch}
                      listItem={listNameSupplierResult}
                      onSelect={(item) => setValueSearch("name_supplier", item)}
                      value={inputSupplierValue}
                      onChangeValue={setInputSupplierValue}
                    />
                    <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                  </div>
                </div>
                <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkPrimary border border-[#dadada] border-t-0 rounded-bl-md">
                  <span className="w-[25%] dark:text-white">Ngày tạo</span>
                  <div className="w-[75%] relative h-full">
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
                <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkPrimary border border-[#dadada] border-t-0 rounded-br-md">
                  <span className="w-[25%] dark:text-white">Ngày cập nhật</span>
                  <div className="w-[75%] relative h-full">
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

  const columns: ColumnsType<SupplyItemType> = [
    {
      title: "Mã cung ứng",
      dataIndex: "_id",
      key: "_id",
      width: 220,
      render: (id: string) => (
        <div className="flex items-center justify-between">
          <div className="text-blue-500 break-all max-w-[85%]">{id}</div>
          <button onClick={() => copyId(id)} className="p-1 ml-2">
            <ClipboardCheck color="#8d99ae" size={14} />
          </button>
        </div>
      )
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name_product",
      key: "name_product",
      width: 300,
      render: (_, record) => (
        <div className="break-words max-w-[420px] text-black dark:text-white">{record.productId[0].name || ""}</div>
      )
    },
    {
      title: "Tên nhà cung cấp",
      dataIndex: "name_supplier",
      key: "name_supplier",
      width: 220,
      render: (_, record) => <div className="break-words">{record.supplierId[0].name || ""}</div>
    },
    {
      title: "Giá nhập",
      dataIndex: "importPrice",
      key: "importPrice",
      width: 140,
      render: (v: number) => <div className="text-red-500 font-semibold">{v ? formatCurrency(v) + "đ" : ""}</div>
    },
    {
      title: "Thời gian cung ứng (Ngày)",
      dataIndex: "leadTimeDays",
      key: "leadTimeDays",
      width: 160,
      render: (_: string, record) => <div className="">{record.leadTimeDays ? `${record.leadTimeDays}` : ""}</div>
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
                onOk: () => handleDeleteSupply(record._id)
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
      const status = (error as any)?.response?.status
      if (status === HttpStatusCode.NotFound) {
        navigate(path.AdminNotFound, { replace: true })
      }
    }
  }, [isError, error, navigate])

  return (
    <div>
      <Helmet>
        <title>Quản lý cung ứng</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />
      <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
        Cung ứng sản phẩm
      </h1>

      <Collapse items={items} defaultActiveKey={["2"]} className="bg-white dark:bg-darkPrimary dark:border-none" />

      <section className="mt-4">
        <div className="bg-white dark:bg-darkSecond mb-3 dark:border-darkBorder rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => downloadExcel(listSupply)}
                icon={<FolderUp size={15} />}
                nameButton="Export"
                classNameButton="py-2 px-3 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-md hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1 text-[13px]"
              />
              <Select
                defaultValue="Mới nhất"
                className="select-sort"
                onChange={(value) => handleSort(value, queryConfig, path.AdminSupplies)}
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

          {isLoading ? (
            <Skeleton />
          ) : listSupply && listSupply.length > 0 ? (
            <Table
              rowKey={(r) => r._id}
              dataSource={listSupply}
              columns={columns}
              loading={isFetching}
              pagination={{
                current: Number(queryConfig.page),
                pageSize: Number(queryConfig.limit),
                total: Number(result?.result.total || 0),
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20", "50"],
                onChange: (page, pageSize) => {
                  navigate({
                    pathname: path.AdminSupplies,
                    search: createSearchParams({
                      ...queryConfig,
                      page: page.toString(),
                      limit: pageSize.toString()
                    }).toString()
                  })
                }
              }}
              rowClassName={(_, index) =>
                index % 2 === 0 ? "dark:bg-darkSecond bg-[#f2f2f2]" : "dark:bg-darkPrimary bg-white"
              }
              scroll={{ x: "max-content" }}
            />
          ) : (
            !isFetching && (
              <div className="text-center mt-4">
                <Empty description="Chưa có liên kết cung ứng nào" />
              </div>
            )
          )}

          <AnimatePresence>
            {addItem !== null && typeof addItem === "object" && (
              <SupplyDetail addItem={addItem} setAddItem={setAddItem} queryConfig={queryConfig} />
            )}
          </AnimatePresence>

          <AddSupply setAddItem={setAddItem} addItem={addItem} queryConfig={queryConfig} />
        </div>
      </section>
    </div>
  )
}
