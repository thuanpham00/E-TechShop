/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { isUndefined, omitBy } from "lodash"
import { Helmet } from "react-helmet-async"
import { path } from "src/Constants/path"
import useQueryParams from "src/Hook/useQueryParams"
import { ProductItemType } from "src/Types/product.type"
import { queryParamConfigCategory, queryParamConfigProduct } from "src/Types/queryParams.type"
import { SuccessResponse } from "src/Types/utils.type"
import NavigateBack from "src/Admin/Components/NavigateBack"
import Skeleton from "src/Components/Skeleton"
import { createSearchParams, Link, useNavigate } from "react-router-dom"
import { HttpStatusCode } from "src/Constants/httpStatus"
import FilterProduct from "./Components/FilterProduct"
import { Collapse, CollapseProps, Empty, Image, Modal, Select, Table, Tag } from "antd"
import "../ManageOrders/ManageOrders.css"
import { ArrowUpNarrowWide, ClipboardCheck, FolderUp, Pencil, Plus, Trash2 } from "lucide-react"
import Button from "src/Components/Button"
import useDownloadExcel from "src/Hook/useDownloadExcel"
import { useTheme } from "src/Admin/Components/Theme-provider/Theme-provider"
import { toast } from "react-toastify"
import { useEffect } from "react"
import { ColumnsType } from "antd/es/table"
import { convertDateTime, formatCurrency } from "src/Helpers/common"
import { ProductAPI } from "src/Apis/admin/product.api"
import useSortList from "src/Hook/useSortList"

export default function ManageProducts() {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark" || theme === "system"

  const navigate = useNavigate()
  const { downloadExcel } = useDownloadExcel()
  const { handleSort } = useSortList()

  const queryParams: queryParamConfigProduct = useQueryParams()
  const queryConfig: queryParamConfigProduct = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit = 10
      name: queryParams.name,
      brand: queryParams.brand,
      category: queryParams.category,
      price_min: queryParams.price_min,
      price_max: queryParams.price_max,
      created_at_start: queryParams.created_at_start,
      created_at_end: queryParams.created_at_end,
      updated_at_start: queryParams.updated_at_start,
      updated_at_end: queryParams.updated_at_end,
      status: queryParams.status,

      sortBy: queryParams.sortBy || "new" // mặc định sort mới nhất
    },
    isUndefined
  )

  const { data, isFetching, isLoading, error, isError } = useQuery({
    queryKey: ["listProduct", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return ProductAPI.getProducts(queryConfig as queryParamConfigCategory, controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<{
    result: ProductItemType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
  }>
  const listProduct = result?.result?.result

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: <h1 className="text-[16px] font-semibold tracking-wide text-black dark:text-white">Bộ lọc & Tìm kiếm</h1>,
      children: (
        <section>
          <FilterProduct queryConfig={queryConfig} />
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

  const columns: ColumnsType<ProductItemType> = [
    {
      title: <div className="text-center">Hình ảnh</div>,
      dataIndex: "banner",
      key: "product",
      fixed: "left",
      width: 250,
      render: (_: any, record: ProductItemType) => (
        <div className="flex items-center gap-3">
          <Image src={record.banner?.url} alt={record._id} style={{ width: 200, height: 120, objectFit: "cover" }} />
        </div>
      )
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (val: string) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }} className="truncate font-semibold">
          {val}
        </div>
      )
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "_id",
      key: "_id",
      width: 200,
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
      title: "Thương hiệu",
      dataIndex: "brand",
      key: "brand",
      width: 140,
      render: (brand: any) => <div className="text-black dark:text-white">{<Tag color="green">{brand?.name}</Tag>}</div>
    },
    {
      title: "Thể loại",
      dataIndex: "category",
      key: "category",
      width: 140,
      render: (category: any) => (
        <div className="text-black dark:text-white">{<Tag color="blue">{category?.name}</Tag>}</div>
      )
    },
    {
      title: "Giá gốc",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price: number) => <div className="text-red-600 font-semibold">{formatCurrency(price)}đ</div>
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      align: "center",
      render: (status: string) =>
        status === "out_of_stock" ? (
          <div className="text-[13px] font-medium py-1 px-2 border border-[#ffdcdc] bg-[#ffdcdc] text-[#f00] text-center rounded-full">
            Hết hàng
          </div>
        ) : status === "available" ? (
          <div className="text-[13px] font-medium py-1 px-2 border border-[#b2ffb4] bg-[#b2ffb4] text-[#04710c] text-center rounded-full">
            Còn hàng
          </div>
        ) : (
          <div className="text-[13px] font-medium py-1 px-2 border border-[#ffdcdc] bg-[#ffdcdc] text-[#04710c] text-center rounded-full">
            Ngừng kinh doanh
          </div>
        )
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
          <Link
            to={path.AddProduct}
            state={{
              editItem: record
            }}
            className=""
          >
            <Pencil color="orange" size={18} />
          </Link>
          <button
            onClick={() =>
              Modal.confirm({
                title: "Bạn có chắc chắn muốn xóa?",
                content: "Không thể hoàn tác hành động này. Thao tác này sẽ xóa vĩnh viễn dữ liệu của bạn.",
                okText: "Xóa",
                okButtonProps: { danger: true },
                cancelText: "Hủy",
                onOk: () => {}
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
        <title>Quản lý sản phẩm</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />
      <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
        Sản phẩm
      </h1>

      <Collapse items={items} defaultActiveKey={["2"]} className="bg-white dark:bg-darkPrimary dark:border-none" />

      <section className="mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => downloadExcel(listProduct)}
              icon={<FolderUp size={15} />}
              nameButton="Export"
              classNameButton="py-2 px-3 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-md hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1 text-[13px]"
            />
            <Select
              defaultValue="Mới nhất"
              className="select-sort"
              onChange={(value) => handleSort(value, queryConfig, path.AdminProducts)}
              suffixIcon={<ArrowUpNarrowWide color={isDarkMode ? "white" : "black"} />}
              options={[
                { value: "old", label: "Cũ nhất" },
                { value: "new", label: "Mới nhất" }
              ]}
            />
          </div>
          <div>
            <Link
              to={path.AddProduct}
              state={{
                editItem: true
              }}
              className="py-2 px-3 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
            >
              <Plus size={15} />
              <span>Thêm mới</span>
            </Link>
          </div>
        </div>
        {isLoading ? (
          <Skeleton />
        ) : listProduct && listProduct.length > 0 ? (
          <Table
            rowKey={(r) => r._id}
            dataSource={listProduct}
            loading={isFetching}
            scroll={{
              x: "max-content"
            }}
            pagination={{
              current: Number(queryConfig.page),
              pageSize: Number(queryConfig.limit),
              total: Number(result?.result.total || 0),
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              onChange: (page, pageSize) =>
                navigate({
                  pathname: path.AdminProducts,
                  search: createSearchParams({
                    ...queryConfig,
                    page: page.toString(),
                    limit: pageSize.toString()
                  }).toString()
                })
            }}
            columns={columns}
            rowClassName={(_, index) => (index % 2 === 0 ? "bg-[#f2f2f2]" : "bg-white")}
          />
        ) : (
          !isFetching && (
            <div className="text-center mt-4">
              <Empty description="Chưa có sản phẩm nào" />
            </div>
          )
        )}
      </section>
    </div>
  )
}
