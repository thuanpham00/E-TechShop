/* eslint-disable @typescript-eslint/no-explicit-any */
import { Helmet } from "react-helmet-async"
import { useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Select } from "antd"
import { useState } from "react"
import useDebounce from "src/Hook/useDebounce"
import { useQuery } from "@tanstack/react-query"
import { collectionAPI } from "src/Apis/client/collections.api"
import { CalculateSalePrice, formatCurrency } from "src/Helpers/common"

function useProductSearch(search: string | null) {
  return useQuery({
    queryKey: ["searchProduct", search],
    queryFn: ({ signal }) => collectionAPI.getSearchProduct({ search: String(search) }, signal),
    retry: 0,
    enabled: Boolean(search)
  })
}

export default function CompareProduct() {
  const { state } = useLocation()
  const productCurrent = state?.productCurrent

  const [searchText, setSearchText] = useState<string | null>(null)
  const [searchText2, setSearchText2] = useState<string | null>(null)

  const inputSearchDebounce = useDebounce(searchText as string, 500)
  const inputSearchDebounce2 = useDebounce(searchText2 as string, 500)

  const [productSelected, setProductSelected] = useState<{
    _id: string
    productSelected: any
  } | null>(
    productCurrent
      ? {
          _id: productCurrent?._id,
          productSelected: productCurrent
        }
      : null
  )
  const [productSelected_2, setProductSelected_2] = useState<{
    _id: string
    productSelected: any
  } | null>(null)

  console.log(productSelected_2)

  const getSearchProduct1 = useProductSearch(inputSearchDebounce || null)
  const getSearchProduct2 = useProductSearch(inputSearchDebounce2 || null)

  const listProductFind1 = (getSearchProduct1?.data?.data as any)?.result?.data || []
  const listProductFind2 = (getSearchProduct2?.data?.data as any)?.result?.data || []

  return (
    <div className="bg-gray-50">
      <Helmet>
        <title>So sánh sản phẩm</title>
        <meta
          name="description"
          content="So sánh sản phẩm tại TECHZONE — so sánh giá, thông số và đánh giá. Tìm sản phẩm phù hợp với nhu cầu của bạn."
        />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-semibold mb-4">So sánh sản phẩm</h1>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <Select
                  className="w-full"
                  showSearch
                  allowClear
                  placeholder="Tìm và chọn sản phẩm để so sánh (tối đa 4)"
                  notFoundContent={getSearchProduct1.isFetching ? "Đang tìm..." : "Không tìm thấy"}
                  onSearch={(val) => setSearchText(val)}
                  onChange={(value: string | null) => {
                    setProductSelected({
                      productSelected: listProductFind1.find((p: any) => p._id === value),
                      _id: value as string
                    })
                  }}
                  value={productSelected?._id || null}
                  filterOption={false} // we use server-side search
                  options={
                    listProductFind1?.map((p: any) => ({
                      label: p.name,
                      value: p._id
                    })) || []
                  }
                />
              </div>
              <div className="flex-1">
                <Select
                  className="w-full"
                  showSearch
                  allowClear
                  placeholder="Tìm và chọn sản phẩm để so sánh (tối đa 4)"
                  notFoundContent={getSearchProduct2.isFetching ? "Đang tìm..." : "Không tìm thấy"}
                  onSearch={(val) => setSearchText2(val)}
                  onChange={(value: string | null) => {
                    console.log(value)
                    setProductSelected_2({
                      productSelected: listProductFind2.find((p: any) => p._id === value),
                      _id: value as string
                    })
                  }}
                  value={productSelected?._id || null}
                  filterOption={false} // we use server-side search
                  options={
                    listProductFind2?.map((p: any) => ({
                      label: p.name,
                      value: p._id
                    })) || []
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex-1 mt-6 p-4 border border-gray-200 rounded-lg">
                {productSelected ? (
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={productSelected.productSelected.banner.url}
                        alt={productSelected.productSelected.name}
                        className="w-[60%] h-[300px] object-cover"
                      />
                    </div>
                    <h2 className="font-medium text-base my-2 h-[50px]">{productSelected.productSelected.name}</h2>
                    {productSelected.productSelected?.discount > 0 && (
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-red-500">
                          {CalculateSalePrice(
                            productSelected.productSelected.price,
                            productSelected.productSelected.discount
                          )}
                          ₫
                        </h2>
                        <span className="block text-[15px] text-[#6d6e72] font-semibold line-through">
                          {formatCurrency(productSelected.productSelected.price)}₫
                        </span>
                        <div className="py-[1px] px-1 rounded-sm border border-[#e30019] text-[#e30019] text-[11px]">
                          -{productSelected.productSelected.discount}%
                        </div>
                      </div>
                    )}
                    {productSelected.productSelected?.discount === 0 && (
                      <h2 className="text-xl font-semibold text-red-500">
                        {formatCurrency(productSelected.productSelected.price)}₫
                      </h2>
                    )}
                    {/* Thêm các thông số khác của sản phẩm ở đây */}
                    {productSelected.productSelected?.specifications.length > 0 ? (
                      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm mt-4">
                        <table className="w-full">
                          <tbody>
                            {productSelected.productSelected?.specifications.map(
                              (item: { value: string; name: string }, index: number) => {
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
                              }
                            )}
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
                ) : (
                  <p className="text-gray-500">Chưa chọn sản phẩm</p>
                )}
              </div>

              <div className="flex-1 mt-6 p-4 border border-gray-200 rounded-lg">
                {productSelected_2 ? (
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={productSelected_2.productSelected.banner.url}
                        alt={productSelected_2.productSelected.name}
                        className="w-[60%] h-[300px] object-cover"
                      />
                    </div>
                    <h2 className="font-medium text-base my-2 h-[50px]">{productSelected_2.productSelected.name}</h2>
                    {productSelected_2.productSelected?.discount > 0 && (
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-red-500">
                          {CalculateSalePrice(
                            productSelected_2.productSelected.price,
                            productSelected_2.productSelected.discount
                          )}
                          ₫
                        </h2>
                        <span className="block text-[15px] text-[#6d6e72] font-semibold line-through">
                          {formatCurrency(productSelected_2.productSelected.price)}₫
                        </span>
                        <div className="py-[1px] px-1 rounded-sm border border-[#e30019] text-[#e30019] text-[11px]">
                          -{productSelected_2.productSelected.discount}%
                        </div>
                      </div>
                    )}
                    {productSelected_2.productSelected?.discount === 0 && (
                      <h2 className="text-xl font-semibold text-red-500">
                        {formatCurrency(productSelected_2.productSelected.price)}₫
                      </h2>
                    )}
                    {/* Thêm các thông số khác của sản phẩm ở đây */}
                  </div>
                ) : (
                  <p className="text-gray-500">Chưa chọn sản phẩm</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
