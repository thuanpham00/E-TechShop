/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ArrowUpNarrowWide, ClipboardCheck, Eye, FolderUp, Plus, RotateCcw, Search } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { Controller, useForm } from "react-hook-form"
import { schemaSearchFilter, SchemaSearchFilterType } from "src/Client/Utils/rule"
import useQueryParams from "src/Hook/useQueryParams"
import { queryParamConfigCategory } from "src/Types/queryParams.type"
import { SuccessResponse } from "src/Types/utils.type"
import { path } from "src/Constants/path"
import { useEffect, useState } from "react"
import { CategoryItemType } from "src/Types/product.type"
import { isUndefined, omit, omitBy } from "lodash"
import { cleanObject, convertDateTime } from "src/Helpers/common"
import { toast } from "react-toastify"
import { createSearchParams, Link, useNavigate } from "react-router-dom"
import { HttpStatusCode } from "src/Constants/httpStatus"
import NavigateBack from "src/Admin/Components/NavigateBack"
import Input from "src/Components/Input"
import Button from "src/Components/Button"
import Skeleton from "src/Components/Skeleton"
import AddCategory from "./Components/AddCategory"
import DatePicker from "src/Admin/Components/DatePickerRange"
import useDownloadExcel from "src/Hook/useDownloadExcel"
import { Collapse, CollapseProps, Empty, Select, Table, Tag } from "antd"
import "../ManageOrders/ManageOrders.css"
import { useTheme } from "src/Admin/Components/Theme-provider/Theme-provider"
import { ColumnsType } from "antd/es/table"
import { CategoryAPI } from "src/Apis/admin/category.api"
import useSortList from "src/Hook/useSortList"

const formDataSearch = schemaSearchFilter.pick([
  "name",
  "created_at_start",
  "created_at_end",
  "updated_at_start",
  "updated_at_end"
])

type FormDataSearch = Pick<
  SchemaSearchFilterType,
  "name" | "created_at_start" | "created_at_end" | "updated_at_start" | "updated_at_end"
>

export default function ManageCategories() {
  const { theme } = useTheme()
  const isDark = theme === "dark" || theme === "system"

  const navigate = useNavigate()
  const { downloadExcel } = useDownloadExcel()
  const { handleSort } = useSortList()

  const queryParams: queryParamConfigCategory = useQueryParams()
  const queryConfig: queryParamConfigCategory = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit = 5
      name: queryParams.name,
      created_at_start: queryParams.created_at_start,
      created_at_end: queryParams.created_at_end,
      updated_at_start: queryParams.updated_at_start,
      updated_at_end: queryParams.updated_at_end,

      sortBy: queryParams.sortBy || "new" // mặc định sort mới nhất
    },
    isUndefined
  )

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["listCategory", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return CategoryAPI.getCategories(queryConfig as queryParamConfigCategory, controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 3 phút nó không gọi lại api

    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<{
    result: CategoryItemType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
  }>
  const listCategory = result?.result?.result

  // xử lý gọi api chi tiết
  const [addItem, setAddItem] = useState<boolean | CategoryItemType | null>(null)

  const {
    register: registerFormSearch,
    handleSubmit: handleSubmitFormSearch,
    reset: resetFormSearch,
    control: controlFormSearch,
    trigger
  } = useForm<FormDataSearch>({
    resolver: yupResolver(formDataSearch),
    defaultValues: {
      name: ""
    }
  })

  const handleSubmitSearch = handleSubmitFormSearch(
    (data) => {
      const params = cleanObject({
        ...queryConfig,
        page: 1,
        sortBy: "new",
        name: data.name,
        created_at_start: data.created_at_start?.toISOString(),
        created_at_end: data.created_at_end?.toISOString(),
        updated_at_start: data.updated_at_start?.toISOString(),
        updated_at_end: data.updated_at_end?.toISOString()
      })
      navigate({
        pathname: path.AdminCategories,
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
      "created_at_start",
      "created_at_end",
      "updated_at_start",
      "updated_at_end"
    ])
    resetFormSearch()
    navigate({ pathname: path.AdminCategories, search: createSearchParams(filteredSearch).toString() })
  }

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: <h1 className="text-[16px] font-semibold tracking-wide text-black dark:text-white">Bộ lọc & Tìm kiếm</h1>,
      children: (
        <section className="bg-white dark:bg-darkPrimary mb-3 dark:border-darkBorder rounded-2xl">
          <form onSubmit={handleSubmitSearch}>
            <div className="mt-1 grid grid-cols-2">
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary border border-[#dadada] rounded-tl-md">
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
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary  border border-[#dadada] rounded-tr-md">
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
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkPrimary border border-[#dadada] border-t-0 rounded-bl-md">
                <span className="w-1/3 dark:text-white">Tên thể loại</span>
                <div className="w-2/3 relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    <Input
                      name="name"
                      register={registerFormSearch}
                      placeholder="Nhập tên thể loại"
                      classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md text-black dark:text-white"
                      className="relative flex-grow"
                      classNameError="hidden"
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

  const columns: ColumnsType<CategoryItemType> = [
    {
      title: "Mã danh mục",
      dataIndex: "_id",
      key: "_id",
      width: 260,
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
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <div className="text-black dark:text-white">{name}</div>
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 150,
      align: "left",
      render: (is_active: boolean) => (
        <Tag color={is_active ? "green" : "red"} className="text-sm">
          {is_active ? "Hiển thị" : "Tắt"}
        </Tag>
      )
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (value: string) => <div>{convertDateTime(value)}</div>
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 180,
      render: (value: string) => <div>{convertDateTime(value)}</div>
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <Link
            to={`${path.AdminCategories}/${record._id}`}
            state={{
              data: record,
              queryConfig: queryConfig
            }}
            className="p-1 text-blue-500"
          >
            Xem chi tiết
          </Link>
        </div>
      )
    },
    {
      title: "Thương hiệu",
      key: "brand",
      dataIndex: "brand_ids",
      width: 140,
      align: "center",
      render: (brand_ids: string[], record) => (
        <div className="flex justify-center items-center gap-2">
          <span className="font-semibold text-[#3b82f6]">{brand_ids.length}</span>
          <span className="text-black dark:text-white">|</span>
          <button onClick={() => navigate(`${path.AdminCategories}/${record._id}`, { state: record.name })}>
            <Eye color="#3b82f6" size={18} />
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
        <title>Quản lý danh mục</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />
      <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
        Danh mục
      </h1>

      <Collapse items={items} defaultActiveKey={["2"]} className="bg-white dark:bg-darkPrimary dark:border-none" />

      <section className="bg-white dark:bg-darkPrimary mb-3 dark:border-darkBorder mt-4">
        {isLoading && <Skeleton />}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => downloadExcel(listCategory)}
              icon={<FolderUp size={15} />}
              nameButton="Export"
              classNameButton="py-2 px-3 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-md hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1 text-[13px]"
            />
            <Select
              defaultValue="Mới nhất"
              className="select-sort rounded-md"
              onChange={(value) => handleSort(value, queryConfig, path.AdminCategories)}
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
              classNameButton="py-2 px-3 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1 text-[13px]"
            />
          </div>
        </div>
        {!isFetching ? (
          <div>
            {listCategory?.length > 0 ? (
              <Table
                rowKey={(record) => record._id}
                dataSource={listCategory}
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
                      pathname: path.AdminCategories,
                      search: createSearchParams({
                        ...queryConfig,
                        page: page.toString(),
                        limit: pageSize.toString()
                      }).toString()
                    })
                  }
                }}
                rowClassName={(_, index) =>
                  index % 2 === 0
                    ? "bg-[#f2f2f2] hover:bg-none transition-colors"
                    : "bg-white hover:bg-none transition-colors"
                }
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

        <AddCategory setAddItem={setAddItem} addItem={addItem} />
      </section>
    </div>
  )
}
