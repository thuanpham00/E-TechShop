/* eslint-disable import/no-unresolved */
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
import { Check, ChevronLeft, ChevronRight, CirclePlus, Cpu, Heart, Star } from "lucide-react"
import ProductItem from "../Collection/Components/ProductItem"
import { Fragment, useContext, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-toastify"
import { getAccessTokenFromLS } from "src/Helpers/auth"
import InputNumberQuantity from "src/Client/Components/InputNumberQuantity"
import { motion } from "framer-motion"
import { Divider, Modal } from "antd"
import { collectionAPI } from "src/Apis/client/collections.api"
import ProductRecently from "src/Client/Components/ProductRecently"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation } from "swiper/modules"
// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { AppContext } from "src/Context/authContext"

export default function ProductDetail() {
  const queryClient = useQueryClient()
  const token = getAccessTokenFromLS()
  const { name } = useParams()
  const id = getNameFromNameId(name as string)
  const imgRef = useRef<HTMLImageElement>(null)
  const [valueQuantity, setValueQuantity] = useState<number>(1)
  const navigate = useNavigate()
  const { socket } = useContext(AppContext)
  const [quantityAvailable, setQuantityAvailable] = useState<number>(0)

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
    staleTime: 1 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<ProductDetailType[]>
  const productDetail = result?.result[0] as ProductDetailType
  const brandProduct = productDetail?.brand
  const categoryProduct = productDetail?.category
  const idProduct = productDetail?._id

  useEffect(() => {
    if (productDetail) {
      setQuantityAvailable(productDetail.stock)
    }
  }, [productDetail])

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
    staleTime: 10 * 60 * 1000, // dưới 5 phút nó không gọi lại api
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
        { product_id: productId, quantity: quantity, added_at: new Date() },
        {
          onError: () => {
            toast.error("Vui lòng đăng nhập để tiếp tục", { autoClose: 1500 })
            navigate(`${path.Login}?redirect_url=${encodeURIComponent(`/products/${name}`)}`)
          }
        }
      )
      .then((res) => {
        queryClient.invalidateQueries({ queryKey: ["listCart", token] })
        toast.success(res.data.message, { autoClose: 1500 })
      })
      .catch((err) => console.log(err))
  }

  const handleBuyNow = (productId: string, quantity: number) => {
    addProductToCartMutation
      .mutateAsync(
        { product_id: productId, quantity: quantity, added_at: new Date() },
        {
          onError: () => {
            toast.error("Vui lòng đăng nhập để tiếp tục", { autoClose: 1500 })
            navigate(`${path.Login}?redirect_url=${encodeURIComponent(`/products/${name}`)}`)
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

  const specificationScrollRef = useRef<HTMLDivElement>(null)
  const reviewScrollRef = useRef<HTMLDivElement>(null)

  const handleScrollSpecification = () => {
    const el = specificationScrollRef.current
    if (el) {
      // el.getBoundingClientRect().top → vị trí của element so với phần nhìn thấy của màn hình (viewport).
      // window.pageYOffset → số pixel đã scroll từ trên xuống.

      const headerOffset = 0
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - headerOffset - 170 // thêm một chút khoảng cách
      window.scrollTo({ top: offsetPosition, behavior: "smooth" })
    }
  }

  const handleScrollReview = () => {
    const el = reviewScrollRef.current
    if (el) {
      // el.getBoundingClientRect().top → vị trí của element so với phần nhìn thấy của màn hình (viewport).
      // window.pageYOffset → số pixel đã scroll từ trên xuống.

      const headerOffset = 0
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - headerOffset - 370 // thêm một chút khoảng cách
      window.scrollTo({ top: offsetPosition, behavior: "smooth" })
    }
  }

  useEffect(() => {
    if (!socket) return
    const handleRefetchProduct = (data: any) => {
      const { dataProduct } = data.payload
      const productUpdate = dataProduct.find((item: { id: string; stock: number }) => item.id === productDetail?._id)

      if (productUpdate) {
        console.log(productUpdate)
        setQuantityAvailable(productUpdate.stock)
      }
    }

    // update số lượng sản phẩm đồng bộ
    socket.on("client:update_quantity_product_display", handleRefetchProduct)

    return () => {
      socket.off("client:update_quantity_product_display", handleRefetchProduct)
    }
  }, [socket, queryClient, productDetail, id])

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
            {/* Responsive: grid-cols-1 (mobile), md:grid-cols-2, lg:grid-cols-6 */}
            <div className="bg-white rounded-lg border border-gray-200 my-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 p-4 md:p-6 pt-4">
              {/* Ảnh sản phẩm */}
              <div className="lg:col-span-3 md:col-span-1 col-span-1">
                <div className="flex items-center justify-center">
                  {productDetail?.medias.length > 0 && (
                    <button
                      className="hover:bg-gray-200 p-2 duration-200 transition-all ease-linear rounded-full"
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
                      className="object-contain w-full max-w-[340px] md:max-w-[400px] lg:max-w-[60%] h-[200px] md:h-[300px] lg:h-[340px] pointer-events-none"
                    />
                  </button>
                  {productDetail?.medias.length > 0 && (
                    <button className="hover:bg-gray-200 p-2 duration-200 transition-all ease-linear rounded-full">
                      <ChevronRight onClick={() => chooseImage((imageCurrent || 0) + 1)} />
                    </button>
                  )}
                </div>
                <div className="mt-6 grid grid-cols-4 gap-2 md:gap-4">
                  {productDetail?.medias.map((item, index) => {
                    const isActive = imageCurrent === index
                    return (
                      <button key={item.url} onClick={() => chooseImage(index)} className="relative">
                        <img
                          loading="lazy"
                          src={item.url}
                          alt={item.url}
                          className="object-cover rounded-[4px] p-1 border border-[#dedede] cursor-pointer w-full h-[48px] md:h-[60px] lg:h-[120px]"
                        />
                        {isActive && <div className="absolute inset-0 border-2 border-red-500"></div>}
                      </button>
                    )
                  })}
                </div>
              </div>
              {/* Thông tin sản phẩm */}
              <div className="lg:col-span-3 md:col-span-1 col-span-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-semibold max-w-full md:max-w-[450px]">
                    {productDetail?.name}
                  </h1>
                  {productDetail?.isFeatured === "true" ? (
                    <span className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Nổi bật
                    </span>
                  ) : (
                    ""
                  )}
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-[13px] md:text-[14px] font-medium text-gray-500 block">
                    Đã bán: {productDetail?.sold} |{" "}
                  </span>
                  <h3 className="text-base text-yellow-500 font-semibold">{productDetail.averageRating}</h3>
                  <img src={star} alt="ngôi sao icon" className="w-3 h-3" />
                </div>
                <div className="mt-4 flex items-center gap-2 md:gap-4 flex-wrap">
                  {/* so sánh sản phẩm */}
                  <button
                    className="flex items-center gap-1 border border-[#3a86ff] px-3 py-1 rounded-md hover:bg-blue-50 duration-200"
                    onClick={() =>
                      navigate(path.CompareProduct, {
                        state: {
                          productCurrent: productDetail,
                          category: categoryProduct.name
                        }
                      })
                    }
                  >
                    <CirclePlus color="#3a86ff" size={18} />
                    <span className="text-[#3a86ff] font-medium text-[13px]">So sánh</span>
                  </button>
                  <button
                    className="flex items-center gap-1 border border-[#3a86ff] px-3 py-1 rounded-md hover:bg-blue-50 duration-200"
                    type="button"
                    onClick={handleScrollSpecification}
                  >
                    <Cpu color="#3a86ff" size={18} />
                    <span className="text-[#3a86ff] font-medium text-[13px]">Thông số</span>
                  </button>
                  <button
                    className="flex items-center gap-1 border border-[#3a86ff] px-3 py-1 rounded-md hover:bg-blue-50 duration-200"
                    onClick={handleScrollReview}
                  >
                    <Star color="#3a86ff" size={18} />
                    <span className="text-[#3a86ff] font-medium text-[13px]">Đánh giá</span>
                  </button>
                  <button
                    onClick={() => handleAddProductToFavourite(productDetail._id)}
                    className={`hidden md:flex items-center gap-1 border px-3 py-1 rounded-md duration-200
    ${
      liked
        ? "border-red-500 bg-red-500 hover:bg-red-400 text-white"
        : "border-red-500 bg-white hover:bg-blue-50 text-red-500"
    }`}
                  >
                    {liked ? (
                      <Heart className="" color="white" size={18} />
                    ) : (
                      <Heart className="text-red-500" size={18} />
                    )}
                    <span className={`font-medium text-[13px] ${liked ? "text-white" : "text-red-500"}`}>
                      Yêu thích
                    </span>
                  </button>
                </div>
                <div className="mt-2 ">
                  {productDetail?.discount > 0 && (
                    <div className="flex items-center gap-2 md:gap-3 my-4 flex-wrap">
                      <h2 className="text-2xl md:text-3xl font-semibold text-red-500">
                        {CalculateSalePrice(productDetail.price, productDetail.discount)}₫
                      </h2>
                      <span className="block text-[15px] md:text-[16px] text-[#6d6e72] font-semibold line-through">
                        {formatCurrency(productDetail.price)}₫
                      </span>
                      <div className="py-[1px] px-1 rounded-sm border border-[#e30019] text-[#e30019] text-[11px]">
                        -{productDetail.discount}%
                      </div>
                    </div>
                  )}
                  {productDetail?.discount === 0 && (
                    <h2 className="text-2xl md:text-3xl font-semibold text-red-500">
                      {formatCurrency(productDetail.price)}₫
                    </h2>
                  )}
                  <span className="text-[12px] md:text-[13px] text-gray-500">Giá đã bao gồm VAT</span>
                </div>
                {productDetail?.status === "available" && (
                  <div className="flex items-center gap-4 md:gap-8 my-4 flex-wrap">
                    <span className="text-gray-500">Số lượng</span>
                    <InputNumberQuantity
                      value={valueQuantity}
                      onChangeValue={handleValueQuantity}
                      onDecrease={handleValueQuantity}
                      onIncrease={handleValueQuantity}
                      max={productDetail.stock}
                    />
                    <span className="text-gray-500">{quantityAvailable} Sản phẩm có sẵn</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-4 w-full flex-wrap">
                  {productDetail?.status === "out_of_stock" && (
                    <button className="py-2 bg-[#bcbec2] rounded-md text-white text-[15px] w-full md:w-[80%]">
                      HẾT HÀNG
                    </button>
                  )}
                  {productDetail?.status === "discontinued" && (
                    <button className="py-2 bg-[#bcbec2] rounded-md text-white text-[15px] w-full md:w-[50%]">
                      Ngừng sản xuất
                    </button>
                  )}
                  {productDetail?.status === "available" && (
                    <div className="flex items-center gap-2 w-full flex-wrap">
                      <button
                        type="button"
                        onClick={() => addProductToCart(productDetail._id, valueQuantity)}
                        className="flex-1 py-2 border-2 border-red-600 hover:bg-red-100 duration-200 rounded-md text-red-600 min-w-[120px] md:min-w-[180px] text-sm font-semibold"
                      >
                        Thêm vào giỏ hàng
                      </button>
                      <button
                        onClick={() => handleBuyNow(productDetail._id, valueQuantity)}
                        type="button"
                        className="flex-1 py-2 border-2 border-red-600 bg-red-600 hover:bg-red-400 hover:border-red-400 duration-200 rounded-md text-white min-w-[100px] md:min-w-[150px] text-sm font-semibold"
                      >
                        Mua ngay
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                  <div className="hidden lg:flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50">
                    <div className="text-blue-600 text-xl">🚚</div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Miễn phí vận chuyển</div>
                      <div className="text-xs text-gray-500">Đơn hàng từ 500k</div>
                    </div>
                  </div>
                  <div className="hidden lg:flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-green-100 to-green-50">
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
                  <div className="hidden lg:flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50">
                    <div className="text-orange-600 text-xl">🔁</div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Đổi trả dễ dàng</div>
                      <div className="text-xs text-gray-500">Trong 7 ngày</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Sản phẩm tương tự */}
            <div className="mt-2 bg-white border border-gray-200 rounded-lg my-4 p-4 md:p-6 pt-4 relative">
              <h4 className="text-xl font-semibold mb-2">Sản phẩm tương tự</h4>
              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={20}
                navigation={{
                  nextEl: ".custom-next",
                  prevEl: ".custom-prev"
                }}
                slidesPerView={1}
                className="mySwiper relative"
                breakpoints={{
                  320: { slidesPerView: 2 },
                  480: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 },
                  1280: { slidesPerView: 4 }
                }}
                style={{ paddingBottom: 6 }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={true}
              >
                {listProductRelated?.map((review) => (
                  <SwiperSlide key={review._id}>
                    <ProductItem item={review} />
                  </SwiperSlide>
                ))}
              </Swiper>

              <button className="custom-prev">
                <ChevronLeft />
              </button>

              <button className="custom-next">
                <ChevronRight />
              </button>
            </div>
            {/* Thông tin sản phẩm */}
            <div className="mt-2 bg-white border border-gray-200 rounded-lg my-4 p-4 md:p-6">
              <h4 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-6">
                Thông tin sản phẩm
              </h4>
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-4" ref={specificationScrollRef}>
                  <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full"></div>
                  <h5 className="text-lg md:text-xl font-bold text-gray-800">Thông số kỹ thuật</h5>
                </div>
                {productDetail?.specifications.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                    <table className="w-full">
                      <tbody>
                        {productDetail.specifications
                          .sort((a, b) => a.name.localeCompare(b.name))
                          ?.map((item, index) => {
                            const isEven = index % 2 === 0
                            return (
                              <tr
                                key={item.name}
                                className={`group transition-colors duration-200 ${isEven ? "bg-gray-50" : "bg-white"}`}
                              >
                                <td className="w-1/3 p-2 md:p-4 border-r border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-blue-600 uppercase tracking-wide text-xs md:text-sm">
                                      {item.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="w-2/3 p-2 md:p-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-700 font-medium text-xs md:text-base">{item.value}</span>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 md:py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-4xl md:text-6xl mb-4">📋</div>
                    <p className="text-gray-500 font-medium">Hiện tại sản phẩm chưa có thông số kỹ thuật</p>
                  </div>
                )}
              </div>
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full"></div>
                  <h5 className="text-lg md:text-xl font-bold text-gray-800">Mô tả sản phẩm</h5>
                </div>
                {productDetail?.description === "<p>Đợi cập nhật</p>" ? (
                  <div
                    ref={descriptionRef}
                    className="text-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                  >
                    <div className="text-4xl md:text-6xl mb-4">⏳</div>
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
                      <div className="absolute bottom-0 left-0 right-0 h-16 md:h-32 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent pointer-events-none rounded-b-xl" />
                    )}
                    {showButton && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
                        <button
                          className="flex items-center gap-2 text-blue-500"
                          onClick={() => {
                            setIsExpanded((prev) => !prev)
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

            {/* Đánh giá sản phẩm */}
            <div className="mt-4 bg-white border border-gray-200 rounded-lg my-4 p-4 md:p-6" ref={reviewScrollRef}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full"></div>
                <h5 className="text-lg md:text-xl font-bold text-gray-800">Đánh giá sản phẩm</h5>
              </div>
              {productDetail.reviews && productDetail.reviews.length > 0 && (
                <Fragment>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-semibold">{productDetail.averageRating}</span>
                    <img src={star} alt="ngôi sao icon" className="w-6 h-6" />
                    <span>
                      ({productDetail.reviews && productDetail.reviews.length > 0 ? productDetail.reviews.length : 0}{" "}
                      Đánh giá)
                    </span>
                  </div>
                  <Divider />
                </Fragment>
              )}

              <div>
                {productDetail.reviews && productDetail.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {productDetail.reviews.map((review) => (
                      <div key={review._id} className="border-b pb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <img
                            src={review.userId?.avatar}
                            alt={review.userId?.name}
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                          <span className="font-semibold">{review.userId?.name}</span>
                          <div className="text-xs text-green-700 p-2 py-1 bg-green-200 rounded-xl font-medium flex items-center gap-1">
                            <Check size={14} />
                            <span>Đã mua hàng</span>
                          </div>
                          <span className="ml-auto text-yellow-500 font-bold">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                          </span>
                        </div>
                        <div className="font-medium text-gray-800 mb-1">{review.title}</div>
                        <div className="text-gray-600">{review.comment}</div>
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {review.images.map((img) => (
                              <img
                                key={img.id}
                                src={img.url}
                                alt="review-img"
                                className="w-16 h-16 object-cover rounded border"
                              />
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(review.created_at).toLocaleString("vi-VN")}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 py-8 text-center">Chưa có đánh giá nào cho sản phẩm này.</div>
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
