/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { collectionAPI } from "src/Apis/collections.api"
import { getAccessTokenFromLS } from "src/Helpers/auth"
import { CartType, ProductDetailType } from "src/Types/product.type"
import { SuccessResponse } from "src/Types/utils.type"
import cartImg from "src/Assets/img/cart.png"
import { Table, Checkbox, Image, Typography, Button, InputNumber, Steps } from "antd"
import { useEffect, useMemo, useState } from "react"
import { CalculateSalePrice, formatCurrency, slugify } from "src/Helpers/common"
import { debounce } from "lodash"
import { toast } from "react-toastify"
import { motion } from "framer-motion"

const { Text } = Typography

type CartList = {
  key: string
  name: string
  image: string
  price: number
  discount: number
  quantity: number
}[]

export default function Cart() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const productSelectedBuyNow = state?.productId

  const queryClient = useQueryClient()
  const token = getAccessTokenFromLS()
  const [listCart, setListCart] = useState<CartList>([])
  const [listCheck, setListCheck] = useState<Record<string, boolean>>({})
  const [selectedProducts, setSelectedProducts] = useState<CartList>([]) // sản phẩm selected
  const [flag, setFlag] = useState<boolean>(false)

  const columns = [
    {
      title: "Chọn",
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
      width: 50
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      render: (_: any, record: any) => (
        <Link
          to={{
            pathname: `/products/${slugify(record.name)}-i-${record.key}`
          }}
          style={{ display: "flex", gap: 16, alignItems: "center" }}
        >
          <Image src={record.image} width={80} />
          <div>
            <Text>{record.name}</Text>
          </div>
        </Link>
      )
    },
    {
      title: "Đơn giá",
      render: (_: any, record: any) => (
        <div>
          {record.discount === 0 ? (
            <Text strong>{record.price.toLocaleString()}₫</Text>
          ) : (
            <Text delete style={{ color: "#aaa" }}>
              {record.price.toLocaleString()}₫
            </Text>
          )}

          <br />
          {record.discount !== 0 ? <Text strong>{CalculateSalePrice(record.price, record.discount)}đ</Text> : ""}
        </div>
      ),
      width: 150
    },
    {
      title: "Số lượng",
      render: (_: any, record: any) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => {
            if (value) {
              debouncedUpdateProductToCart(record.key, value)
              // Cập nhật UI tạm thời nếu muốn
              setListCart((prev) => prev.map((item) => (item.key === record.key ? { ...item, quantity: value } : item)))
            }
          }}
        />
      ),
      width: 120
    },
    {
      title: "Giá",
      render: (_: any, record: any) => {
        return (
          <Text type="danger" strong>
            {record.discount !== 0
              ? formatCurrency((record.price - record.price * (record.discount / 100)) * record.quantity)
              : formatCurrency(record.price * record.quantity)}
            ₫
          </Text>
        )
      },
      width: 150
    },
    {
      title: "Thao tác",
      render: (_: any, record: any) => {
        return (
          <Button type="link" danger onClick={() => removeProductToCart(record.key)}>
            Xóa
          </Button>
        )
      },
      width: 100
    }
  ]

  const { data } = useQuery({
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
    placeholderData: keepPreviousData
  })

  const listProductCart = data?.data?.result?.products[0]?.products as ProductDetailType[]
  const resultCart = data?.data as SuccessResponse<{
    total: number
    products: {
      products: ProductDetailType[]
    }[]
  }>

  const lengthCart = resultCart?.result?.total

  useEffect(() => {
    if (listProductCart) {
      const initialCheck: Record<string, boolean> = {}
      const list: CartList = listProductCart?.map((item) => {
        const isSelected = item._id === productSelectedBuyNow
        initialCheck[item._id] = isSelected

        return {
          key: item._id,
          name: item.name,
          image: item.banner.url,
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

  // cập nhật số lượng sản phẩm giỏ hàng
  const updateProductToCartMutation = useMutation({
    mutationFn: (body: CartType) => {
      return collectionAPI.updateQuantityProductInCart(body)
    }
  })

  const updateProductToCart = async (productId: string, quantity: number) => {
    updateProductToCartMutation
      .mutateAsync({ product_id: productId, quantity: quantity, added_at: new Date() })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["listCart", token] }) // đồng bộ
      })
      .catch((err) => console.log(err))
  }

  const debouncedUpdateProductToCart = useMemo(
    () =>
      debounce((productId: string, quantity: number) => {
        updateProductToCart(productId, quantity)
      }, 500),
    []
  )

  // xóa 1 sản phẩm giỏ hàng
  const removeProductToCartMutation = useMutation({
    mutationFn: (body: string) => {
      return collectionAPI.removeProductToCart(body)
    }
  })

  const removeProductToCart = async (productId: string) => {
    removeProductToCartMutation.mutateAsync(productId).then((res) => {
      toast.success(res.data.message, { autoClose: 1500 })
      queryClient.invalidateQueries({ queryKey: ["listCart", token] })
    })
  }

  // clear giỏ hàng
  const clearProductInCartMutation = useMutation({
    mutationFn: () => {
      return collectionAPI.clearProductToCart()
    }
  })

  const clearProductInCart = () => {
    clearProductInCartMutation.mutate(undefined, {
      onSuccess: (res) => {
        toast.success(res.data.message, { autoClose: 1500 })
        queryClient.invalidateQueries({ queryKey: ["listCart", token] }) // đồng bộ
      }
    })
  }

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
      navigate("/cart/info", {
        state: {
          selectedProducts,
          totalPriceProducts
        }
      })
    }
  }

  return (
    <div>
      <Helmet>
        <title>Giỏ hàng mua sắm</title>
        <meta
          name="description"
          content="Giỏ hàng TechZone - Hoàn tất đơn hàng laptop, PC, linh kiện và phụ kiện công nghệ. Thanh toán nhanh, bảo mật, giao hàng toàn quốc."
        />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="my-4">
          <div className="container">
            <Link to={"/home"} className="flex items-center gap-[2px] cursor-pointer">
              <ChevronLeft size={16} color="blue" />
              <span className="text-[14px] font-medium text-blue-500">Mua thêm sản phẩm khác</span>
            </Link>

            <div className="p-4 bg-white rounded-md mt-4">
              {lengthCart > 0 ? (
                <div className="relative">
                  <div className="bg-red-50 px-4 py-6">
                    <Steps
                      size="small"
                      current={0}
                      type="default"
                      items={[
                        {
                          title: <span style={{ color: "red", fontWeight: "500" }}>Giỏ hàng</span>
                        },
                        {
                          title: <span className="text-gray-500">Thông tin đặt hàng</span>
                        },
                        {
                          title: <span className="text-gray-500">Thanh toán</span>
                        },
                        {
                          title: <span className="text-gray-500">Hoàn tất</span>
                        }
                      ]}
                    />
                  </div>

                  <div className="mt-4">
                    <Table columns={columns} dataSource={listCart} pagination={false} bordered />
                  </div>

                  <div
                    style={{
                      position: "sticky",
                      bottom: "0"
                    }}
                  >
                    <div
                      style={{
                        border: "1px solid #f0f0f0",
                        padding: "16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderRadius: "4px",
                        background: "#fff",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        width: "100%"
                      }}
                    >
                      {/* Left */}
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <Checkbox checked={isAllSelected} onClick={handleCheckAllProduct}>
                          Chọn tất cả
                        </Checkbox>
                        <Text onClick={clearProductInCart} type="danger" strong className="cursor-pointer">
                          Xóa tất cả
                        </Text>
                      </div>

                      {/* Right */}
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "16px" }}>
                            <span>Tổng tiền ({selectedProducts.length})</span>
                            <span style={{ padding: "0 4px" }}>sản phẩm:</span>
                            <span style={{ color: "#ff4d4f", fontSize: "18px", fontWeight: 500 }}>
                              {formatCurrency(totalPriceProducts)}đ
                            </span>
                          </div>
                          <div style={{ fontSize: "12px", color: "#888" }}>
                            Tiết kiệm
                            <span style={{ color: "#ff4d4f", marginLeft: 4 }}>
                              {formatCurrency(saveMoneyProducts - totalPriceProducts)}đ
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={handleOrderProduct}
                          type="primary"
                          className="custom-button"
                          style={{
                            background: "red",
                            border: "none",
                            padding: "0 20px",
                            height: "40px",
                            fontWeight: "bold"
                          }}
                        >
                          Đặt hàng ngay
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 flex items-center justify-center flex-col">
                  <img src={cartImg} alt="ảnh lỗi" className="w-[150px]" />
                  <span className="text-sm">Chưa có sản phẩm!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
