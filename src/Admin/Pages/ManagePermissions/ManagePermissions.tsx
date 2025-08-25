import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Transfer, TransferProps } from "antd"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { adminAPI } from "src/Apis/admin.api"
import { SuccessResponse } from "src/Types/utils.type"
import "./ManagePermission.css"

interface RecordType {
  key: string
  name: string
  code: string
  api_endpoints: {
    method: string
    path: string
  }
}

export default function ManagePermissions() {
  const { data } = useQuery({
    queryKey: ["listRoles"],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.role.getPermissions(controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 3 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: {
      _id: string
      name: string
      code: string
      api_endpoints: {
        method: string
        path: string
      }
    }[]
  }>

  const [mockData, setMockData] = useState<RecordType[]>([])
  const [targetKeys, setTargetKeys] = useState<TransferProps["targetKeys"]>([])

  useEffect(() => {
    if (result.result) {
      const data = result?.result?.result.map((item) => ({
        key: item._id,
        name: item.name,
        code: item.code,
        api_endpoints: {
          method: item.api_endpoints?.method,
          path: item.api_endpoints?.path
        }
      }))
      setMockData(data)
      setTargetKeys(data.map((item) => item.key))
    }
  }, [result])

  const handleChange: TransferProps["onChange"] = (newTargetKeys) => {
    setTargetKeys(newTargetKeys)
  }

  return (
    <div>
      <Helmet>
        <title>Quản lý quyền hệ thống</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />

      <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
        Quyền hệ thống
      </h1>

      <div className="bg-white p-6 shadow-md rounded-2xl">
        <Transfer
          dataSource={mockData}
          targetKeys={targetKeys}
          showSearch
          filterOption={(inputValue, item) => {
            return (
              item.name.toLowerCase().includes(inputValue.toLowerCase()) ||
              item.code.toLowerCase().includes(inputValue.toLowerCase())
            )
          }}
          listStyle={{
            height: 500
          }}
          operations={["to right", "to left"]}
          onChange={handleChange}
          titles={["Đã chọn", "Danh sách"]}
          render={(item) => (
            <div className="flex justify-between items-center px-3 py-2 bg-white shadow hover:bg-gray-50 transition-colors">
              <span className="font-medium text-gray-800">{item.name}</span>
              <span className="text-gray-500 text-sm">{item.code}</span>
            </div>
          )}
          locale={{
            itemUnit: "quyền", // số ít
            itemsUnit: "quyền", // số nhiều
            searchPlaceholder: "Tìm kiếm quyền"
          }}
        />
      </div>
    </div>
  )
}

/**
  hiện tại gom được 41 quyền - admin có đủ 41 quyền - và các api (quyền nhỏ) bỏ qua chỉ lấy api lớn - ví dụ api lấy giá bán bỏ qua vì cần có quyền tạo cung ứng sản phẩm trước rồi mới pass qua quyền này mới vào api trong được -> lấy những cái api chính (xử lý chính)

  còn coi bổ sung thêm các quyền bên users

  sau đó thêm role
 * Product: 2
Customer: 5
Category: 5
Brand: 5
Supplier: 5
Supply: 5
Receipt: 2
order: 3
Statistical: 3
email: 2
chat: 2
role & permissions: 2
 */
