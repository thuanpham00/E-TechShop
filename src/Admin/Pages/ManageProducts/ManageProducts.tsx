/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { isUndefined, omitBy } from "lodash"
import { Helmet } from "react-helmet-async"
import { adminAPI } from "src/Apis/admin.api"
import { path } from "src/Constants/path"
import useQueryParams from "src/Hook/useQueryParams"
import { ProductItemType } from "src/Types/product.type"
import { queryParamConfigCategory, queryParamConfigProduct } from "src/Types/queryParams.type"
import { SuccessResponse } from "src/Types/utils.type"
import NavigateBack from "src/Admin/Components/NavigateBack"
import Skeleton from "src/Components/Skeleton"
import Pagination from "src/Components/Pagination"
import ProductItem from "./Components/ProductItem"
import { createSearchParams, Link, useNavigate } from "react-router-dom"
import { HttpStatusCode } from "src/Constants/httpStatus"
import FilterProduct from "./Components/FilterProduct"
import { motion } from "framer-motion"
import { Collapse, CollapseProps, Empty, Select } from "antd"
import "../ManageOrders/ManageOrders.css"
import { ArrowUpNarrowWide, FolderUp, Plus } from "lucide-react"
import Button from "src/Components/Button"
import useDownloadExcel from "src/Hook/useDownloadExcel"
import { useTheme } from "src/Admin/Components/Theme-provider/Theme-provider"
import { toast } from "react-toastify"
import { useEffect } from "react"

export default function ManageProducts() {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark" || theme === "system"

  const navigate = useNavigate()
  const { downloadExcel } = useDownloadExcel()
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
      return adminAPI.product.getProducts(queryConfig as queryParamConfigCategory, controller.signal)
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

  const page_size = Math.ceil(Number(result?.result.total) / Number(result?.result.limit))

  // const [idBrand, setIdBrand] = useState<string | null>(null)

  // const handleEditItem = useCallback((id: string) => {
  //   setIdBrand(id)
  // }, [])

  // const handleExitsEditItem = () => {
  //   setIdBrand(null)
  // }

  // xử lý sort ds
  const handleChangeSortListOrder = (value: string) => {
    const body = {
      ...queryConfig,
      sortBy: value
    }
    navigate({
      pathname: `${path.AdminProducts}`,
      search: createSearchParams(body).toString()
    })
  }

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: <h1 className="text-[16px] font-semibold tracking-wide text-black dark:text-white">Bộ lọc & Tìm kiếm</h1>,
      children: (
        <section>
          <FilterProduct queryConfig={queryConfig} />
        </section>
      )
    },
    {
      key: "2",
      label: <h2 className="text-[16px] font-semibold tracking-wide text-black dark:text-white">Danh sách Sản phẩm</h2>,
      children: (
        <section>
          {isLoading && <Skeleton />}
          {!isFetching && (
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => downloadExcel(listProduct)}
                    icon={<FolderUp size={15} />}
                    nameButton="Export"
                    classNameButton="py-2 px-3 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-3xl hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1"
                  />
                  <Select
                    defaultValue="Mới nhất"
                    className="select-sort"
                    onChange={handleChangeSortListOrder}
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
                    className="py-2 px-3 bg-blue-500 w-full text-white font-medium rounded-3xl hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
                  >
                    <Plus size={15} />
                    <span>Thêm mới</span>
                  </Link>
                </div>
              </div>
              <div className="mt-2">
                <div className="bg-[#f2f2f2] dark:bg-darkPrimary grid grid-cols-12 items-center gap-2 py-3 border border-[#dedede] dark:border-darkBorder px-4 rounded-tl-xl rounded-tr-xl">
                  <div className="col-span-2 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                    Mã sản phẩm
                  </div>
                  <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                    Hình ảnh
                  </div>
                  <div className="col-span-2 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                    Tên sản phẩm
                  </div>
                  <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                    Thương hiệu
                  </div>
                  <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                    Thể loại
                  </div>
                  <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                    Giá gốc
                  </div>
                  <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase text-black dark:text-white">
                    Trạng thái
                  </div>
                  <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase text-black dark:text-white">
                    Ngày tạo
                  </div>
                  <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase text-black dark:text-white">
                    Ngày cập nhật
                  </div>
                  <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase text-black dark:text-white">
                    Hành động
                  </div>
                </div>
                <div>
                  {listProduct?.length > 0 ? (
                    listProduct?.map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ProductItem
                          // onDelete={handleDeleteCategory}
                          // handleEditItem={handleEditItem}
                          item={item}
                          maxIndex={listProduct?.length}
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
                pathNavigate={path.AdminProducts}
              />
            </div>
          )}
        </section>
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
      {/* <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="p-4 bg-white dark:bg-darkPrimary mb-3 border border-gray-300 dark:border-darkBorder rounded-2xl shadow-xl">
          <h1 className="text-[16px] font-semibold tracking-wide">Bộ lọc & Tìm kiếm</h1>
          <FilterProduct queryConfig={queryConfig} listProduct={listProduct} />
          <div>
            {isLoading && <Skeleton />}
            {!isFetching && (
              <div>
                <div className="mt-4">
                  <div className="bg-[#f2f2f2] dark:bg-darkPrimary grid grid-cols-12 items-center gap-2 py-3 border border-[#dedede] dark:border-darkBorder px-4 rounded-tl-xl rounded-tr-xl">
                    <div className="col-span-2 text-[14px] font-semibold tracking-wider uppercase">Mã sản phẩm</div>
                    <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase">Hình ảnh</div>
                    <div className="col-span-2 text-[14px] font-semibold tracking-wider uppercase">Tên sản phẩm</div>
                    <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase">Thương hiệu</div>
                    <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase">Thể loại</div>
                    <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase">Giá gốc</div>
                    <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase">
                      Trạng thái
                    </div>
                    <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase">
                      Ngày tạo
                    </div>
                    <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase">
                      Ngày cập nhật
                    </div>
                    <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase">
                      Hành động
                    </div>
                  </div>
                  <div>
                    {listProduct?.length > 0 ? (
                      listProduct?.map((item, index) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ProductItem
                            // onDelete={handleDeleteCategory}
                            // handleEditItem={handleEditItem}
                            item={item}
                            maxIndex={listProduct?.length}
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
                  pathNavigate={path.AdminProducts}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div> */}

      <Collapse items={items} defaultActiveKey={["2"]} className="bg-white dark:bg-darkPrimary dark:border-none" />
    </div>
  )
}
