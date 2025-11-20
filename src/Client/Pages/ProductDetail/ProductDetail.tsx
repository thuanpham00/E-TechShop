/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Helmet } from "react-helmet-async"
import { useNavigate, useParams } from "react-router-dom"
import Breadcrumb from "src/Client/Components/Breadcrumb"
import Skeleton from "src/Components/Skeleton"
import { HttpStatusCode } from "src/Constants/httpStatus"
import { path } from "src/Constants/path"
import { CalculateSalePrice, formatCurrency, getNameFromNameId } from "src/Helpers/common"
import { CartType, CollectionItemType, FavouriteType, ProductDetailType, ProductItemType } from "src/Types/product.type"
import { SuccessResponse } from "src/Types/utils.type"
import star from "src/Assets/img/star.png"
import { ChevronLeft, ChevronRight, Heart } from "lucide-react"
import ProductItem from "../Collection/Components/ProductItem"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-toastify"
import { getAccessTokenFromLS } from "src/Helpers/auth"
import InputNumberQuantity from "src/Client/Components/InputNumberQuantity"
import { motion } from "framer-motion"
import { Modal } from "antd"
import { collectionAPI } from "src/Apis/client/collections.api"
import ProductRecently from "src/Client/Components/ProductRecently"

export default function ProductDetail() {
  const queryClient = useQueryClient()
  const token = getAccessTokenFromLS()
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
        brand: brandProduct._id,
        category: categoryProduct._id,
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

  const [imageCurrent, setImageCurrent] = useState<number>()

  useEffect(() => {
    if (productDetail) {
      setImageCurrent(0)
    }
  }, [productDetail])

  const chooseImage = (index: number) => {
    if (index < 0) {
      setImageCurrent(productDetail.medias.length - 1)
    } else if (index > productDetail.medias.length - 1) {
      setImageCurrent(0)
    } else {
      setImageCurrent(index)
    }
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
      .mutateAsync(
        { product_id: productId, quantity: quantity },
        {
          onError: () => {
            toast.error("Thêm vào giỏ hàng thất bại", { autoClose: 1500 })
          }
        }
      )
      .then((res) => {
        queryClient.invalidateQueries({ queryKey: ["listCart", token] })
        toast.success(res.data.message, { autoClose: 1500 })

        window.dispatchEvent(new Event("cart-updated"))
      })
      .catch((err) => console.log(err))
  }

  const handleBuyNow = (productId: string, quantity: number) => {
    addProductToCartMutation
      .mutateAsync(
        { product_id: productId, quantity: quantity },
        {
          onError: () => {
            toast.error("Thêm vào giỏ hàng thất bại", { autoClose: 1500 })
          }
        }
      )
      .then((res) => {
        navigate(path.Cart, {
          state: {
            productId
          }
        })
        queryClient.invalidateQueries({ queryKey: ["listCart", token] })
        toast.success(res.data.message, { autoClose: 1500 })

        window.dispatchEvent(new Event("cart-updated"))
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    if (productDetail?._id) {
      setValueQuantity(1)
    }
  }, [productDetail?._id])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imgProductSelected, setImgProductSelected] = useState(0)

  const showModal = (imgCurrent: number) => {
    setImgProductSelected(imgCurrent)
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const MAX_LINES = 20
  const LINE_HEIGHT = 28 // prose-lg có line-height ~28px
  const COLLAPSED_HEIGHT = MAX_LINES * LINE_HEIGHT // 560px

  const descriptionRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [showButton, setShowButton] = useState<boolean>(false)

  useEffect(() => {
    if (productDetail?.description && descriptionRef.current) {
      setTimeout(() => {
        const actualHeight = descriptionRef.current?.scrollHeight || 0

        setShowButton(actualHeight > COLLAPSED_HEIGHT)
      }, 1000)
    }
  }, [productDetail?.description, COLLAPSED_HEIGHT])

  return (
    <div className="container">
      {isLoading && <Skeleton />}
      {!isFetching && name && (
        <div>
          <Helmet>
            <title>{productDetail?.name}</title>
            <meta
              name="description"
              content={
                productDetail
                  ? `${productDetail.name} chính hãng tại TECHZONE. Giá chỉ ${formatCurrency(productDetail.price)}đ. Miễn phí ship, bảo hành chính hãng.`
                  : "Chi tiết sản phẩm TECHZONE | Laptop, PC, Linh kiện..."
              }
            />
          </Helmet>

          <Breadcrumb slug_1={productDetail?.category.name} slug_2={productDetail?.name} />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-lg border border-gray-200 my-4 grid grid-cols-6 gap-6 p-6 pt-4">
              <div className="col-span-3">
                <div className="flex items-center">
                  {productDetail?.medias.length > 0 && (
                    <button
                      className="hover:bg-gray-200 p-2 duration-200 transition-all ease-linear
                   rounded-full"
                      onClick={() => chooseImage((imageCurrent || 0) - 1)}
                    >
                      <ChevronLeft />
                    </button>
                  )}
                  <button
                    onClick={() => showModal(imageCurrent as number)}
                    className="cursor-pointer flex justify-center w-full"
                  >
                    <img
                      ref={imgRef}
                      loading="lazy"
                      src={
                        productDetail?.medias.length > 0
                          ? productDetail?.medias[Number(imageCurrent)]?.url
                          : productDetail?.banner.url
                      }
                      alt={productDetail?.name}
                      className="object-cover w-[60%] h-[300px] pointer-events-none"
                    />
                  </button>
                  {productDetail?.medias.length > 0 && (
                    <button
                      className="hover:bg-gray-200 p-2 duration-200 transition-all ease-linear
                   rounded-full"
                    >
                      <ChevronRight onClick={() => chooseImage((imageCurrent || 0) + 1)} />
                    </button>
                  )}
                </div>
                <div className="mt-6 grid grid-cols-4 gap-4">
                  {productDetail?.medias.map((item, index) => {
                    const isActive = imageCurrent === index
                    return (
                      <button key={item.url} onClick={() => chooseImage(index)} className="relative">
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
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold max-w-[450px]">{productDetail?.name}</h1>
                  {productDetail?.isFeatured === "true" ? (
                    <span className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Nổi bật
                    </span>
                  ) : (
                    ""
                  )}
                </div>

                <div className="mt-2 flex items-center gap-1">
                  <span className="text-[14px] font-medium text-gray-500 block">Đã bán: {productDetail?.sold} | </span>
                  <h3 className="text-base text-yellow-500 font-semibold">0.0</h3>
                  <img src={star} alt="ngôi sao icon" className="w-3 h-3" />
                  <span className="ml-3 text-base text-blue-500">Xem đánh giá</span>
                </div>
                <div className="mt-2 ">
                  {productDetail?.discount > 0 && (
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
                  {productDetail?.discount === 0 && (
                    <h2 className="text-3xl font-semibold text-red-500">{formatCurrency(productDetail.price)}₫</h2>
                  )}
                  <span className="text-[13px] text-gray-500">Giá đã bao gồm VAT</span>
                </div>

                {productDetail?.status === "available" && (
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

                <div className="flex items-center gap-2 mt-4 w-full">
                  {productDetail?.status === "out_of_stock" && (
                    <button className="py-2 bg-[#bcbec2] rounded-md text-white text-[15px] w-[80%]">HẾT HÀNG</button>
                  )}

                  {productDetail?.status === "discontinued" && (
                    <button className="py-2 bg-[#bcbec2] rounded-md text-white text-[15px] w-[50%]">
                      Ngừng sản xuất
                    </button>
                  )}

                  {productDetail?.status === "available" && (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        type="button"
                        onClick={() => addProductToCart(productDetail._id, valueQuantity)}
                        className="flex-1 py-2 border-2 border-red-600 hover:bg-red-100 duration-200  rounded-md text-red-600 min-w-[180px] text-sm font-semibold"
                      >
                        Thêm vào giỏ hàng
                      </button>
                      <button
                        onClick={() => handleBuyNow(productDetail._id, valueQuantity)}
                        type="button"
                        className="flex-1 py-2 border-2 border-red-600 bg-red-600 hover:bg-red-400 hover:border-red-400 duration-200 rounded-md text-white min-w-[150px] text-sm font-semibold"
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
                      {productDetail?.specifications.map((item) => {
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
            <div className="mt-2 bg-white border border-gray-200 rounded-lg my-4 p-6 pt-4">
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
            <div className="mt-2 bg-white border border-gray-200 rounded-lg my-4 p-6">
              <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-6">
                Thông tin sản phẩm
              </h4>

              <div className="mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full"></div>
                  <h5 className="text-xl font-bold text-gray-800">Thông số kỹ thuật</h5>
                </div>

                {productDetail?.specifications.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                    <table className="w-full">
                      <tbody>
                        {productDetail.specifications?.map((item, index) => {
                          const isEven = index % 2 === 0

                          return (
                            <tr
                              key={item.name}
                              className={`group transition-colors duration-200 ${isEven ? "bg-gray-50" : "bg-white"}`}
                            >
                              <td className="w-1/3 p-4 border-r border-gray-200">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-blue-600 uppercase tracking-wide text-sm">
                                    {item.name}
                                  </span>
                                </div>
                              </td>
                              <td className="w-2/3 p-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-700 font-medium text-base">{item.value}</span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-gray-500 font-medium">Hiện tại sản phẩm chưa có thông số kỹ thuật</p>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full"></div>
                  <h5 className="text-xl font-bold text-gray-800">Mô tả sản phẩm</h5>
                </div>

                {productDetail?.description === "<p>Đợi cập nhật</p>" ? (
                  <div
                    ref={descriptionRef}
                    className="text-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                  >
                    <div className="text-6xl mb-4">⏳</div>
                    <div
                      className="prose max-w-none text-purple-600 font-semibold"
                      dangerouslySetInnerHTML={{ __html: productDetail.description }}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <div
                      ref={descriptionRef}
                      className={`prose prose-lg max-w-none 
          prose-headings:text-gray-800 prose-headings:font-bold
          prose-p:text-gray-600 prose-p:leading-relaxed
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-800 prose-strong:font-bold
          prose-ul:list-disc prose-ul:ml-6
          prose-ol:list-decimal prose-ol:ml-6
          prose-img:rounded-xl prose-img:shadow-md pb-6
          bg-gray-50 ${!isExpanded ? "max-h-[560px] overflow-hidden" : "max-h-none"}`}
                      dangerouslySetInnerHTML={{ __html: productDetail?.description }}
                    />

                    {showButton && !isExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent pointer-events-none rounded-b-xl" />
                    )}

                    {showButton && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20">
                        <button
                          className="flex items-center gap-2 text-blue-500"
                          onClick={() => {
                            setIsExpanded((prev) => !prev)
                            // setShowButton(false)
                          }}
                        >
                          <span className="text-blue-500">{isExpanded ? "Thu gọn bài viết" : "Đọc tiếp bài viết"}</span>
                          <svg
                            className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <ProductRecently />
            </div>
          </motion.div>

          <Modal
            closable={{ "aria-label": "Custom Close Button" }}
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
          >
            <img
              src={
                productDetail?.medias.length > 0
                  ? productDetail.medias[imgProductSelected].url
                  : productDetail?.banner.url
              }
              alt={productDetail?.medias.length > 0 ? productDetail.medias[imgProductSelected].url : ""}
            />
          </Modal>
        </div>
      )}
    </div>
  )
}
