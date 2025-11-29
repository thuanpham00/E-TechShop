/* eslint-disable @typescript-eslint/no-explicit-any */
import { Helmet } from "react-helmet-async"
import { useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Select } from "antd"
import { useMemo, useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { collectionAPI } from "src/Apis/client/collections.api"
import { categoryAPI } from "src/Apis/client/category.api"
import ProductCompare from "./Components/ProductCompare"
import { listSpecificationForCategory } from "src/Constants/product"

export default function CompareProduct() {
  const { state } = useLocation()
  const productCurrent = state?.productCurrent
  const category = state?.category

  const [categorySelected, setCategorySelected] = useState<string | null>(category || null)
  const [searchText, setSearchText] = useState<string | null>(null)
  const [searchText2, setSearchText2] = useState<string | null>(null)

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

  const getListProduct = useQuery({
    queryKey: ["searchProduct"],
    queryFn: ({ signal }) => collectionAPI.getAllProduct(signal),
    retry: 0
  })

  const listProductFind = (getListProduct?.data?.data as any)?.result?.data || []

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

  const dataListCategoryIsActive = (getListCategoryIsActive.data?.data?.data ?? []) as {
    _id: string
    name: string
    is_active: boolean
  }[]

  const dataListCategoryIsActiveSortAZ = dataListCategoryIsActive.sort((a, b) => {
    return a.name.localeCompare(b.name) // so sánh 2 chuỗi theo thứ tự a-z
  })

  const dataListFilter = listProductFind
    .filter((product: any) => product.category.name === categorySelected)
    .filter((product: any) => {
      if (!searchText) return true
      return product.name.toLowerCase().includes(searchText.toLowerCase())
    })

  const dataListFilter2 = listProductFind
    .filter((product: any) => product.category.name === categorySelected)
    .filter((product: any) => {
      if (!searchText2) return true
      return product.name.toLowerCase().includes(searchText2.toLowerCase())
    })

  const listSpecificationProduct = useMemo(() => {
    if (!categorySelected) return

    const dict_1 = new Map(
      productSelected
        ? productSelected.productSelected?.specifications.map((spec: { name: string; value: string }) => [
            spec.name,
            spec.value
          ])
        : []
    )

    const dict_2 = new Map(
      productSelected_2
        ? productSelected_2.productSelected?.specifications.map((spec: { name: string; value: string }) => [
            spec.name,
            spec.value
          ])
        : []
    )

    const source = listSpecificationForCategory[categorySelected as keyof typeof listSpecificationForCategory]?.map(
      (spec) => ({
        name: spec,
        value_product_1: dict_1.get(spec) || "Đang cập nhật", // lấy ra value tương ứng theo key
        value_product_2: dict_2.get(spec) || "Đang cập nhật"
      })
    )
    return source
  }, [categorySelected, productSelected, productSelected_2])

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
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-[#3a86ff] font-medium">Chọn Danh mục: </h3>
            <Select
              className="w-1/3 "
              placeholder="Chọn danh mục"
              onChange={(value: string) => {
                setCategorySelected(value)
                setProductSelected(null)
                setProductSelected_2(null)
              }}
              styles={{ popup: { root: { zIndex: 10 } } }}
              value={categorySelected}
              options={dataListCategoryIsActiveSortAZ.map((category) => ({
                label: category.name,
                value: category.name
              }))}
            />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:px-8 md:py-6">
            <div className="flex items-center flex-wrap justify-between gap-6">
              <div className="flex-1">
                <Select
                  className="w-full"
                  showSearch
                  allowClear
                  styles={{ popup: { root: { zIndex: 10 } } }}
                  placeholder="Tìm và chọn sản phẩm để so sánh (tối đa 4)"
                  notFoundContent={getListProduct.isFetching ? "Đang tìm..." : "Không tìm thấy"}
                  onSearch={(val) => setSearchText(val)}
                  onChange={(value: string | null) => {
                    setProductSelected({
                      productSelected: dataListFilter.find((p: any) => p._id === value),
                      _id: value as string
                    })
                  }}
                  value={productSelected?._id || null}
                  filterOption={false} // we use server-side search
                  options={
                    dataListFilter?.map((p: any) => ({
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
                  styles={{ popup: { root: { zIndex: 10 } } }}
                  placeholder="Tìm và chọn sản phẩm để so sánh (tối đa 4)"
                  notFoundContent={getListProduct.isFetching ? "Đang tìm..." : "Không tìm thấy"}
                  onSearch={(val) => setSearchText2(val)}
                  onChange={(value: string | null) => {
                    setProductSelected_2({
                      productSelected: dataListFilter2.find((p: any) => p._id === value),
                      _id: value as string
                    })
                  }}
                  value={productSelected_2?._id || null}
                  filterOption={false} // we use server-side search
                  options={
                    dataListFilter2?.map((p: any) => ({
                      label: p.name,
                      value: p._id
                    })) || []
                  }
                />
              </div>
            </div>

            <div className="flex md:gap-6 mt-6">
              <div className="flex-1 p-4 border border-gray-200 rounded-tl-lg rounded-bl-lg md:rounded-lg">
                <ProductCompare productSelected={productSelected} />
              </div>

              <div className="flex-1 p-4 border border-gray-200 rounded-tr-lg rounded-br-lg md:rounded-lg">
                <ProductCompare productSelected={productSelected_2} />
              </div>
            </div>

            {/* render listSpecificationProduct tại đây */}
            {productSelected?.productSelected !== undefined || productSelected_2?.productSelected !== undefined
              ? listSpecificationProduct &&
                listSpecificationProduct.length > 0 && (
                  <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                    <table className="w-full table-fixed">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="w-[25%] p-3 text-left text-sm font-semibold">Thông số</th>
                          <th className="w-[37.5%] p-3 text-left text-sm font-semibold">
                            {productSelected?.productSelected?.name ?? "Sản phẩm 1"}
                          </th>
                          <th className="w-[37.5%] p-3 text-left text-sm font-semibold">
                            {productSelected_2?.productSelected?.name ?? "Sản phẩm 2"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {listSpecificationProduct.map((spec: any, idx: number) => {
                          const isDifferent = (spec.value_product_1 || "") !== (spec.value_product_2 || "")
                          const rowBg = idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                          return (
                            <tr key={spec.name} className={`${rowBg} ${isDifferent ? "bg-red-50" : ""}`}>
                              <td className="p-4 border-r border-gray-200 align-top">
                                <div className="font-semibold text-sm text-gray-700">{spec.name}</div>
                              </td>
                              <td className="p-4 align-top">
                                <div className="text-gray-800 text-sm">{spec.value_product_1 ?? <em>—</em>}</div>
                              </td>
                              <td className="p-4 align-top">
                                <div className="text-gray-800 text-sm">{spec.value_product_2 ?? <em>—</em>}</div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              : null}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
