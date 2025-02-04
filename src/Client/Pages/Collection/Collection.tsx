import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Eye, Star } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { useParams } from "react-router-dom"
import { Fragment } from "react/jsx-runtime"
import { collectionAPI } from "src/Client/Apis/collections.api"
import Breadcrumb from "src/Client/Components/Breadcrumb/Breadcrumb"
import { CategoryBanner } from "src/Client/Constants/categories"
import { CalculateSalePrice, ConvertAverageRating, formatCurrency } from "src/Helpers/common"
import { CollectionItemType } from "src/Types/collection.type"
import { SuccessResponse } from "src/Types/utils.type"

export default function Collection() {
  const { slug } = useParams()

  const getCollections = useQuery({
    queryKey: ["collections", slug],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return collectionAPI.getCollections(slug as string)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 5 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const data = getCollections.data?.data as SuccessResponse<CollectionItemType[]>

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
        <div className="">
          {getCollections.isLoading && (
            <div role="status" className="mt-6 animate-pulse">
              <div className="mb-4 h-4  rounded bg-gray-200" />
              <div className="mb-2.5 h-10  rounded bg-gray-200" />
              <div className="mb-2.5 h-10 rounded bg-gray-200" />
              <div className="mb-2.5 h-10  rounded bg-gray-200" />
              <div className="mb-2.5 h-10  rounded bg-gray-200" />
              <div className="mb-2.5 h-10  rounded bg-gray-200" />
              <div className="mb-2.5 h-10  rounded bg-gray-200" />
              <div className="mb-2.5 h-10  rounded bg-gray-200" />
              <div className="mb-2.5 h-10  rounded bg-gray-200" />
              <div className="mb-2.5 h-10  rounded bg-gray-200" />
              <div className="mb-2.5 h-10  rounded bg-gray-200" />
              <div className="mb-2.5 h-10  rounded bg-gray-200" />
              <div className="h-10  rounded bg-gray-200" />
              <span className="sr-only">Loading...</span>
            </div>
          )}
          {!getCollections.isFetching && slug && (
            <div>
              <img className="rounded-[4px]" src={(CategoryBanner as Record<string, string>)[slug]} alt="Banner" />
              <div className="bg-white rounded-[4px] mb-4 mt-4 grid grid-cols-5 gap-2 p-4">
                {data.result.map((item) => (
                  <div
                    key={item._id}
                    className="col-span-1 border border-[#dedede] rounded-[4px] p-4 pt-[6px] bg-white transition-all hover:-translate-y-2 ease-in cursor-pointer"
                  >
                    <div className="flex flex-col justify-between">
                      <img src={item.medias[0].url} alt={item.name} className="object-cover w-full" />
                      <span className="text-[14px] font-bold">{item.name}</span>
                      {item.discount ? (
                        <Fragment>
                          <span className="block text-[14px] line-through text-[#6d7e72] font-semibold">
                            {formatCurrency(item.price)}₫
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="block text-[16px] text-primaryRed font-semibold">
                              {CalculateSalePrice(item.price, item.discount)}₫
                            </span>
                            <div className="py-[1px] px-1 rounded-sm border border-primaryRed text-primaryRed text-[11px]">
                              -{item.discount}%
                            </div>
                          </div>
                        </Fragment>
                      ) : (
                        <Fragment>
                          <span className="opacity-0 text-[14px] line-through text-[#6d7e72] font-semibold">1</span>
                          <span className="block text-[16px] text-primaryRed font-semibold">
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
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
