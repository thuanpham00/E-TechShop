/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Helmet } from "react-helmet-async"
import { createSearchParams, useLocation, useNavigate, useParams } from "react-router-dom"
import { HttpStatusCode } from "src/Constants/httpStatus"
import { path } from "src/Constants/path"
import { SuccessResponse } from "src/Types/utils.type"
import { CollectionItemType } from "src/Types/product.type"
import Skeleton from "src/Components/Skeleton"
import Breadcrumb from "src/Client/Components/Breadcrumb"
import ProductItem from "./Components/ProductItem"
import { getNameParams } from "src/Helpers/common"
import { Button, Dropdown, Empty, Select, Space, Spin } from "antd"
import { ListFilter, RotateCcw, SortAsc } from "lucide-react"
import { DownOutlined } from "@ant-design/icons"
import type { MenuProps } from "antd"
import { isUndefined, omit, omitBy } from "lodash"
import { queryParamsCollection } from "src/Types/queryParams.type"
import useQueryParams from "src/Hook/useQueryParams"
import { useEffect, useMemo } from "react"
import { collectionAPI } from "src/Apis/client/collections.api"
import { categoryAPI } from "src/Apis/client/category.api"
import FilterLaptop from "./Components/FilterLaptop"
import FilterScreen from "./Components/FilterScreen"

const sortOptions = [
  { value: "name_asc", label: "Tên từ A-Z" },
  { value: "name_desc", label: "Tên từ Z-A" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" }
]

export default function Collection() {
  const { slug } = useParams()
  const { state } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const queryParams: queryParamsCollection = useQueryParams()
  const queryConfig: queryParamsCollection = omitBy(
    {
      status: queryParams.status || "all",
      screen_size: queryParams.screen_size,
      cpu: queryParams.cpu,
      ram: queryParams.ram,
      resolution: queryParams.resolution,
      type_screen: queryParams.type_screen,
      screen_panel: queryParams.screen_panel,
      sort: queryParams.sort || "name_asc"
    },
    isUndefined
  )

  const navigate = useNavigate()

  // xử lý gọi banner dựa trên slug
  const getListCategoryMenu = useQuery({
    queryKey: ["bannerForSlugCategory"],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return categoryAPI.getBannerSlugCategory(controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 10 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const bannerUrl = useMemo(() => {
    const findBanner = getListCategoryMenu.data?.data?.data.find((item: any) => item.slug === slug)
    return findBanner ? findBanner.banner : ""
  }, [getListCategoryMenu.data?.data?.data, slug])

  const nameDisplay = useMemo(() => {
    const findBanner = getListCategoryMenu.data?.data?.data.find((item: any) => item.slug === slug)
    return findBanner ? findBanner.name : ""
  }, [getListCategoryMenu.data?.data?.data, slug])

  const type_filter = useMemo(() => {
    const findBanner = getListCategoryMenu.data?.data?.data.find((item: any) => item.slug === slug)
    return findBanner ? findBanner.type_filter : ""
  }, [getListCategoryMenu.data?.data?.data, slug])

  const { data, isError, isFetching, isLoading, error } = useQuery({
    queryKey: ["collections", slug, queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 10000)
      return collectionAPI
        .getCollections({
          slug: slug as string,
          params: queryConfig,
          signal: controller.signal
        })
        .then((res) => res)
        .catch((err) => Promise.reject(err))
    },
    retry: 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<CollectionItemType[]>
  if (isError) {
    if ((error as any)?.response?.status === HttpStatusCode.NotFound) {
      navigate(path.NotFound)
    }
  }

  const { data: dataFilter } = useQuery({
    queryKey: ["filters", type_filter],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 10000)
      return collectionAPI.getFilterBaseOnCategory(type_filter).then((res) => res)
    },
    enabled: !!type_filter
  })

  const itemsStatus: MenuProps["items"] = [
    { label: <div>Tất cả sản phẩm</div>, key: "all" },
    { label: <div>Còn hàng</div>, key: "available" },
    { label: <div>Ngừng sản xuất</div>, key: "discontinued" },
    { label: <div>Hết hàng</div>, key: "out_of_stock" }
  ]

  const handleChangeQuery = (field: string, value: string) => {
    const params: queryParamsCollection = {
      ...queryConfig,
      [field]: value
    }
    navigate(
      {
        pathname: `/collections/${slug}`,
        search: createSearchParams(params).toString()
      },
      {
        state: { type_filter }
      }
    )
  }

  const handleResetFilter = () => {
    const filteredSearch = omit(queryConfig, [
      "screen_size",
      "cpu",
      "ram",
      "ssd",
      "resolution",
      "type_screen",
      "screen_panel"
    ])
    navigate(
      { pathname: `/collections/${slug}`, search: createSearchParams({ ...filteredSearch, status: "all" }).toString() },
      {
        state: state
      }
    )
  }

  return (
    <div>
      <Helmet>
        <title>{getNameParams(slug as string)}</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <div className="container">
        <Breadcrumb slug_1={nameDisplay as string} />

        {/* Loading lần đầu */}
        {isLoading && <Skeleton />}

        {slug && !isLoading && (
          <>
            {/* Banner cố định */}
            {bannerUrl !== undefined && (
              <img className="rounded-lg shadow-md h-[300px] w-full" src={bannerUrl} alt={`Banner ${slug}`} />
            )}

            {/* Bộ lọc */}
            <div className="bg-white border border-gray-200 p-4 my-4 rounded-lg shadow-md">
              <div className="mt-1 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="border border-gray-300 rounded-md px-2 py-1 flex items-center gap-1">
                    <ListFilter size={16} />
                    <span className="text-[13px]">Bộ lọc</span>
                  </div>
                  <Dropdown
                    trigger={["click"]}
                    menu={{ items: itemsStatus, onClick: ({ key }) => handleChangeQuery("status", key) }}
                  >
                    <Button className="border border-gray-300 rounded-md px-3 py-1 bg-white hover:bg-gray-50 flex items-center gap-1">
                      <Space>
                        <span className="text-[13px]">
                          {queryParams.status
                            ? (itemsStatus.find((item) => item?.key === queryParams.status) as any)?.label
                            : "Tất cả sản phẩm"}
                        </span>
                        <DownOutlined />
                      </Space>
                    </Button>
                  </Dropdown>

                  <FilterLaptop
                    type_filter={type_filter}
                    dataFilter={dataFilter}
                    queryConfig={queryConfig}
                    handleChangeQuery={handleChangeQuery}
                  />

                  <FilterScreen
                    type_filter={type_filter}
                    dataFilter={dataFilter}
                    queryConfig={queryConfig}
                    handleChangeQuery={handleChangeQuery}
                  />

                  <button
                    className="h-[32px] rounded-md px-2 bg-primaryBlue hover:bg-primaryBlue/80 duration-200 flex items-center gap-1 text-white text-[13px]"
                    onClick={handleResetFilter}
                  >
                    Clear
                    <RotateCcw size={14} />
                  </button>
                </div>

                <Select
                  value={queryConfig.sort}
                  onChange={(value) => handleChangeQuery("sort", value)}
                  options={sortOptions}
                  className="w-[180px]"
                  suffixIcon={<SortAsc size={16} className="text-gray-500" />}
                  popupMatchSelectWidth={false}
                />
              </div>

              {/* Danh sách sản phẩm */}
              <ProductList result={result} isFetching={isFetching} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
/**
 * 
 * isLoading → true khi query lần đầu tiên (chưa có data nào).
   isFetching → true mỗi khi query đang chạy (bao gồm lần đầu và các lần refetch sau). 
 */

function ProductList({ result, isFetching }: { result?: SuccessResponse<CollectionItemType[]>; isFetching: boolean }) {
  return (
    <div className="relative mt-4">
      {isFetching ? (
        <div className="flex justify-center items-center py-28">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-3">
          {result?.result.length ? (
            result.result.map((item) => (
              <div key={item._id}>
                <ProductItem item={item} />
              </div>
            ))
          ) : (
            <div className="text-center w-full col-span-5 py-20">
              <Empty description="Không có sản phẩm" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
