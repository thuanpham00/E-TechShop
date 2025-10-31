import { Tabs } from "antd"
import { Helmet } from "react-helmet-async"
import { useLocation, useParams } from "react-router-dom"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { useState } from "react"
import CategoryDetail from "./Components/CategoryDetail"
import ManageCategorySubLink from "./Components/ManageCategorySubLink"
import ManageBrand from "./Components/ManageBrand"

export default function CategoryOverview() {
  const { id } = useParams()
  const { state } = useLocation()
  const queryConfig = state?.queryConfig
  const dataCategory = state?.data
  const [tab, setTab] = useState("detail")

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
        activeKey={tab}
        onChange={(key) => setTab(key)}
        items={[
          {
            key: "detail",
            label: "Thông tin danh mục",
            children: <CategoryDetail dataCategory={dataCategory} queryConfig={queryConfig} />
          },
          {
            key: "list",
            label: "Danh sách menu danh mục",
            children: <ManageCategorySubLink dataCategory={dataCategory} />
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
