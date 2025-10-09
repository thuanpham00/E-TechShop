/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Helmet } from "react-helmet-async"
import { createSearchParams, useLocation, useNavigate, useParams } from "react-router-dom"
import { collectionAPI } from "src/Apis/collections.api"
import { CategoryBanner } from "src/Client/Constants/categories"
import { HttpStatusCode } from "src/Constants/httpStatus"
import { path } from "src/Constants/path"
import { SuccessResponse } from "src/Types/utils.type"
import { CollectionItemType } from "src/Types/product.type"
import Skeleton from "src/Components/Skeleton"
import Breadcrumb from "src/Client/Components/Breadcrumb"
import ProductItem from "./Components/ProductItem"
import { getNameParams } from "src/Helpers/common"
import { Button, Dropdown, Empty, Space, Spin } from "antd"
import { ListFilter, X } from "lucide-react"
import { DownOutlined } from "@ant-design/icons"
import type { MenuProps } from "antd"
import { isUndefined, omit, omitBy } from "lodash"
import { queryParamsCollection } from "src/Types/queryParams.type"
import useQueryParams from "src/Hook/useQueryParams"

export default function Collection() {
  const { slug } = useParams()
  const { state } = useLocation()
  const type_filter = state?.type_filter

  const queryParams: queryParamsCollection = useQueryParams()
  const queryConfig: queryParamsCollection = omitBy(
    {
      status: queryParams.status || "all",
      screen_size: queryParams.screen_size,
      cpu: queryParams.cpu,
      ram: queryParams.ram,
      ssd: queryParams.ssd
    },
    isUndefined
  )

  const navigate = useNavigate()
  const { data, isError, isFetching, isLoading, error } = useQuery({
    queryKey: ["collections", slug, queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 10000)
      return collectionAPI
        .getCollections(slug as string, queryConfig, controller.signal)
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
    }
  })

  const itemsStatus: MenuProps["items"] = [
    { label: <div>Tất cả sản phẩm</div>, key: "all" },
    { label: <div>Còn hàng</div>, key: "available" },
    { label: <div>Ngừng sản xuất</div>, key: "discontinued" },
    { label: <div>Hết hàng</div>, key: "out_of_stock" }
  ]

  const itemsScreenSizeList: MenuProps["items"] = dataFilter?.data?.screen_size_list.map((item: string) => ({
    label: <div>{item} inch</div>,
    key: item
  }))

  const itemSSDList: MenuProps["items"] = dataFilter?.data?.ssd_list.map((item: string) => ({
    label: <div>{item}</div>,
    key: item
  }))

  const itemRamList: MenuProps["items"] = dataFilter?.data?.ram_list.map((item: string) => ({
    label: <div>{item}</div>,
    key: item
  }))

  const itemCpuList: MenuProps["items"] = dataFilter?.data?.cpu_list.map((item: string) => ({
    label: <div>{item}</div>,
    key: item
  }))

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
    const filteredSearch = omit(queryConfig, ["screen_size", "cpu", "ram", "ssd"])
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
        <Breadcrumb slug_1={slug as string} />

        {/* Loading lần đầu */}
        {isLoading && <Skeleton />}

        {slug && !isLoading && (
          <>
            {/* Banner cố định */}
            {!slug.includes("ban-phim") && (
              <img
                className="rounded-lg shadow-md h-[300px] w-full"
                src={(CategoryBanner as Record<string, string>)[slug]}
                alt={`Banner ${slug}`}
              />
            )}

            {/* Bộ lọc */}
            <div className="bg-white p-4 my-4 rounded-lg shadow-md">
              <div className="mt-1 mb-3 flex items-center gap-3">
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

                {(type_filter === "Laptop" || type_filter === "Laptop Gaming") && (
                  <Dropdown
                    trigger={["click"]}
                    menu={{ items: itemsScreenSizeList, onClick: ({ key }) => handleChangeQuery("screen_size", key) }}
                  >
                    <Button className="border border-gray-300 rounded-md px-3 py-1 bg-white hover:bg-gray-50 flex items-center gap-1">
                      <Space>
                        <span className="text-[13px]">
                          {itemsScreenSizeList && queryParams.screen_size
                            ? (
                                itemsScreenSizeList.find(
                                  (item) => item?.key?.toString() === queryParams.screen_size
                                ) as any
                              )?.label
                            : "Kích thước màn hình"}
                        </span>
                        <DownOutlined />
                      </Space>
                    </Button>
                  </Dropdown>
                )}

                {(type_filter === "Laptop" || type_filter === "Laptop Gaming") && (
                  <Dropdown
                    menu={{ items: itemCpuList, onClick: ({ key }) => handleChangeQuery("cpu", key) }}
                    trigger={["click"]}
                  >
                    <Button className="border border-gray-300 rounded-md px-3 py-1 bg-white hover:bg-gray-50 flex items-center gap-1">
                      <Space>
                        <span className="text-[13px]">
                          {itemCpuList && queryParams.cpu
                            ? (itemCpuList.find((item) => item?.key?.toString() === queryParams.cpu) as any)?.label
                            : "CPU"}
                        </span>
                        <DownOutlined />
                      </Space>
                    </Button>
                  </Dropdown>
                )}

                {(type_filter === "Laptop" || type_filter === "Laptop Gaming") && (
                  <Dropdown
                    menu={{ items: itemRamList, onClick: ({ key }) => handleChangeQuery("ram", key) }}
                    trigger={["click"]}
                  >
                    <Button className="border border-gray-300 rounded-md px-3 py-1 bg-white hover:bg-gray-50 flex items-center gap-1">
                      <Space>
                        <span className="text-[13px]">
                          {itemRamList && queryParams.ram
                            ? (itemRamList.find((item) => item?.key?.toString() === queryParams.ram) as any)?.label
                            : "Ram"}
                        </span>
                        <DownOutlined />
                      </Space>
                    </Button>
                  </Dropdown>
                )}

                {(type_filter === "Laptop" || type_filter === "Laptop Gaming") && (
                  <Dropdown
                    menu={{ items: itemSSDList, onClick: ({ key }) => handleChangeQuery("ssd", key) }}
                    trigger={["click"]}
                  >
                    <Button className="border border-gray-300 rounded-md px-3 py-1 bg-white hover:bg-gray-50 flex items-center gap-1">
                      <Space>
                        <span className="text-[13px]">
                          {itemSSDList && queryParams.ssd
                            ? (itemSSDList.find((item) => item?.key?.toString() === queryParams.ssd) as any)?.label
                            : "SSD"}
                        </span>
                        <DownOutlined />
                      </Space>
                    </Button>
                  </Dropdown>
                )}

                <button
                  className="h-[32px] border border-gray-300 rounded-md px-2 bg-primaryBlue hover:bg-primaryBlue/60 duration-200 flex items-center gap-1 text-white text-[13px]"
                  onClick={handleResetFilter}
                >
                  Xóa bộ lọc
                  <X size={14} />
                </button>
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
    <div className="relative">
      {isFetching && (
        <div className="absolute inset-0 bg-white/50 flex justify-center items-center z-10">
          <Spin />
        </div>
      )}
      <div className="grid grid-cols-5 gap-2">
        {result?.result.length ? (
          result.result.map((item) => (
            <div key={item._id}>
              <ProductItem item={item} />
            </div>
          ))
        ) : (
          <div className="text-center w-full col-span-5">
            <Empty description="Không có sản phẩm" />
          </div>
        )}
      </div>
    </div>
  )
}
