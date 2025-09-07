import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { Col, Row, Tag, Transfer, TransferProps } from "antd"
import { Key, useContext, useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { adminAPI } from "src/Apis/admin.api"
import { SuccessResponse } from "src/Types/utils.type"
import "./ManagePermission.css"
import { useLocation } from "react-router-dom"
import { AppContext } from "src/Context/authContext"
import { toast } from "react-toastify"

export interface PermissionType {
  _id: string
  name: string
  code: string
  api_endpoints: {
    method: string
    path: string
  }
}

export default function ManagePermissions() {
  const { userId } = useContext(AppContext)
  const { state } = useLocation()
  const { name, idRole } = state

  const { data, isError, error } = useQuery({
    queryKey: ["listPermissions", userId],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.role.getPermissions(controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 1 * 60 * 1000, // dưới 3 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<{
    result: PermissionType[]
  }>

  const {
    data: dataPermissionBasedOnIdRole,
    isError: isErrorPermission,
    error: errorPermissions
  } = useQuery({
    queryKey: ["listPermissionsBasedOnIdRole", idRole],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.role.getPermissionsBasedOnId(idRole, controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 1 * 60 * 1000, // dưới 3 phút nó không gọi lại api
    placeholderData: keepPreviousData,
    enabled: !!idRole
  })

  const resultPermissionsRoleId = dataPermissionBasedOnIdRole?.data as SuccessResponse<{
    result: {
      _id: string
      name: string
      description: string
      permissions: PermissionType[]
    }
  }>

  const listPermissionsRoleId = resultPermissionsRoleId?.result?.result?.permissions

  const [mockData, setMockData] = useState<PermissionType[]>([])
  const [targetKeys, setTargetKeys] = useState<TransferProps["targetKeys"]>([])

  useEffect(() => {
    if (result?.result && resultPermissionsRoleId?.result) {
      const allPermissions = result?.result?.result.map((item) => ({
        _id: item._id,
        name: item.name,
        code: item.code,
        api_endpoints: {
          method: item.api_endpoints?.method,
          path: item.api_endpoints?.path
        }
      }))
      const rolePermissionsKeys = listPermissionsRoleId?.map((item) => item._id)
      setMockData(allPermissions) // cột trái
      setTargetKeys(rolePermissionsKeys) // cột phải
      // nó kiểm tra setTargetKeys gồm những _id nào trong đó và nó sẽ loại bỏ chọn ở setMockData
    }
  }, [result, resultPermissionsRoleId, listPermissionsRoleId])

  useEffect(() => {
    if (isError || isErrorPermission) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = isError ? (error as any).response?.data?.message : (errorPermissions as any).response?.data?.message
      toast.error(msg, { autoClose: 1500 })
    }
  }, [isError, error, isErrorPermission, errorPermissions])

  const updatePermissionMutation = useMutation({
    mutationFn: (body: { idRole: string; listPermissions: Key[]; type: string }) => {
      return adminAPI.role.updatePermissionsBasedOnId(body.idRole, body.listPermissions, body.type)
    },
    onSuccess: () => {
      toast.success("Cập nhật quyền thành công", {
        autoClose: 1500
      })
    }
  })

  const handleChange = (newTargetKeys: Key[], direction: "left" | "right", moveKeys: Key[]) => {
    if (direction === "left") {
      updatePermissionMutation.mutateAsync({ idRole: idRole, listPermissions: moveKeys, type: "remove" })
    } else if (direction === "right") {
      updatePermissionMutation.mutate({ idRole: idRole, listPermissions: moveKeys, type: "add" })
    }
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
        Quyền hệ thống của {name}
      </h1>

      <div className="bg-white dark:bg-darkPrimary p-6 shadow-md rounded-2xl overflow-x-auto">
        <Transfer
          rowKey={(item) => item._id}
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
            height: 500,
            overflowY: "auto", // scroll dọc
            overflowX: "auto", // scroll dọc
            display: "block",
            minWidth: 200
          }}
          operations={["to right", "to left"]}
          onChange={handleChange}
          titles={["Danh sách quyền hệ thống", "Đã chọn"]}
          render={(item) => {
            let colorTag = "blue" // default
            switch (item.api_endpoints?.method) {
              case "GET":
                colorTag = "green"
                break
              case "POST":
                colorTag = "blue"
                break
              case "PUT":
                colorTag = "orange"
                break
              case "DELETE":
                colorTag = "red"
                break
              default:
                colorTag = "gray"
            }

            return (
              <Row
                gutter={4}
                className="px-3 py-2 pr-0 bg-white dark:bg-darkPrimary shadow hover:bg-gray-50 transition-colors"
              >
                <Col span={14} className="font-medium text-gray-800 dark:text-white">
                  {item.name}
                </Col>
                <Col span={7} className="text-gray-500 dark:text-[#f2f2f2] text-sm break-words whitespace-normal">
                  {item.api_endpoints.path}
                </Col>
                <Col span={3} className="text-right">
                  <Tag color={colorTag} className="">
                    {item.api_endpoints.method}
                  </Tag>
                </Col>
              </Row>
            )
          }}
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

Product: 2
Customer: 4
Category: 4
Brand: 4
Supplier: 4
Supply: 4
Receipt: 2
order: 2
Statistical: 3
email: 2
chat: 2
role & permissions: 7
employees : 1
*/
