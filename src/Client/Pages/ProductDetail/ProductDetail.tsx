/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Helmet } from "react-helmet-async"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { collectionAPI } from "src/Apis/collections.api"
import Breadcrumb from "src/Client/Components/Breadcrumb"
import Skeleton from "src/Components/Skeleton"
import { HttpStatusCode } from "src/Constants/httpStatus"
import { path } from "src/Constants/path"
import { CalculateSalePrice, formatCurrency, getNameFromNameId } from "src/Helpers/common"
import { CartType, CollectionItemType, FavouriteType, ProductDetailType, ProductItemType } from "src/Types/product.type"
import { SuccessResponse } from "src/Types/utils.type"
import star from "src/Assets/img/star.png"
import { Heart } from "lucide-react"
import ProductItem from "../Collection/Components/ProductItem"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-toastify"
import { getAccessTokenFromLS } from "src/Helpers/auth"
import InputNumberQuantity from "src/Client/Components/InputNumberQuantity"

export default function ProductDetail() {
  const queryClient = useQueryClient()
  const token = getAccessTokenFromLS()
  const { state: nameCategory } = useLocation()
  const { name } = useParams()
  const id = getNameFromNameId(name as string)
  const imgRef = useRef<HTMLImageElement>(null)
  const [valueQuantity, setValueQuantity] = useState<number>(1)
  const navigate = useNavigate()

  useEffect(() => {
    window.scroll(0, 0) // scroll mượt
  }, [])

  const { data, isError, isFetching, isLoading, error } = useQuery({
    queryKey: ["productDetail", id],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)

      return collectionAPI.getProductDetail(id as string)
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
    // staleTime: 5 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    // placeholderData: keepPreviousData,
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

  const [imageCurrent, setImageCurrent] = useState<string>()

  useEffect(() => {
    if (productDetail) {
      setImageCurrent(productDetail.medias[0].url)
    }
  }, [productDetail])

  const chooseImage = (img: string) => {
    setImageCurrent(img)
  }

  const addFavouriteMutation = useMutation({
    mutationFn: (body: FavouriteType) => {
      return collectionAPI.addProductToFavourite(body)
    }
  })

  const handleAddProductToFavourite = async (productId: string) => {
    // nếu sản phẩm đã tồn tại thì remove còn chưa tồn tại thì add vào
    addFavouriteMutation
      .mutateAsync({ product_id: productId, added_at: new Date() })
      .then((res) => {
        toast.success(res.data.message, { autoClose: 1500 })
        queryClient.invalidateQueries({ queryKey: ["listFavourite", token] })
      })
      .catch(() => {
        navigate(`${path.Login}?redirect_url=${encodeURIComponent(`/products/${name}`)}`)
      })
  }

  const { data: favouriteData } = useQuery({ queryKey: ["listFavourite", token] })

  const liked = useMemo(() => {
    if (productDetail) {
      const listFavourite = (favouriteData as any)?.data?.result?.products[0]?.products || []
      const check = listFavourite.some((item: ProductItemType) => item._id === productDetail._id)
      return check
    }
  }, [favouriteData, productDetail])

  const handleValueQuantity = (value: number) => {
    setValueQuantity(value)
  }

  // xử lý giỏ hàng
  const addProductToCartMutation = useMutation({
    mutationFn: (body: CartType) => {
      return collectionAPI.addProductToCart(body)
    }
  })

  const addProductToCart = async (productId: string, quantity: number) => {
    addProductToCartMutation
      .mutateAsync({ product_id: productId, quantity: quantity, added_at: new Date() })
      .then((res) => {
        queryClient.invalidateQueries({ queryKey: ["listCart", token] })
        toast.success(res.data.message, { autoClose: 1500 })
      })
      .catch((err) => console.log(err))
  }

  const handleBuyNow = (productId: string, quantity: number) => {
    addProductToCartMutation
      .mutateAsync({ product_id: productId, quantity: quantity, added_at: new Date() })
      .then((res) => {
        navigate(path.Cart, {
          state: {
            productId
          }
        })
        queryClient.invalidateQueries({ queryKey: ["listCart", token] })
        toast.success(res.data.message, { autoClose: 1500 })
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    if (productDetail?._id) {
      setValueQuantity(1)
    }
  }, [productDetail?._id])

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
            <div className="bg-white rounded-lg shadow-md my-4 grid grid-cols-6 gap-6 p-6 pt-4">
              <div className="col-span-2">
                <div
                  className="relative pt-[100%] cursor-zoom-in overflow-hidden"
                  onMouseMove={handleZoom}
                  onMouseLeave={handleResetZoom}
                >
                  <img
                    ref={imgRef}
                    loading="lazy"
                    src={imageCurrent}
                    alt={productDetail.name}
                    className="absolute top-0 left-0 object-cover w-full h-auto pointer-events-none"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {productDetail.medias.map((item) => {
                    const isActive = item.url === imageCurrent
                    return (
                      <button key={item.url} onClick={() => chooseImage(item.url)} className="relative">
                        <img
                          loading="lazy"
                          src={item.url}
                          alt={item.url}
                          className="object-cover col-span-1 rounded-[4px] p-1 border border-[#dedede] cursor-pointer"
                        />
                        {isActive && <div className="absolute inset-0 border-2 border-red-500"></div>}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="col-span-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold max-w-[500px]">{productDetail.name}</h1>
                  {productDetail.isFeatured === "true" ? (
                    <span className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Nổi bật
                    </span>
                  ) : (
                    ""
                  )}
                </div>

                <div className="mt-2 flex items-center gap-1">
                  <span className="text-[14px] font-medium text-gray-500 block">Đã bán: {productDetail.sold} | </span>
                  <h3 className="text-base text-yellow-500 font-semibold">0.0</h3>
                  <img src={star} alt="ngôi sao icon" className="w-3 h-3" />
                  <span className="ml-3 text-base text-blue-500">Xem đánh giá</span>
                </div>
                <div className="mt-2 ">
                  {productDetail.discount > 0 && (
                    <div className="flex items-center gap-3 my-4">
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
                  <span className="text-[13px] text-gray-500">Giá đã bao gồm VAT</span>
                </div>

                {productDetail.status === "available" && (
                  <div className="flex items-center gap-8 my-4">
                    <span className="text-gray-500">Số lượng</span>
                    <InputNumberQuantity
                      value={valueQuantity}
                      onChangeValue={handleValueQuantity}
                      onDecrease={handleValueQuantity}
                      onIncrease={handleValueQuantity}
                      max={productDetail.stock}
                    />
                    <span className="text-gray-500">{productDetail.stock} Sản phẩm có sẵn</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4">
                  {productDetail.status === "out_of_stock" && (
                    <button className="py-2 bg-[#bcbec2] rounded-md text-white w-[180px] text-[15px]">HẾT HÀNG</button>
                  )}

                  {productDetail.status === "discontinued" && (
                    <button className="py-2 bg-[#bcbec2] rounded-md text-white w-[180px] text-[15px]">
                      Ngừng sản xuất
                    </button>
                  )}

                  {productDetail.status === "available" && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addProductToCart(productDetail._id, valueQuantity)}
                        className="py-2 border-2 border-red-600 hover:bg-red-100 duration-200  rounded-md text-red-600 min-w-[180px] text-sm font-semibold"
                      >
                        Thêm vào giỏ hàng
                      </button>
                      <button
                        onClick={() => handleBuyNow(productDetail._id, valueQuantity)}
                        type="button"
                        className="py-2 border-2 border-red-600 bg-red-600 hover:bg-red-400 hover:border-red-400 duration-200 rounded-md text-white min-w-[150px] text-sm font-semibold"
                      >
                        Mua ngay
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleAddProductToFavourite(productDetail._id)}
                    className={`p-2 px-3 border border-red-400 duration-300 rounded-lg transition-all hover:shadow-md ${liked ? "bg-red-500 hover:bg-red-400" : "bg-red-100 hover:bg-red-200"}`}
                  >
                    {liked ? (
                      <Heart className="" color="white" size={18} />
                    ) : (
                      <Heart className="text-red-500" size={18} />
                    )}
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50">
                    <div className="text-blue-600 text-xl">🚚</div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Miễn phí vận chuyển</div>
                      <div className="text-xs text-gray-500">Đơn hàng từ 500k</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-green-100 to-green-50">
                    <div className="text-green-600 text-xl">🛡️</div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Bảo hành chính hãng</div>
                      {productDetail.specifications.map((item) => {
                        if (item.name === "Bảo hành") {
                          return (
                            <span key={item.name} className="text-xs font-medium">
                              {item.value}.
                            </span>
                          )
                        }
                      })}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50">
                    <div className="text-orange-600 text-xl">🔁</div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Đổi trả dễ dàng</div>
                      <div className="text-xs text-gray-500">Trong 7 ngày</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 bg-white rounded-lg shadow-md my-4 p-6 pt-4">
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
            <div className="mt-2 bg-white rounded-lg shadow-md my-4 p-6">
              <h4 className="text-xl font-medium">Thông tin sản phẩm</h4>
              <div className="mt-2 text-lg font-bold">Thông số kĩ thuật:</div>
              <div className="mt-2">
                {productDetail.specifications.length > 0 ? (
                  <div>
                    {productDetail.specifications?.map((item) => {
                      return (
                        <div key={item.name} className="flex items-stretch">
                          <div className="w-1/3 flex items-center bg-[#f2f2f2] p-4 text-base text-[#428bca] font-bold border border-[#dedede] not-first:border-t-0 first:border-t-[#dedede]">
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

              <div className="mt-4 prose max-w-none" dangerouslySetInnerHTML={{ __html: productDetail.description }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
