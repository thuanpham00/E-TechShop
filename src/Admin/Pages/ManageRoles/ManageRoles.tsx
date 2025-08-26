/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Button, Table, Tag } from "antd"
import { useContext, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { adminAPI } from "src/Apis/admin.api"
import { path } from "src/Constants/path"
import { AppContext } from "src/Context/authContext"
import { SuccessResponse } from "src/Types/utils.type"

interface Role {
  _id: string
  name: string
  description: string
  permissions: string[]
}

export default function ManageRoles() {
  const { userId } = useContext(AppContext)
  const navigate = useNavigate()
  const { data, isError, error } = useQuery({
    queryKey: ["listRoles", userId],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.role.getRoles(controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 3 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<{
    result: Role[]
  }>
  const listRole = result?.result?.result

  const columns = [
    {
      title: "Tên Role",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description"
    },
    {
      title: "Số quyền",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions: string[]) => <Tag color="blue">{permissions?.length}</Tag>
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: Role) => (
        <Button
          type="default"
          onClick={() => {
            navigate(path.AdminPermission, {
              state: {
                name: record.name,
                idRole: record._id
              }
            })
          }}
        >
          Xem chi tiết
        </Button>
      )
    }
  ]

  useEffect(() => {
    if (isError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((error as any).response?.data?.message, { autoClose: 1500 })
    }
  }, [isError, error])

  return (
    <div>
      <Helmet>
        <title>Quản lý vai trò</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />

      <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
        Vai trò hệ thống
      </h1>

      <div className="mt-6">
        <Table rowKey="_id" dataSource={listRole} columns={columns} />
      </div>
    </div>
  )
}
