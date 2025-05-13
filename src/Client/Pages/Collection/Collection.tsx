import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Helmet } from "react-helmet-async"
import { useNavigate, useParams } from "react-router-dom"
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

export default function Collection() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data, isError, isFetching, isLoading, error } = useQuery({
    queryKey: ["collections", slug],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)

      return collectionAPI
        .getCollections(slug as string, controller.signal)
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
            <img
              className="rounded-lg shadow-md"
              src={(CategoryBanner as Record<string, string>)[slug]}
              alt={`Banner ${slug}`}
            />
            <div className="bg-white rounded-lg shadow-md mb-4 mt-4 grid grid-cols-5 gap-2 p-4">
              {result?.result.map((item) => {
                return (
                  <div key={item._id}>
                    <ProductItem item={item} />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
