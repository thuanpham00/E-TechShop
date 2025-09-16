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
import { Dropdown, Empty, Space } from "antd"
import { ListFilter } from "lucide-react"
import { DownOutlined } from "@ant-design/icons"
import type { MenuProps } from "antd"
import { isUndefined, omitBy } from "lodash"
import { queryParamsCollection } from "src/Types/queryParams.type"
import useQueryParams from "src/Hook/useQueryParams"
import { useState } from "react"

export default function Collection() {
  const { slug } = useParams()
  const { state } = useLocation()
  const type_filter = state?.type_filter

  const queryParams: queryParamsCollection = useQueryParams()
  const queryConfig: queryParamsCollection = omitBy(
    {
      status: queryParams.status || "available",
      screen_size: queryParams.screen_size
    },
    isUndefined
  )

  const navigate = useNavigate()
  const { data, isError, isFetching, isLoading, error } = useQuery({
    queryKey: ["collections", slug, queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)

      return collectionAPI
        .getCollections(slug as string, queryConfig, controller.signal)
        .then((res) => res)
        .catch((err) => Promise.reject(err))
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 5 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<CollectionItemType[]>
  if (isError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.response?.status === HttpStatusCode.NotFound) {
      navigate(path.NotFound)
    }
  }

  const { data: dataFilter } = useQuery({
    queryKey: ["filters", type_filter],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)

      return collectionAPI.getFilterBaseOnCategory(type_filter).then((res) => res)
    }
  })

  const [selectedParams, setSelectedParams] = useState<{ status?: string; screen_size?: string }>({
    status: "",
    screen_size: ""
  })

  const itemsStatus: MenuProps["items"] = [
    {
      label: <div>Còn hàng</div>,
      key: "available"
    },
    {
      label: <div>Ngừng sản xuất</div>,
      key: "discontinued"
    },
    {
      label: <div>Hết hàng</div>,
      key: "out_of_stock"
    }
  ]

  const itemsScreenSizeList: MenuProps["items"] = dataFilter?.data?.screen_size_list.map((item: string) => ({
    label: <div>{item} inch</div>,
    key: item
  }))

  console.log(itemsScreenSizeList)
  console.log(selectedParams)

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
    setSelectedParams((prev) => ({ ...prev, [field]: value })) // lưu lại nếu cần
    const params: queryParamsCollection = {
      ...queryConfig,
      [field]: value
    }
    console.log(params)
    navigate(
      {
        pathname: `/collections/${slug}`,
        search: createSearchParams(params).toString()
      },
      {
        state: {
          type_filter: type_filter
        }
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
        {isLoading && <Skeleton />}
        {!isFetching && slug && (
          <div>
            {slug.includes("ban-phim") ? (
              ""
            ) : (
              <img
                className="rounded-lg shadow-md h-[300px] w-full"
                src={(CategoryBanner as Record<string, string>)[slug]}
                alt={`Banner ${slug}`}
              />
            )}
            <div className="bg-white p-4 my-4 rounded-lg shadow-md">
              <div className="mt-1 mb-3 flex items-center gap-3">
                <div className="border border-gray-300 rounded-md px-2 py-1 flex items-center gap-1">
                  <ListFilter size={16} />
                  <span className="text-[13px]">Bộ lọc</span>
                </div>
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    items: itemsStatus,
                    onClick: ({ key }) => handleChangeQuery("status", key)
                  }}
                >
                  <button className="border border-gray-300 rounded-md px-3 py-1 bg-white hover:bg-gray-50 flex items-center gap-1">
                    <Space>
                      <span className="text-[13px]">
                        {selectedParams.status
                          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (itemsStatus.find((item) => item?.key === selectedParams.status) as any)?.label
                          : "Tình trạng sản phẩm"}
                      </span>
                      <DownOutlined />
                    </Space>
                  </button>
                </Dropdown>
                <Dropdown
                  trigger={["click"]}
                  menu={{ items: itemsScreenSizeList, onClick: ({ key }) => handleChangeQuery("screen_size", key) }}
                >
                  <button className="border border-gray-300 rounded-md px-3 py-1 bg-white hover:bg-gray-50 flex items-center gap-1">
                    <Space>
                      <span className="text-[13px]">
                        {itemsScreenSizeList && selectedParams.screen_size
                          ? (
                              itemsScreenSizeList.find(
                                (item) => item?.key?.toString() === selectedParams.screen_size
                              ) as any
                            )?.label
                          : "Kích thước màn hình"}
                      </span>
                      <DownOutlined />
                    </Space>
                  </button>
                </Dropdown>
                <Dropdown menu={{ items: itemSSDList }} trigger={["click"]}>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="border border-gray-300 rounded-md px-3 py-1 bg-white hover:bg-gray-50 flex items-center gap-1"
                  >
                    <Space>
                      <span className="text-[13px]">CPU</span>
                      <DownOutlined />
                    </Space>
                  </button>
                </Dropdown>
                <Dropdown menu={{ items: itemRamList }} trigger={["click"]}>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="border border-gray-300 rounded-md px-3 py-1 bg-white hover:bg-gray-50 flex items-center gap-1"
                  >
                    <Space>
                      <span className="text-[13px]">RAM</span>
                      <DownOutlined />
                    </Space>
                  </button>
                </Dropdown>
                <Dropdown menu={{ items: itemCpuList }} trigger={["click"]}>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="border border-gray-300 rounded-md px-3 py-1 bg-white hover:bg-gray-50 flex items-center gap-1"
                  >
                    <Space>
                      <span className="text-[13px]">SSD</span>
                      <DownOutlined />
                    </Space>
                  </button>
                </Dropdown>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {result?.result.length > 0 ? (
                  result?.result.map((item) => {
                    return (
                      <div key={item._id}>
                        <ProductItem item={item} />
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center w-full col-span-5">
                    <Empty description={"Không có sản phẩm"} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
