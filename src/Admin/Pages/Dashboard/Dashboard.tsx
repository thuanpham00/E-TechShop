import { Helmet } from "react-helmet-async"

export default function Dashboard() {
  return (
    <div className="h-[700px]">
      <Helmet>
        <title>TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      Dashboard
    </div>
  )
}
