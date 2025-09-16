import avatarDefault from "src/Assets/img/avatarDefault.png"
import { Cpu, Heart, HeartOff, Info, LogOut, PackageSearch, ShoppingCart } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { path } from "src/Constants/path"
import { useContext, useEffect, useRef, useState } from "react"
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { userAPI } from "src/Apis/user.api"
import { toast } from "react-toastify"
import { AppContext } from "src/Context/authContext"
import Popover from "src/Components/Popover"
import cartImg from "src/Assets/img/cart.png"
import { motion } from "framer-motion"
import { collectionAPI } from "src/Apis/collections.api"
import { SuccessResponse } from "src/Types/utils.type"
import { ProductDetailType } from "src/Types/product.type"
import { CalculateSalePrice, formatCurrency, slugify } from "src/Helpers/common"
import { getAccessTokenFromLS } from "src/Helpers/auth"
import { OrderApi } from "src/Apis/order.api"
import useDebounce from "src/Hook/useDebounce"

export default function Header() {
  const navigate = useNavigate()
  const {
    isAuthenticated,
    nameUser,
    avatar,
    setIsAuthenticated,
    setNameUser,
    setRole,
    setIsShowCategory,
    setAvatar,
    setUserId
  } = useContext(AppContext)

  const token = getAccessTokenFromLS()
  const logoutMutation = useMutation({
    mutationFn: () => {
      return userAPI.logoutUser()
    }
  })

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: (response) => {
        setIsAuthenticated(false)
        setNameUser(null)
        setRole(null)
        setAvatar(null)
        setUserId(null)
        toast.success(response.data.message, {
          autoClose: 1000
        })
      }
    })
  }

  const handleShowCategory = () => {
    setIsShowCategory(true)
  }

  // xử lý danh sách yêu thích
  const { data } = useQuery({
    queryKey: ["listFavourite", token],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return collectionAPI.getProductInFavourite(controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 10 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData,
    enabled: !!isAuthenticated
  })

  const result = data?.data as SuccessResponse<{
    total: number
    products: {
      products: ProductDetailType[]
    }[]
  }>

  const { data: data2 } = useQuery({
    queryKey: ["listCart", token],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return collectionAPI.getProductInCart(controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 10 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData,
    enabled: !!isAuthenticated
  })

  const resultCart = data2?.data as SuccessResponse<{
    total: number
    products: {
      products: ProductDetailType[]
    }[]
  }>

  const { data: data3 } = useQuery({
    queryKey: ["listOrder", token],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return OrderApi.getOrders(controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 10 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData,
    enabled: !!isAuthenticated
  })

  const listFavourite = result?.result?.products[0]?.products
  const listCart = resultCart?.result?.products[0]?.products
  const lengthFavourite = result?.result?.total
  const lengthCart = resultCart?.result?.total
  const lengthOrder = data3?.data?.total

  const [searchText, setSearchText] = useState("")

  const inputSearchDebounce = useDebounce(searchText, 500)

  const getSearchProduct = useQuery({
    queryKey: ["searchProduct", inputSearchDebounce],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return collectionAPI.getSearchProduct({ search: inputSearchDebounce }, controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    enabled: inputSearchDebounce.trim() !== ""
  })

  const listProductFind = getSearchProduct?.data?.data as SuccessResponse<{
    total: { total: number }[]
    data: {
      _id: string
      name: string
      discount: number
      price: number
      banner: {
        type: string
        url: string
      }
    }[]
  }>

  const listProductData = listProductFind?.result?.data

  const searchRef = useRef<HTMLDivElement>(null)
  const [showListSearch, setShowListSearch] = useState(false)

  useEffect(() => {
    const shouldShow = listProductData?.length > 0 && searchText.trim() !== ""
    setShowListSearch(shouldShow)
  }, [listProductData?.length, searchText])

  useEffect(() => {
    const clickOutHideList = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowListSearch(false)
      }
    }

    document.addEventListener("mousedown", clickOutHideList)
    return () => document.removeEventListener("mousedown", clickOutHideList)
  }, [])

  return (
    <div className="bg-primaryBlue sticky top-0 left-0 z-20">
      <div className="container">
        <div className="grid grid-cols-12 items-center gap-4 py-3">
          <div className="col-span-3">
            <div className="flex items-center gap-2">
              <button className="w-[55%] flex items-center gap-1" onClick={() => navigate(path.Home)}>
                <Cpu color="white" className="mt-1" />
                <span className="text-white text-2xl font-bold text-center border-b-[3px] border-white dark:border-white">
                  TechZone
                </span>
              </button>
              <button
                onClick={handleShowCategory}
                className="w-[45%] bg-secondBlue rounded-[4px] p-3 hover:bg-secondBlue/50 transition ease-in duration-100 cursor-pointer flex items-center gap-2"
              >
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="-0.00012207" y="0.000190735" width="18" height="2" rx="1" fill="white"></rect>
                  <rect x="-0.00012207" y="5.99999" width="18" height="2" rx="1" fill="white"></rect>
                  <rect x="-0.00012207" y="12.0001" width="18" height="2" rx="1" fill="white"></rect>
                </svg>
                <span className="text-[13px] text-white font-semibold">Danh mục</span>
              </button>
            </div>
          </div>
          <div className="col-span-4">
            <form className="w-full relative flex">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onFocus={() => setShowListSearch(true)}
                className="flex-grow text-[13px] p-3 outline-none rounded-[4px] pr-8"
                placeholder="Bạn cần tìm gì?"
              />
              <div className="absolute top-1/2 -translate-y-1/2 right-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="black"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>

              <div
                className={`absolute top-12 bg-white w-full rounded shadow z-50 transition-all ease-linear duration-100 overflow-hidden ${
                  showListSearch && searchText.trim() !== "" ? "opacity-100" : "opacity-0"
                }`}
                ref={searchRef}
              >
                <div className="max-h-[500px] overflow-y-auto">
                  {listProductData && listProductData.length > 0 ? (
                    listProductData.map((item) => (
                      <Link
                        to={`/products/${slugify(item.name)}-i-${item._id}`}
                        key={item._id}
                        onClick={() => setShowListSearch(false)}
                      >
                        <div
                          className={`cursor-pointer hover:bg-gray-100 px-3 py-2 border-b border-gray-200 last:border-b-0`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1 pr-2">
                              <div className="text-sm font-medium text-gray-800">{item.name}</div>
                              <div className="flex items-center gap-2">
                                <span className="text-red-500 font-semibold text-sm">
                                  {CalculateSalePrice(item.price, item.discount)}đ
                                </span>
                                <span className="text-gray-400 line-through text-xs">
                                  {formatCurrency(item.price)}đ
                                </span>
                              </div>
                            </div>
                            <img src={item.banner.url} alt={item.name} className="w-12 h-12 border rounded" />
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center text-sm text-gray-500 py-4">Không tìm thấy sản phẩm phù hợp</div>
                  )}
                </div>
              </div>
            </form>
          </div>
          <div className="col-span-5">
            <div className="flex">
              <div className="w-[65%] flex items-center">
                <div className="flex-1">
                  <Link to={path.Order} className="flex items-center justify-center gap-1 cursor-pointer relative">
                    <PackageSearch color="white" size={28} />
                    <span className="text-[13px] text-white font-semibold text-center">Đơn hàng</span>
                    {isAuthenticated ? (
                      <span className="absolute -top-3 left-7 w-[20px] h-[20px] bg-red-500 border border-white text-[10px] flex items-center justify-center rounded-full text-white font-semibold">
                        {lengthOrder}
                      </span>
                    ) : (
                      ""
                    )}
                  </Link>
                </div>
                <div className="flex-1">
                  <Popover
                    renderPopover={
                      <div className="bg-white shadow-md rounded-sm border border-gray-200">
                        {lengthFavourite > 0 ? (
                          <div className="px-1 py-2 w-[300px]">
                            <span className="text-gray-700 ml-3 mt-1 font-semibold mb-1 block text-[13px]">
                              Sản phẩm đã lưu
                            </span>
                            <div className="min-[100px] max-h-[200px] overflow-y-auto">
                              {listFavourite?.map((item, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className=" transition-colors"
                                >
                                  <Link
                                    to={`/products/${slugify(item.name)}-i-${item._id}`}
                                    className="flex items-center gap-1 hover:bg-gray-100 duration-200 p-2"
                                  >
                                    <img src={item.banner.url} alt={item.name} className="w-[80px] h-[80px]" />
                                    <div>
                                      <span className="block text-[13px] line-clamp-2">{item.name}</span>
                                      <span className="block text-[14px] text-red-500 font-semibold">
                                        {item.discount > 0
                                          ? CalculateSalePrice(item.price, item.discount)
                                          : formatCurrency(Number(item.price))}{" "}
                                        đ
                                      </span>
                                    </div>
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 h-[200px] w-[180px] flex items-center justify-center flex-col">
                            <HeartOff className="text-red-600" />
                            <span className="text-sm text-center mt-4">Chưa có sản phẩm!</span>
                          </div>
                        )}
                      </div>
                    }
                  >
                    <div className="flex items-center justify-center gap-1 cursor-pointer relative">
                      <Heart color="white" size={24} />
                      <span className="text-[13px] text-white font-semibold">Yêu thích</span>
                      {isAuthenticated ? (
                        <span className="absolute -top-3 left-7 w-[20px] h-[20px] bg-red-500 border border-white text-white text-[10px] flex items-center justify-center rounded-full font-semibold">
                          {lengthFavourite}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>
                  </Popover>
                </div>

                <div className="flex-1">
                  <Popover
                    renderPopover={
                      <div className="bg-white shadow-md rounded-sm border border-gray-200">
                        {listCart?.length > 0 ? (
                          <div className="px-1 py-2 w-[300px]">
                            <span className="text-gray-700 ml-3 mt-1 font-semibold mb-1 block text-[13px]">
                              Sản phẩm mới được thêm vào
                            </span>
                            <div className="max-h-[200px] overflow-y-auto">
                              {listCart?.map((item, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className=" transition-colors"
                                >
                                  <Link
                                    to={`/products/${slugify(item.name)}-i-${item._id}`}
                                    className="flex items-center gap-1 hover:bg-gray-100 duration-200 p-2"
                                  >
                                    <img src={item.banner.url} alt={item.name} className="w-[80px] h-[80px]" />
                                    <div>
                                      <span className="block text-[13px] line-clamp-2">{item.name}</span>
                                      <div className="flex items-center justify-between">
                                        <span className="block text-[14px] text-red-500 font-semibold">
                                          {item.discount > 0
                                            ? CalculateSalePrice(item.price, item.discount)
                                            : formatCurrency(Number(item.price))}{" "}
                                          đ
                                        </span>
                                        <span>x {item?.quantity}</span>
                                      </div>
                                    </div>
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                            <Link
                              to={"/cart"}
                              className="mt-2 w-full block p-2 bg-blue-500 text-white rounded-sm hover:bg-blue-500/80 duration-200 text-sm text-center"
                            >
                              Xem giỏ hàng
                            </Link>
                          </div>
                        ) : (
                          <div className="p-4 flex items-center justify-center flex-col">
                            <img src={cartImg} alt="ảnh lỗi" className="w-[150px]" />
                            <span className="text-sm">Chưa có sản phẩm!</span>
                          </div>
                        )}
                      </div>
                    }
                  >
                    <Link to={path.Cart} className="flex items-center justify-center gap-1 cursor-pointer relative">
                      <ShoppingCart color="white" size={24} />
                      <span className="text-[13px] text-white font-semibold">Giỏ hàng</span>
                      {isAuthenticated ? (
                        <span className="absolute -top-3 left-7 w-[20px] h-[20px] bg-red-500 border border-white text-white text-[10px] flex items-center justify-center rounded-full font-semibold">
                          {lengthCart}
                        </span>
                      ) : (
                        ""
                      )}
                    </Link>
                  </Popover>
                </div>
              </div>
              <div className="w-[35%]">
                {isAuthenticated ? (
                  <Popover
                    renderPopover={
                      <div className="bg-white shadow-md rounded-sm border border-gray-200">
                        <div className="flex flex-col">
                          <Link
                            to={path.Profile}
                            className="text-sm md:text-[13px] flex items-center gap-1 px-3 py-2 hover:text-primaryBlue hover:bg-slate-200 hover:underline hover:font-semibold"
                          >
                            Thông tin tài khoản
                            <Info size={16} />
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="text-sm md:text-[13px] flex items-center gap-1 px-3 py-2 hover:text-primaryBlue hover:bg-slate-200 hover:underline hover:font-semibold"
                          >
                            Đăng xuất
                            <LogOut size={16} />
                          </button>
                        </div>
                      </div>
                    }
                  >
                    {
                      <div className="flex items-center gap-1 py-1 px-2 rounded-[4px] bg-secondBlue text-white font-semibold hover:bg-secondBlue/50 duration-200 transition ease-linear cursor-pointer">
                        <img src={avatar || avatarDefault} className="h-8 w-8 rounded-full" alt="avatar default" />
                        <div>
                          <span className="text-xs">Xin chào</span>
                          <span className="block text-[13px] truncate w-32">{nameUser}</span>
                        </div>
                      </div>
                    }
                  </Popover>
                ) : (
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={path.Register}
                      className="py-2 px-3 rounded-[4px] bg-secondBlue text-white text-[13px] font-semibold hover:bg-secondBlue/50 duration-200 transition ease-linear"
                    >
                      Đăng ký
                    </Link>
                    <Link
                      to={path.Login}
                      className="py-2 px-3 rounded-[4px] bg-secondBlue text-white text-[13px] font-semibold hover:bg-secondBlue/50 duration-200 transition ease-linear"
                    >
                      Đăng nhập
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
