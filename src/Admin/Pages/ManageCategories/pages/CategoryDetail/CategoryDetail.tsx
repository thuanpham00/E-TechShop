import { Tabs } from "antd"
import { Helmet } from "react-helmet-async"
import { useLocation, useParams } from "react-router-dom"
import NavigateBack from "src/Admin/Components/NavigateBack"
import ManageBrand from "../../Components/ManageBrand"
import CategoryMenuConfig from "../../Components/CategoryMenuConfig"
import { useState } from "react"

export default function CategoryDetail() {
  const { id } = useParams()
  const { state } = useLocation()
  const queryConfig = state?.queryConfig
  const dataCategory = state?.data
  const [tab, setTab] = useState("detail")

  const activeKey = tab === "brand" ? "brand" : "detail"

  return (
    <div className="sticky-tabs">
      <Helmet>
        <title>Chi tiết danh mục</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />

      <Tabs
        activeKey={activeKey}
        onChange={(key) => setTab(key)}
        items={[
          {
            key: "detail",
            label: "Chi tiết danh mục",
            children: <CategoryMenuConfig dataCategory={dataCategory} queryConfig={queryConfig} />
          },
          {
            key: "brand",
            label: "Thương hiệu của danh mục",
            children: <ManageBrand idCategory={id as string} nameCategory={dataCategory?.name as string} />
          }
        ]}
      />
    </div>
  )
}
