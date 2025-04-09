import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Helmet } from "react-helmet-async"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { collectionAPI } from "src/Apis/collections.api"
import Breadcrumb from "src/Client/Components/Breadcrumb"
import Skeleton from "src/Components/Skeleton"
import { HttpStatusCode } from "src/Constants/httpStatus"
import { path } from "src/Constants/path"
import { CalculateSalePrice, formatCurrency } from "src/Helpers/common"
import { CollectionItemType, ProductDetailType } from "src/Types/product.type"
import { SuccessResponse } from "src/Types/utils.type"
import star from "src/Assets/img/star.png"
import { Check } from "lucide-react"
import ProductItem from "../Collection/Components/ProductItem"
import { useRef } from "react"

export default function ProductDetail() {
  const { state: nameCategory } = useLocation()
  const { name } = useParams()
  const imgRef = useRef<HTMLImageElement>(null)
  const navigate = useNavigate()

  const { data, isError, isFetching, isLoading, error } = useQuery({
    queryKey: ["productDetail", name],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)

      return collectionAPI.getProductDetail(name as string)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 5 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<ProductDetailType[]>
  const productDetail = result?.result[0] as ProductDetailType
  const brandProduct = productDetail?.brand
  const categoryProduct = productDetail?.category
  const idProduct = productDetail?._id

  const getProductRelated = useQuery({
    queryKey: ["productRelated", idProduct], // nếu name khác gì thì cái query này sẽ fetch lại // kiểu đánh dấu
    queryFn: () => {
      return collectionAPI.getProductRelated({
        brand: brandProduct,
        category: categoryProduct,
        idProduct: idProduct
      })
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 5 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData,
    enabled: !!brandProduct && !!categoryProduct && !!idProduct // chỉ gọi api khi brand và category có giá trị
  })

  const dataListProductRelated = getProductRelated.data?.data as SuccessResponse<CollectionItemType[]>
  const listProductRelated = dataListProductRelated?.result as CollectionItemType[]

  if (isError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.response?.status === HttpStatusCode.NotFound) {
      navigate(path.NotFound)
    }
  }

  const handleZoom = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect() // lấy tọa độ
    const image = imgRef.current as HTMLImageElement // lấy ảnh
    const { naturalWidth, naturalHeight } = image // w và h ảnh gốc
    const { offsetX, offsetY } = event.nativeEvent // lấy tọa độ chuột
    if (image) {
      image.style.width = naturalWidth + "px"
      image.style.height = naturalHeight + "px"
      image.style.maxWidth = "unset" // max-width mặc định
      const top1 = offsetY * (1 - naturalHeight / rect.height) // kích thước gốc / kích thước pt
      const left1 = offsetX * (1 - naturalWidth / rect.width) // kích thước gốc / kích thước pt
      image.style.top = top1 + "px" // tọa độ chuột * (1 - kích thước gốc / kích thước pt)
      image.style.left = left1 + "px" // tọa độ chuột * (1 - kích thước gốc / kích thước pt)
    }
  }

  const handleResetZoom = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const image = imgRef.current as HTMLImageElement // lấy ảnh
    const rect = event.currentTarget.getBoundingClientRect() // lấy tọa độ
    image.style.top = 0 + "px" // tọa độ chuột * (1 - kích thước gốc / kích thước pt)
    image.style.left = 0 + "px" // tọa độ chuột * (1 - kích thước gốc / kích thước pt)
    if (image) {
      image.style.width = rect.width + "px"
      image.style.height = rect.height + "px"
    }
  }

  return (
    <div className="container">
      {isLoading && <Skeleton />}
      {!isFetching && name && (
        <div>
          <Helmet>
            <title>{productDetail.name}</title>
            <meta
              name="description"
              content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
            />
          </Helmet>
          <Breadcrumb slug_1={nameCategory} slug_2={productDetail.name} />
          <div>
            <div className="bg-white rounded-[4px] my-4 grid grid-cols-6 gap-6 p-6 pt-4">
              <div className="col-span-2 border-r border-r-[#dedede]">
                <div
                  className="relative pt-[100%] cursor-zoom-in overflow-hidden"
                  onMouseMove={handleZoom}
                  onMouseLeave={handleResetZoom}
                >
                  <img
                    ref={imgRef}
                    loading="lazy"
                    src={productDetail.banner.url}
                    alt={productDetail.name}
                    className="absolute top-0 left-0 object-cover w-full h-auto pointer-events-none"
                  />
                </div>
                <div className="flex items-center gap-1 w-full overflow-y-auto">
                  {productDetail.medias.map((item) => {
                    return (
                      <img
                        key={item.url}
                        loading="lazy"
                        src={item.url}
                        alt={item.url}
                        className="object-cover w-[90px] rounded-[4px] p-1 border border-[#dedede] cursor-pointer"
                      />
                    )
                  })}
                </div>
              </div>
              <div className="col-span-4">
                <h1 className="text-2xl font-semibold">{productDetail.name}</h1>
                <div className="mt-2 flex items-center gap-1">
                  <h3 className="text-base text-yellow-500 font-semibold">0.0</h3>
                  <img src={star} alt="ngôi sao icon" className="w-3 h-3" />
                  <span className="ml-3 text-base text-blue-500">Xem đánh giá</span>
                </div>
                <div className="mt-2 ">
                  {productDetail.discount > 0 && (
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-semibold text-red-500">
                        {CalculateSalePrice(productDetail.price, productDetail.discount)}₫
                      </h2>
                      <span className="block text-[16px] text-[#6d6e72] font-semibold line-through">
                        {formatCurrency(productDetail.price)}₫
                      </span>
                      <div className="py-[1px] px-1 rounded-sm border border-[#e30019] text-[#e30019] text-[11px]">
                        -{productDetail.discount}%
                      </div>
                    </div>
                  )}
                  {productDetail.discount === 0 && (
                    <h2 className="text-3xl font-semibold text-red-500">{formatCurrency(productDetail.price)}₫</h2>
                  )}
                </div>

                {productDetail.status === "out_of_stock" && (
                  <button className="mt-4 py-3 bg-[#bcbec2] rounded-md text-white w-[300px] text-lg">HẾT HÀNG</button>
                )}

                <div className="mt-4">
                  <div className="flex items-center gap-1 my-2">
                    <Check />
                    <span className="text-[15px] font-medium">Bảo hành chính hãng 24 tháng.</span>
                  </div>
                  <div className="flex items-center gap-1 my-2">
                    <Check />
                    <span className="text-[15px] font-medium">Hỗ trợ đổi mới trong 7 ngày.</span>
                  </div>
                  <div className="flex items-center gap-1 my-2">
                    <Check />
                    <span className="text-[15px] font-medium">Windows bản quyền tích hợp.</span>
                  </div>
                  <div className="flex items-center gap-1 my-2">
                    <Check />
                    <span className="text-[15px] font-medium">Miễn phí giao hàng toàn quốc.</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 bg-white rounded-[4px] my-4 p-6 pt-4">
              <h4 className="text-xl font-semibold">Sản phẩm tương tự</h4>
              <div className="mt-1 grid grid-cols-5 gap-2">
                {listProductRelated?.map((item) => {
                  return (
                    <div key={item._id}>
                      <ProductItem item={item} />
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="mt-2 bg-white rounded-[4px] my-4 p-6">
              <h4 className="text-xl font-medium">Thông tin sản phẩm</h4>
              <div className="mt-2 text-lg font-bold">Thông số kĩ thuật:</div>
              <div className="mt-2">
                {productDetail.specifications.length > 0 ? (
                  <div>
                    {productDetail.specifications?.map((item) => {
                      return (
                        <div key={item.name} className="flex items-stretch">
                          <div className="w-1/3 bg-[#f2f2f2] p-4 text-base text-[#428bca] font-bold border border-[#dedede] not-first:border-t-0 first:border-t-[#dedede]">
                            {item.name}
                          </div>
                          <div className="w-2/3 p-4 text-base border border-[#dedede] not-first:border-t-0 first:border-t-[#dedede]">
                            {item.value}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center font-base">Hiện tại sản phẩm chưa có thông số kĩ thuật</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
