import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Eye, Star } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { useNavigate, useParams } from "react-router-dom"
import { Fragment } from "react/jsx-runtime"
import { collectionAPI } from "src/Apis/collections.api"
import { CategoryBanner } from "src/Client/Constants/categories"
import { HttpStatusCode } from "src/Constants/httpStatus"
import { path } from "src/Constants/path"
import { CalculateSalePrice, ConvertAverageRating, formatCurrency } from "src/Helpers/common"
import { SuccessResponse } from "src/Types/utils.type"
import image_default from "src/Assets/img/anh_default_url.jpg"
import { useState } from "react"
import { CollectionItemType } from "src/Types/product.type"
import Skeleton from "src/Components/Skeleton"
import Breadcrumb from "src/Client/Components/Breadcrumb"

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

  const [imageChange, setImageChange] = useState<string | null>("")
  const handleHoverProduct = (id: string) => {
    setImageChange(id)
  }

  return (
    <div>
      <Helmet>
        <title>TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <div className="container">
        <Breadcrumb slug={slug as string} />
        {isLoading && <Skeleton />}
        {!isFetching && slug && (
          <div>
            <img
              className="rounded-[4px]"
              src={(CategoryBanner as Record<string, string>)[slug]}
              alt={`Banner ${slug}`}
            />
            <div className="bg-white rounded-[4px] mb-4 mt-4 grid grid-cols-5 gap-2 p-4">
              {result?.result.map((item) => {
                const hasMedias = item.medias.length > 0
                const imageDefault = hasMedias ? item.medias[0].url : image_default
                const imageHover =
                  imageChange !== "" && item.medias.length > 1
                    ? item.medias[1].url
                    : item.medias.length > 0
                      ? item.medias[0].url
                      : image_default // Nếu không có ảnh, dùng `image_default`
                return (
                  <div
                    key={item._id}
                    className="col-span-1 border border-[#dedede] rounded-[4px] p-4 pt-[6px] bg-white transition-all ease-in cursor-pointer"
                    onMouseEnter={() => handleHoverProduct(item._id)}
                    onMouseLeave={() => handleHoverProduct("")}
                  >
                    <div className="flex flex-col justify-between">
                      <img
                        src={item._id === imageChange ? imageHover : imageDefault}
                        alt={item.name}
                        className="object-cover w-full duration-200 transition-all"
                      />
                      <span className="text-[14px] font-bold">{item.name}</span>
                      {item.discount ? (
                        <Fragment>
                          <span className="block text-[14px] line-through text-[#6d7e72] font-semibold">
                            {formatCurrency(item.price)}₫
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="block text-[16px] text-[#e30019] font-semibold">
                              {CalculateSalePrice(item.price, item.discount)}₫
                            </span>
                            <div className="py-[1px] px-1 rounded-sm border border-[#e30019] text-[#e30019] text-[11px]">
                              -{item.discount}%
                            </div>
                          </div>
                        </Fragment>
                      ) : (
                        <Fragment>
                          <span className="opacity-0 text-[14px] line-through text-[#6d7e72] font-semibold">1</span>
                          <span className="block text-[16px] text-[#e30019] font-semibold">
                            {formatCurrency(item.price)}₫
                          </span>
                        </Fragment>
                      )}
                      <div className="flex justify-between items-center gap-1">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-[2px]">
                            <span className="text-[13px] font-semibold text-[#FF8A00]">
                              {ConvertAverageRating(item.averageRating)}
                            </span>
                            <Star color="#FF8A00" size={13} />
                          </div>
                          <div className="text-[13px] text-[#6d7e72]">({item.reviews.length} đánh giá)</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye color="#6d7e72" size={14} />
                          <span className="text-[13px]">{item.viewCount}</span>
                        </div>
                      </div>
                    </div>
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
