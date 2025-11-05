/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowUpFromLine,
  ArrowUpNarrowWide,
  ClipboardCheck,
  Eye,
  FolderUp,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X
} from "lucide-react"
import { createSearchParams, useNavigate } from "react-router-dom"
import { BrandItemType, UpdateCategoryBodyReq } from "src/Types/product.type"
import { ErrorResponse, MessageResponse, SuccessResponse } from "src/Types/utils.type"
import { Controller, useForm } from "react-hook-form"
import { schemaAuth, SchemaAuthType, schemaSearchFilter, SchemaSearchFilterType } from "src/Client/Utils/rule"
import useQueryParams from "src/Hook/useQueryParams"
import { isUndefined, omit, omitBy } from "lodash"
import { queryParamConfigBrand } from "src/Types/queryParams.type"
import { path } from "src/Constants/path"
import { useEffect, useState } from "react"
import { yupResolver } from "@hookform/resolvers/yup"
import { cleanObject, convertDateTime } from "src/Helpers/common"
import { toast } from "react-toastify"
import { isError400 } from "src/Helpers/utils"
import { HttpStatusCode } from "src/Constants/httpStatus"
import Input from "src/Components/Input"
import Button from "src/Components/Button"
import Skeleton from "src/Components/Skeleton"
import AddBrand from "../AddBrand"
import DatePicker from "src/Admin/Components/DatePickerRange"
import useDownloadExcel from "src/Hook/useDownloadExcel"
import { motion, AnimatePresence } from "framer-motion"
import { Collapse, CollapseProps, Empty, Modal, Select, Table } from "antd"
import "../../../ManageOrders/ManageOrders.css"
import { useTheme } from "src/Admin/Components/Theme-provider/Theme-provider"
import { ColumnsType } from "antd/es/table"
import { BrandAPI } from "src/Apis/admin/brand.api"
import useSortList from "src/Hook/useSortList"

type FormDataUpdate = Pick<SchemaAuthType, "name" | "id" | "created_at" | "updated_at">
const formDataUpdate = schemaAuth.pick(["name", "id", "created_at", "updated_at"])

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

export default function ManageBrand({ idCategory, nameCategory }: { idCategory: string; nameCategory: string }) {
  const { theme } = useTheme()
  const isDark = theme === "dark" || theme === "system"

  const navigate = useNavigate()
  const { downloadExcel } = useDownloadExcel()
  const { handleSort } = useSortList()

  const queryClient = useQueryClient()
  const queryParams: queryParamConfigBrand = useQueryParams()
  const queryConfig: queryParamConfigBrand = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "10", // mặc định limit =
      name: queryParams.name,
      id: idCategory,
      created_at_start: queryParams.created_at_start,
      created_at_end: queryParams.created_at_end,
      updated_at_start: queryParams.updated_at_start,
      updated_at_end: queryParams.updated_at_end,

      sortBy: queryParams.sortBy || "new" // mặc định sort mới nhất
    },
    isUndefined
  )

  const { data, isFetching, isLoading, error, isError } = useQuery({
    queryKey: ["listBrand", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return BrandAPI.getBrands(queryConfig, controller.signal)
    },
    enabled: Boolean(idCategory),
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
    // chỉ chạy khi id có giá trị
  })

  const result = data?.data as SuccessResponse<{
    result: BrandItemType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
    listTotalProduct: { brand: string; total: string }[]
  }>
  const listBrandOfCategory = result?.result?.result
  const listTotalProduct = result?.result?.listTotalProduct

  const [addItem, setAddItem] = useState<boolean | BrandItemType | null>(null)

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
    if (addItem !== null && typeof addItem === "object") {
      setValue("id", addItem._id)
      setValue("name", addItem.name)
      setValue("created_at", convertDateTime(addItem.created_at))
      setValue("updated_at", convertDateTime(addItem.updated_at))
    }
  }, [addItem, setValue])

  const updateCategoryMutation = useMutation({
    mutationFn: (body: { id: string; body: UpdateCategoryBodyReq }) => {
      return BrandAPI.updateBrandDetail(body.id, body.body)
    }
  })

  const handleSubmitUpdate = handleSubmit((data) => {
    updateCategoryMutation.mutate(
      { id: (addItem as BrandItemType)._id as string, body: data },
      {
        onSuccess: () => {
          setAddItem(null)
          toast.success("Cập nhật thành công", { autoClose: 1500 })
          queryClient.invalidateQueries({ queryKey: ["listBrand", queryConfig] })
        },
        onError: (error) => {
          if (isError400<ErrorResponse<MessageResponse>>(error)) {
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

  const deleteBrandMutation = useMutation({
    mutationFn: (body: { id: string; categoryId: string }) => {
      return BrandAPI.deleteBrand(body.id, body.categoryId)
    }
  })

  const handleDeleteBrand = (brandId: string) => {
    deleteBrandMutation.mutate(
      { id: brandId, categoryId: idCategory as string },
      {
        onSuccess: () => {
          // lấy ra query của trang hiện tại (có queryConfig)
          const data = queryClient.getQueryData(["listBrand", queryConfig])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data_2 = (data as any).data as SuccessResponse<{
            result: BrandItemType[]
            total: string
            page: string
            limit: string
            totalOfPage: string
            listTotalProduct: { brand: string; total: string }[]
          }>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (data && data_2.result.result.length === 1 && Number(queryConfig.page) > 1) {
            navigate({
              pathname: `${path.AdminCategories}/${idCategory}`,
              search: createSearchParams({
                ...queryConfig,
                page: (Number(queryConfig.page) - 1).toString()
              }).toString()
            })
          }

          queryClient.invalidateQueries({ queryKey: ["listBrand"] })
          toast.success("Xóa thành công!", { autoClose: 1500 })
        },
        onError: (error) => {
          if (isError400<ErrorResponse<MessageResponse>>(error)) {
            toast.error(error.response?.data.message, {
              autoClose: 1500
            })
          }
        }
      }
    )
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
        created_at_start: data.created_at_start?.toISOString(),
        created_at_end: data.created_at_end?.toISOString(),
        updated_at_start: data.updated_at_start?.toISOString(),
        updated_at_end: data.updated_at_end?.toISOString()
      })
      navigate(
        {
          pathname: `${path.AdminCategories}/${idCategory}`,
          search: createSearchParams(params).toString()
        },
        {
          state: nameCategory
        }
      )
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
    navigate(
      { pathname: `${path.AdminCategories}/${idCategory}`, search: createSearchParams(filteredSearch).toString() },
      {
        state: nameCategory
      }
    )
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
                <span className="w-1/3 dark:text-white">Ngày đăng</span>
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
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary border border-[#dadada] rounded-tr-md">
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
                      placeholder="Nhập tên thương hiệu"
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
                type="button"
                nameButton="Xóa bộ lọc"
                onClick={handleResetFormSearch}
                icon={<RotateCcw size={15} color="#adb5bd" />}
                classNameButton="py-2 px-3 bg-[#f2f2f2] border border-[#dedede] w-full text-black font-medium hover:bg-[#dedede]/80 rounded-md duration-200 text-[13px] flex items-center gap-1 h-[35px]"
              />
              <Button
                type="submit"
                nameButton="Tìm kiếm"
                icon={<Search size={15} />}
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

  const columns: ColumnsType<BrandItemType> = [
    {
      title: "Mã thương hiệu",
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
      title: "Tên thương hiệu",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <div className="text-black dark:text-white">{text}</div>
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (v: string) => <div>{convertDateTime(v)}</div>
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 180,
      render: (v: string) => <div>{convertDateTime(v)}</div>
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
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
                onOk: () => handleDeleteBrand(record._id)
              })
            }
            className="p-1"
          >
            <Trash2 color="red" size={18} />
          </button>
        </div>
      )
    },
    {
      title: "Sản phẩm",
      key: "products",
      dataIndex: "brand_ids",
      width: 140,
      align: "center",
      render: (_, record) => {
        const found = listTotalProduct?.find((t) => t.brand === record._id)
        const total = found ? found.total : "0"
        return (
          <div className="flex justify-center items-center gap-2">
            <span className="font-semibold text-[#3b82f6]">{total}</span>
            <span className="text-black dark:text-white">|</span>
            <button onClick={() => navigate(`${path.AdminProducts}?brand=${record.name}&category=${nameCategory}`)}>
              <Eye color="#3b82f6" size={18} />
            </button>
          </div>
        )
      }
    }
  ] as ColumnsType<BrandItemType>

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
      <Collapse items={items} defaultActiveKey={["2"]} className="bg-white dark:bg-darkPrimary dark:border-none" />

      <section className="bg-white dark:bg-darkPrimary mb-3 dark:border-darkBorder mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => downloadExcel(listBrandOfCategory)}
              icon={<FolderUp size={15} />}
              nameButton="Export"
              classNameButton="py-2 px-3 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-md hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1 text-[13px]"
            />
            <Select
              defaultValue="Mới nhất"
              className="select-sort"
              onChange={(value) => handleSort(value, queryConfig, `${path.AdminCategories}/${idCategory}`)}
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
              classNameButton="py-2 px-3 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
            />
          </div>
        </div>
        {isLoading ? (
          <Skeleton />
        ) : listBrandOfCategory && listBrandOfCategory.length > 0 ? (
          <Table
            rowKey={(r) => r._id}
            dataSource={listBrandOfCategory}
            loading={isFetching}
            pagination={{
              current: Number(queryConfig.page),
              pageSize: Number(queryConfig.limit),
              total: Number(result?.result.total || 0),
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              onChange: (page, pageSize) => {
                navigate({
                  pathname: `${path.AdminCategories}/${idCategory}`,
                  search: createSearchParams({
                    ...queryConfig,
                    page: page.toString(),
                    limit: pageSize.toString()
                  }).toString()
                })
              }
            }}
            columns={columns}
            rowClassName={(_, index) => (index % 2 === 0 ? "bg-[#f2f2f2]" : "bg-white")}
          />
        ) : (
          !isFetching && (
            <div className="text-center mt-4">
              <Empty description="Chưa có thương hiệu nào" />
            </div>
          )
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
                <form onSubmit={handleSubmitUpdate} className="bg-white dark:bg-darkPrimary rounded-md">
                  <h3 className="py-2 px-4 text-lg font-semibold tracking-wide rounded-md text-black dark:text-white">
                    Thông tin thương hiệu
                  </h3>
                  <div className="p-4 pt-0">
                    <div className="mt-4 flex items-center gap-4">
                      <Input
                        name="id"
                        register={register}
                        placeholder="Nhập họ tên"
                        messageErrorInput={errors.id?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                        className="relative flex-1"
                        classNameLabel="text-black dark:text-white"
                        nameInput="Mã thương hiệu"
                        disabled
                      />
                      <Input
                        name="name"
                        register={register}
                        placeholder="Nhập họ tên"
                        messageErrorInput={errors.name?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                        className="relative flex-1"
                        classNameLabel="text-black dark:text-white"
                        nameInput="Tên thương hiệu"
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
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond  focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
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
                        classNameButton="w-[120px] p-4 py-2 bg-blue-500 mt-2 w-full text-white font-semibold rounded-md hover:bg-blue-500/80 duration-200 flex items-center gap-1 text-[13px]"
                      />
                    </div>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AddBrand setAddItem={setAddItem} addItem={addItem} categoryId={idCategory} />
      </section>
    </div>
  )
}
