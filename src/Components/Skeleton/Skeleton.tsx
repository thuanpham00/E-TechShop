import { Spin } from "antd"

export default function Skeleton() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column", // để tip xuất hiện bên dưới spinner,
        height: "calc(100vh - 200px)" // chiếm toàn màn hình
      }}
    >
      <Spin tip="Đang tải dữ liệu..." size="large">
        <div style={{ minHeight: 100, width: 300, marginTop: 10 }} />
      </Spin>
    </div>
  )
}
