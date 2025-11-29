import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { Divider, Drawer, Menu, MenuProps } from "antd"
import { Cpu, Info, LogOut, Menu as MenuIcon, PackageSearch, ShoppingCart } from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { categoryAPI } from "src/Apis/client/category.api"
import { path } from "src/Constants/path"
import { MenuCategory, ProductDetailType } from "src/Types/product.type"
import "./HeaderMobile.css"
import useDebounce from "src/Hook/useDebounce"
import { collectionAPI } from "src/Apis/client/collections.api"
import { SuccessResponse } from "src/Types/utils.type"
import { CalculateSalePrice, formatCurrency, slugify } from "src/Helpers/common"
import { getAccessTokenFromLS } from "src/Helpers/auth"
import { AppContext } from "src/Context/authContext"
import { userAPI } from "src/Apis/user.api"
import { toast } from "react-toastify"
import avatarDefault from "src/Assets/img/avatarDefault.png"
import { OrderApi } from "src/Apis/client/order.api"

export default function HeaderMobile() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const token = getAccessTokenFromLS()
  const { isAuthenticated, avatar, nameUser, setIsAuthenticated, setNameUser, setRole, setAvatar, setUserId } =
    useContext(AppContext)

  // xử lý danh mục thể loại từ api gọi lên
  const getListCategoryIsActive = useQuery({
    queryKey: ["listCategoryIsActive"],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return categoryAPI.getListCategoryIsActive(controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 10 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const getListCategoryMenu = useQuery({
    queryKey: ["listCategoryMenu"],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return categoryAPI.getListCategoryMenu(controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 10 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const dataListCategoryMenu = (getListCategoryMenu.data?.data?.data ?? []) as MenuCategory[]

  const dataListCategoryIsActive = (getListCategoryIsActive.data?.data?.data ?? []) as {
    _id: string
    name: string
    is_active: boolean
  }[]

  const dataListCategoryIsActiveSortAZ = dataListCategoryIsActive.sort((a, b) => {
    return a.name.localeCompare(b.name) // so sánh 2 chuỗi theo thứ tự a-z
  })

  const handleNavigate = (valueItem: string, type: string) => {
    navigate(`/collections/${valueItem}`, {
      state: {
        type_filter: type
      }
    })
  }

  type MenuItem = Required<MenuProps>["items"][number]

  const items: MenuItem[] = dataListCategoryIsActiveSortAZ.map((category) => ({
    key: category._id,
    label: <div className="font-semibold text-base">{category.name}</div>,
    children: dataListCategoryMenu
      .filter((item) => item.category_id === category._id)
      .flatMap((subCategory) =>
        subCategory.sections.map((sec) => ({
          key: sec.id_section,
          label: <div className="font-semibold text-base">{sec.name}</div>,
          children: sec.items.map((item) => ({
            key: item.id_item,
            label: <button onClick={() => handleNavigate(item.slug, item.type_filter)}>{item.name}</button>
          }))
        }))
      )
  }))

  // xử lý tìm kiếm
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
  const searchRef = useRef<HTMLDivElement>(null)
  const [showListSearch, setShowListSearch] = useState(false)

  useEffect(() => {
    const shouldShow = searchText.trim() !== ""
    setShowListSearch(shouldShow)
  }, [searchText])

  useEffect(() => {
    const clickOutHideList = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowListSearch(false)
      }
    }

    document.addEventListener("mousedown", clickOutHideList)
    return () => document.removeEventListener("mousedown", clickOutHideList) // khi component unmount đi thì nó giải phóng bộ nhớ
  }, [])

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

  const [listData, setListData] = useState<
    {
      _id: string
      name: string
      discount: number
      price: number
      banner: {
        type: string
        url: string
      }
    }[]
  >([])

  useEffect(() => {
    setListData(listProductData)
  }, [listProductData])

  // xử lý giỏ hàng
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

  const resultCart = data2?.data as SuccessResponse<{
    total: number
    products: {
      products: ProductDetailType[]
    }[]
  }>

  const lengthOrder = data3?.data?.total

  const lengthCart = resultCart?.result?.total

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

  return (
    <div className="block md:hidden sticky top-0 left-0 z-20">
      <div className="bg-primaryBlue">
        <div className="container">
          <div className="grid grid-cols-12 items-center gap-2 py-3">
            <div className="col-span-3">
              <div className="flex items-center gap-2 w-full">
                <button onClick={() => setOpen(true)} className="flex-1">
                  <MenuIcon color="white" size={32} />
                </button>
                <button onClick={() => navigate(path.Home)} className="flex-1">
                  <Cpu color="white" size={34} />
                </button>
              </div>
            </div>
            <div className="col-span-7">
              <form className="w-full relative flex">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-grow text-[13px] p-3 outline-none rounded-[4px]"
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
                  className={`absolute top-12 w-full rounded shadow z-50 transition-all ease-linear duration-100 overflow-hidden ${
                    showListSearch && searchText.trim() !== "" ? "opacity-100 visible" : "opacity-0 invisible"
                  }`}
                  ref={searchRef}
                >
                  <div className="bg-white max-h-[500px] overflow-y-auto">
                    {listData?.length > 0 ? (
                      listData.map((item) => (
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
                      <div className="text-center text-[13px] text-gray-500 py-4">Không tìm thấy sản phẩm phù hợp</div>
                    )}
                  </div>
                </div>
              </form>
            </div>
            <div className="col-span-2">
              <div className="flex items-center">
                <div className="flex-1">
                  <Link to={path.Cart} className="flex items-center justify-center gap-1 cursor-pointer relative">
                    <ShoppingCart color="white" size={24} />
                    {isAuthenticated ? (
                      <span className="absolute -top-3 left-7 w-[20px] h-[20px] bg-red-500 border border-white text-white text-[10px] flex items-center justify-center rounded-full font-semibold">
                        {lengthCart}
                      </span>
                    ) : (
                      ""
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Drawer
        placement="left"
        closable={false}
        width={320}
        onClose={() => setOpen(false)}
        open={open}
        style={{ padding: 0 }}
        rootClassName="drawer-header-mobile" // Đúng cho v5
      >
        <div className="flex items-center gap-2 pl-6">
          <Cpu color="black" />
          <span className="text-black text-2xl font-bold text-center border-b-[3px] border-white dark:border-white">
            TechZone
          </span>
        </div>

        <Divider style={{ marginTop: 12, marginBottom: 12 }} />

        <Menu style={{ width: "100%", border: "none" }} mode="inline" items={items} />

        <Divider style={{ marginTop: 12, marginBottom: 12 }} />

        <div className="px-4 py-2">
          {isAuthenticated ? (
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-3 w-full bg-gray-100 rounded-lg px-3 py-2">
                <img src={avatar || avatarDefault} className="h-9 w-9 rounded-full border" alt="avatar default" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-gray-500">Xin chào,</span>
                  <span className="text-sm font-semibold truncate text-gray-800">{nameUser}</span>
                </div>
              </div>
              <Link
                to={path.Profile}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-primaryBlue transition"
              >
                <Info size={16} />
                Thông tin tài khoản
              </Link>
              <Link
                to={path.Order}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-primaryBlue transition relative"
              >
                <PackageSearch size={18} className="text-primaryBlue" />
                <span className="font-semibold">Đơn hàng</span>
                {isAuthenticated && (
                  <span className="absolute right-3 top-2 w-[20px] h-[20px] bg-red-500 border border-white text-[10px] flex items-center justify-center rounded-full text-white font-semibold">
                    {lengthOrder}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-primaryBlue transition"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex gap-2 w-full mt-2">
              <Link
                to={path.Register}
                className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold text-center hover:bg-blue-600 transition"
              >
                Đăng ký
              </Link>
              <Link
                to={path.Login}
                className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold text-center hover:bg-blue-600 transition"
              >
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  )
}
