/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, Empty, Table, Tag } from "antd"
import { useContext, useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { toast } from "react-toastify"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { AppContext } from "src/Context/authContext"
import { ErrorResponse, MessageResponse, SuccessResponse } from "src/Types/utils.type"
import "./ManageRoles.css"
import AddRole from "./Components/AddRole"
import RoleDetail from "./Components/RoleDetail/RoleDetail"
import { isError400 } from "src/Helpers/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "src/Components/ui/alert-dialog"
import { Pencil, Trash2 } from "lucide-react"
import { RolePermissionAPI } from "src/Apis/admin/role.api"
import Skeleton from "src/Components/Skeleton"

export interface Role {
  _id: string
  name: string
  key: string
  description: string
  permissions: string[]
}

export default function ManageRoles() {
  const queryClient = useQueryClient()

  const { userId } = useContext(AppContext)
  const { data, isError, error, isLoading, isFetching } = useQuery({
    queryKey: ["listRole", userId],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return RolePermissionAPI.getRoles(controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 1 * 60 * 1000, // dưới 3 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<{
    result: Role[]
  }>
  const listRole = result?.result?.result

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => {
      return RolePermissionAPI.deleteRole(id)
    }
  })

  const handleDeleteCategory = (id: string) => {
    deleteRoleMutation.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["listRole", userId] })
        toast.success("Xóa thành công!", { autoClose: 1500 })
      },
      onError: (error) => {
        if (isError400<ErrorResponse<MessageResponse>>(error)) {
          toast.error(error.response?.data.message, {
            autoClose: 1500
          })
        }
      }
    })
  }

  const columns = [
    {
      title: "Tên Role",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <div className="font-semibold">{text}</div>
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
      title: <div className="text-center">Thao tác</div>,
      key: "action",
      render: (_: any, record: Role) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => {
              setAddItem(record)
            }}
          >
            <Pencil color="orange" size={18} />
          </button>
          <AlertDialog>
            <AlertDialogTrigger disabled={record.key === "ADMIN"}>
              <Trash2 color={`${record.key === "ADMIN" ? "gray" : "red"}`} size={18} />
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[350px] dark:bg-darkPrimary">
              <AlertDialogHeader>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-base">Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    Không thể hoàn tác hành động này. Thao tác này sẽ xóa vĩnh viễn dữ liệu của bạn.
                  </AlertDialogDescription>
                </AlertDialogHeader>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-sm dark:bg-darkPrimary">Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteCategory(record._id)}
                  className="bg-red-500 hover:bg-red-600 text-sm text-white"
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    }
  ]

  const [addItem, setAddItem] = useState<boolean | any>(null)

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
      <div className="flex justify-end gap-2">
        <Button onClick={() => setAddItem(true)} type="primary">
          Thêm vai trò
        </Button>
      </div>
      <div className="mt-4">
        {isLoading ? (
          <Skeleton />
        ) : listRole && listRole.length > 0 ? (
          <Table rowKey="_id" dataSource={listRole} columns={columns} loading={isFetching} />
        ) : (
          !isFetching && (
            <div className="text-center mt-4">
              <Empty description="Chưa có vai trò nào" />
            </div>
          )
        )}
      </div>

      <AddRole setAddItem={setAddItem} addItem={addItem} />

      {typeof addItem === "object" && addItem !== null && <RoleDetail setAddItem={setAddItem} dataItem={addItem} />}
    </div>
  )
}
