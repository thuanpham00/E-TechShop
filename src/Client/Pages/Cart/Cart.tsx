/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, ShoppingCart, Trash2, Package, Tag as TagIcon, CreditCard } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { getAccessTokenFromLS } from "src/Helpers/auth"
import { CartType } from "src/Types/product.type"
import { SuccessResponse } from "src/Types/utils.type"
import cartImg from "src/Assets/img/cart.png"
import { Table, Checkbox, Image, Typography, Button, InputNumber, Steps, Empty, Spin, Tag } from "antd"
import { useEffect, useMemo, useState } from "react"
import { CalculateSalePrice, formatCurrency, slugify } from "src/Helpers/common"
import { debounce } from "lodash"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { path } from "src/Constants/path"
import { collectionAPI } from "src/Apis/client/collections.api"

const { Text } = Typography

type CartList = {
  key: string
  name: string
  image: string
  price: number
  discount: number
  quantity: number
}[]

type CartItem = {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  added_at: number
  discount: number
  priceAfterDiscount: number
}

export default function Cart() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const productSelectedBuyNow = state?.productId

  const queryClient = useQueryClient()
  const token = getAccessTokenFromLS()
  const [listCart, setListCart] = useState<CartList>([])
  const [listCheck, setListCheck] = useState<Record<string, boolean>>({})
  const [selectedProducts, setSelectedProducts] = useState<CartList>([])
  const [flag, setFlag] = useState<boolean>(false)

  const handleCheckAllProduct = () => {
    const checkValue = !flag
    const newCheck: Record<string, boolean> = {}
    const selectedProduct: CartList = []
    listCart.map((item) => {
      newCheck[item.key] = checkValue
      selectedProduct.push(item)
    })
    if (flag) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(selectedProduct)
    }
    setFlag(checkValue)
    setListCheck(newCheck)
  }

  const isAllSelected = useMemo(() => {
    return listCart.length > 0 && selectedProducts.length === listCart.length
  }, [selectedProducts.length, listCart.length])

  const columns = [
    {
      title: (
        <Checkbox checked={isAllSelected} onChange={handleCheckAllProduct} className="font-medium">
          Chọn tất cả
        </Checkbox>
      ),
      align: "center" as const,
      dataIndex: "select",
      render: (_: any, record: any) => (
        <Checkbox
          checked={listCheck[record.key]}
          onChange={(e) => {
            const { checked } = e.target
            if (checked) {
              setSelectedProducts((prev) => [...prev, record])
            } else {
              setSelectedProducts((prev) => prev.filter((item) => item.key !== record.key))
            }
            setListCheck((prev) => ({
              ...prev,
              [record.key]: checked
            }))
          }}
        />
      ),
      width: 150
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      render: (_: any, record: any) => (
        <Link
          to={{
            pathname: `/products/${slugify(record.name)}-i-${record.key}`
          }}
          className="flex gap-4 items-center hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            <Image
              src={record.image}
              width={80}
              height={80}
              className="rounded-lg border-2 border-gray-100"
              preview={false}
            />
            {record.discount > 0 && (
              <Tag color="red" className="absolute -top-2 -right-2 text-xs font-bold">
                -{record.discount}%
              </Tag>
            )}
          </div>
          <div className="flex-1">
            <Text strong className="text-gray-800 line-clamp-2">
              {record.name}
            </Text>
          </div>
        </Link>
      ),
      width: 400
    },
    {
      title: "Đơn giá",
      render: (_: any, record: any) => (
        <div className="text-center">
          {record.discount > 0 ? (
            <>
              <Text delete className="text-gray-400 text-sm block">
                {formatCurrency(record.price)}đ
              </Text>
              <Text strong className="text-red-500 text-base">
                {CalculateSalePrice(record.price, record.discount)}đ
              </Text>
            </>
          ) : (
            <Text strong className="text-gray-800 text-base">
              {formatCurrency(record.price)}đ
            </Text>
          )}
        </div>
      ),
      width: 150,
      align: "center" as const
    },
    {
      title: "Số lượng",
      render: (_: any, record: any) => (
        <div className="flex justify-center">
          <InputNumber
            min={1}
            max={99}
            value={record.quantity}
            onChange={(value) => {
              if (value) {
                debouncedUpdateProductToCart(record.key, value)
                console.log(record)
                setListCart((prev) =>
                  prev.map((item) => (item.key === record.key ? { ...item, quantity: value } : item))
                )
              }
            }}
            className="w-24"
          />
        </div>
      ),
      width: 150,
      align: "center" as const
    },
    {
      title: "Thành tiền",
      render: (_: any, record: any) => {
        const finalPrice = record.discount !== 0 ? record.price - record.price * (record.discount / 100) : record.price
        return (
          <Text strong className="text-red-500 text-lg">
            {formatCurrency(finalPrice * record.quantity)}đ
          </Text>
        )
      },
      width: 150,
      align: "center" as const
    },
    {
      title: "Thao tác",
      render: (_: any, record: any) => {
        return (
          <Button
            type="text"
            danger
            icon={<Trash2 size={16} />}
            onClick={() => removeProductToCart(record.key)}
            className="hover:bg-red-50"
          >
            Xóa
          </Button>
        )
      },
      width: 100,
      align: "center" as const
    }
  ]

  const { data, isLoading } = useQuery({
    queryKey: ["listCart", token],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000)
      return collectionAPI.getProductInCart(controller.signal)
    },
    retry: 0,
    staleTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData
  })

  const listProductCart = data?.data?.result?.items as CartItem[]
  const resultCart = data?.data as SuccessResponse<{
    items: CartItem[]
    count: number
    total: number
  }>

  const lengthCart = resultCart?.result?.count || 0

  useEffect(() => {
    if (listProductCart) {
      const initialCheck: Record<string, boolean> = {}
      const list: CartList = listProductCart?.map((item) => {
        const isSelected = item.productId === productSelectedBuyNow
        initialCheck[item.productId] = isSelected

        return {
          key: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          discount: item.discount,
          quantity: Number(item.quantity)
        }
      })

      setListCart(list)
      const productBuyNow = list?.find((item) => item.key === productSelectedBuyNow)
      setSelectedProducts(productBuyNow ? [productBuyNow] : [])

      setListCheck(initialCheck)
    }
  }, [listProductCart, productSelectedBuyNow])

  const updateProductToCartMutation = useMutation({
    mutationFn: (body: CartType) => {
      return collectionAPI.updateQuantityProductInCart(body)
    }
  })

  const updateProductToCart = async (productId: string, quantity: number) => {
    try {
      await updateProductToCartMutation.mutateAsync({
        product_id: productId,
        quantity: quantity
      })

      queryClient.invalidateQueries({ queryKey: ["listCart", token] })

      window.dispatchEvent(new Event("cart-updated"))
    } catch (err) {
      console.error("Update cart error:", err)
      toast.error("Cập nhật số lượng thất bại", { autoClose: 1500 })
    }
  }

  const debouncedUpdateProductToCart = useMemo(
    () =>
      debounce((productId: string, quantity: number) => {
        updateProductToCart(productId, quantity)
      }, 500),
    []
  )

  const removeProductToCartMutation = useMutation({
    mutationFn: (body: string) => {
      return collectionAPI.removeProductToCart(body)
    }
  })

  const removeProductToCart = async (productId: string) => {
    try {
      const res = await removeProductToCartMutation.mutateAsync(productId)
      toast.success(res.data.message, { autoClose: 1500 })
      queryClient.invalidateQueries({ queryKey: ["listCart", token] })

      window.dispatchEvent(new Event("cart-updated"))
    } catch (err) {
      console.error("Remove product error:", err)
      toast.error("Xóa sản phẩm thất bại", { autoClose: 1500 })
    }
  }

  const clearProductInCartMutation = useMutation({
    mutationFn: () => {
      return collectionAPI.clearProductToCart()
    }
  })

  const clearProductInCart = () => {
    clearProductInCartMutation.mutate(undefined, {
      onSuccess: (res) => {
        toast.success(res.data.message, { autoClose: 1500 })
        queryClient.invalidateQueries({ queryKey: ["listCart", token] })

        window.dispatchEvent(new Event("cart-updated"))
      },
      onError: (err) => {
        console.error("Clear cart error:", err)
        toast.error("Xóa giỏ hàng thất bại", { autoClose: 1500 })
      }
    })
  }

  const totalPriceProducts = useMemo(() => {
    return selectedProducts.reduce((total, product) => {
      const finalPrice =
        product.discount !== 0 ? product.price - product.price * (product.discount / 100) : product.price

      return total + finalPrice * product.quantity
    }, 0)
  }, [selectedProducts])

  const saveMoneyProducts = useMemo(() => {
    return selectedProducts.reduce((total, product) => {
      const finalPrice = product.price * product.quantity
      return total + finalPrice
    }, 0)
  }, [selectedProducts])

  const handleOrderProduct = () => {
    if (selectedProducts.length === 0) {
      toast.error("Bạn chưa chọn sản phẩm nào!", { autoClose: 1500 })
    } else {
      navigate(path.InfoOrder, {
        state: {
          selectedProducts,
          totalPriceProducts
        }
      })
    }
  }

  return (
    <div className="bg-gray-50">
      <Helmet>
        <title>Giỏ hàng mua sắm - TechZone</title>
        <meta
          name="description"
          content="Giỏ hàng TechZone - Hoàn tất đơn hàng laptop, PC, linh kiện và phụ kiện công nghệ. Thanh toán nhanh, bảo mật, giao hàng toàn quốc."
        />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-6">
        <div className="container mx-auto px-4" style={{ maxWidth: "1200px" }}>
          {/* Header */}
          <div className="mb-6">
            <Link
              to="/home"
              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={18} />
              <span className="text-sm font-medium">Tiếp tục mua sắm</span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : lengthCart > 0 ? (
              <div>
                {/* Progress Steps */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-6">
                  <Steps
                    current={0}
                    items={[
                      {
                        title: <span className="text-blue-600 font-semibold">Giỏ hàng</span>,
                        icon: <ShoppingCart className="text-blue-600" size={20} />
                      },
                      {
                        title: <span className="text-gray-500">Thông tin đặt hàng</span>,
                        icon: <Package className="text-gray-400" size={20} />
                      },
                      {
                        title: <span className="text-gray-500">Thanh toán</span>,
                        icon: <CreditCard className="text-gray-400" size={20} />
                      },
                      {
                        title: <span className="text-gray-500">Hoàn tất</span>,
                        icon: <TagIcon className="text-gray-400" size={20} />
                      }
                    ]}
                  />
                </div>

                {/* Cart Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <ShoppingCart className="text-blue-500" size={24} />
                      Giỏ hàng của bạn
                      <span className="text-blue-500">({lengthCart} sản phẩm)</span>
                    </h1>
                    {listCart.length > 0 && (
                      <Button
                        danger
                        icon={<Trash2 size={16} />}
                        onClick={clearProductInCart}
                        loading={clearProductInCartMutation.isPending}
                      >
                        Xóa tất cả
                      </Button>
                    )}
                  </div>
                </div>

                {/* Products Table */}
                <div className="p-6">
                  <Table columns={columns} dataSource={listCart} pagination={false} bordered className="cart-table" />
                </div>

                {/* Sticky Footer */}
                <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 shadow-lg">
                  <div className="px-6 py-4">
                    <div className="flex justify-end items-center">
                      {/* Right - Summary & Checkout */}
                      <div className="flex items-center gap-6">
                        {/* Price Summary */}
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-600">Tổng thanh toán ({selectedProducts.length} sản phẩm):</span>
                            <span className="text-2xl font-bold text-red-500">
                              {formatCurrency(totalPriceProducts)}đ
                            </span>
                          </div>
                          {saveMoneyProducts - totalPriceProducts > 0 && (
                            <div className="flex items-center gap-1 justify-end">
                              <TagIcon size={14} className="text-green-500" />
                              <span className="text-sm text-gray-600">Tiết kiệm:</span>
                              <span className="text-sm font-semibold text-green-500">
                                {formatCurrency(saveMoneyProducts - totalPriceProducts)}đ
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Checkout Button */}
                        <Button
                          type="primary"
                          size="large"
                          onClick={handleOrderProduct}
                          disabled={selectedProducts.length === 0}
                          className="bg-red-500 hover:!bg-red-600 border-none px-8 h-12 text-base font-bold shadow-lg"
                        >
                          Mua hàng ({selectedProducts.length})
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-6">
                <Empty
                  image={<img src={cartImg} alt="Empty cart" style={{ height: 150, margin: "0 auto" }} />}
                  description={
                    <div className="text-center py-4 mt-8">
                      <p className="text-gray-500 text-lg mb-2">Giỏ hàng của bạn đang trống</p>
                      <p className="text-gray-400 text-sm">Hãy khám phá và thêm sản phẩm yêu thích vào giỏ hàng!</p>
                    </div>
                  }
                >
                  <Link
                    to="/home"
                    className="inline-block px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Khám phá sản phẩm
                  </Link>
                </Empty>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <style>{`
        .cart-table .ant-table-thead > tr > th {
          background: #f8fafc;
          font-weight: 600;
          color: #1e293b;
          padding: 16px;
        }
        
        .cart-table .ant-table-tbody > tr > td {
          padding: 16px;
        }
        
        .cart-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc;
        }
      `}</style>
    </div>
  )
}
