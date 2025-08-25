/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Button, Table, Tag } from "antd"
import { Helmet } from "react-helmet-async"
import { useNavigate } from "react-router-dom"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { adminAPI } from "src/Apis/admin.api"
import { path } from "src/Constants/path"
import { SuccessResponse } from "src/Types/utils.type"

interface Role {
  _id: string
  name: string
  description: string
  permissions: string[]
}

export default function ManageRoles() {
  const navigate = useNavigate()
  const { data } = useQuery({
    queryKey: ["listRoles"],
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
              state: record._id
            })
          }}
        >
          Xem chi tiết
        </Button>
      )
    }
  ]
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

      {/* <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title={`Chi tiết quyền - ${selectedRole?.name}`}
        footer={null}
        width={600}
      >
        {selectedRole && (
          <div>
            <p>
              <strong>Mô tả:</strong> {selectedRole.description}
            </p>
            <p>
              <strong>Ngày tạo:</strong> {selectedRole.created_at}
            </p>
            <p>
              <strong>Ngày cập nhật:</strong> {selectedRole.updated_at}
            </p>
            <p>
              <strong>Danh sách quyền:</strong>
            </p>
            <ul>
              {selectedRole.permissions.map((perm, idx) => (
                <li key={idx}>{perm}</li>
              ))}
            </ul>
          </div>
        )}
      </Modal> */}
    </div>
  )
}
