/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Button, Checkbox, Input, InputRef, Space, Table, TableColumnType, Tag } from "antd"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { adminAPI } from "src/Apis/admin.api"
import { AppContext } from "src/Context/authContext"
import { SuccessResponse } from "src/Types/utils.type"
import { Role } from "../ManageRoles/ManageRoles"
import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { toast } from "react-toastify"
import "./Permission.css"
import type { FilterDropdownProps } from "antd/es/table/interface"
import { SearchOutlined } from "@ant-design/icons"
import Highlighter from "react-highlight-words"
import { useTheme } from "src/Admin/Components/Theme-provider/Theme-provider"

interface PermissionType {
  _id: string
  name: string
  code: string
  group?: string
  api_endpoints: {
    method: string
    path: string
  }
}

type DataIndex = keyof PermissionType

const HighlighterComp = Highlighter as React.ComponentType<any>

export default function Permission() {
  const { userId } = useContext(AppContext)
  const { theme } = useTheme()
  const isDark = theme === "dark" || theme === "system"

  const { data, isError, error } = useQuery({
    queryKey: ["listRoleInPermissions", userId],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.role.getRoles(controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 1 * 60 * 1000, // dưới 3 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<{
    result: Role[]
  }>

  const listRoleId = result?.result?.result.map((item) => item._id)

  const listRole = useMemo(() => {
    const roles = result?.result?.result || []
    return roles
      .sort((a, b) => {
        if (a.key === "ADMIN") return -1
        if (b.key === "ADMIN") return 1
        return 0
      })
      .map((item) => ({ name: item.name, _id: item._id }))
  }, [result])

  const { data: dataPermissions } = useQuery({
    queryKey: ["listPermission", userId],
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

  const resultPermissions = dataPermissions?.data as SuccessResponse<{
    result: PermissionType[]
  }>

  const { data: dataPermissionsByRoles } = useQuery({
    queryKey: ["listPermissionByRoles", listRoleId],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.role.getPermissionsBasedOnId(listRoleId, controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 1 * 60 * 1000, // dưới 3 phút nó không gọi lại api
    placeholderData: keepPreviousData,
    enabled: !!listRoleId
  })

  const resultListPermissionByRolesId = dataPermissionsByRoles?.data as SuccessResponse<{
    result: any[]
  }>

  const listPermissionByRolesId = resultListPermissionByRolesId?.result?.result

  const listPermission = useMemo(() => {
    return resultPermissions?.result?.result || []
  }, [resultPermissions])

  // sort quyền để gom nhóm hiển thị giao diện
  const listPermissionGroup = useMemo(() => {
    if (!listPermission) return []
    const groupSort = [
      "statistical",
      "customer",
      "category",
      "brand",
      "product",
      "supplier",
      "supply",
      "receipt",
      "email",
      "conversation",
      "order",
      "role",
      "permission",
      "staff"
    ]
    const actionSort = ["read", "create", "update", "delete"]
    return listPermission
      .map((item) => ({
        ...item,
        group: item.code.split(":")[0]
      }))
      .sort((a, b) => {
        const [groupA, actionA] = a.code.split(":")
        const [groupB, actionB] = b.code.split(":")

        if (groupSort.indexOf(groupA) < groupSort.indexOf(groupB)) return -1
        if (groupSort.indexOf(groupA) > groupSort.indexOf(groupB)) return 1

        return actionSort.indexOf(actionA) - actionSort.indexOf(actionB)
      })
  }, [listPermission])

  const [filteredData, setFilteredData] = useState<PermissionType[]>([])

  useEffect(() => {
    if (listPermissionGroup.length > 0) {
      setFilteredData(listPermissionGroup)
    }
  }, [listPermissionGroup])

  const groupCount = useMemo(() => {
    const count: Record<string, number> = {}
    filteredData.forEach((item) => {
      count[item.group as string] = (count[item.group as string] || 0) + 1
    })
    return count
  }, [filteredData])

  const [searchText, setSearchText] = useState("")
  const [searchedColumn, setSearchedColumn] = useState("")
  const searchInput = useRef<InputRef>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps["confirm"], dataIndex: DataIndex) => {
    confirm()
    setSearchText(selectedKeys[0])
    setSearchedColumn(dataIndex)
  }

  const handleReset = (clearFilters: () => void) => {
    clearFilters()
    setSearchText("")
    setRefreshKey((prev) => prev + 1)
    setFilteredData(listPermissionGroup)
  }

  const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<PermissionType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : `${isDark ? "white" : "black"}` }} />
    ),
    onFilter: (value, record) => {
      const text = record[dataIndex] ? record[dataIndex].toString().toLowerCase() : ""
      if (!value) {
        return true
      }
      return text.includes((value as string).toLowerCase())
    },
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100)
        }
      }
    },
    render: (text, record) => {
      let colorTag = "blue"
      switch (record.api_endpoints?.method) {
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
      const isSearching = searchedColumn === "name" && searchText

      return dataIndex === "name" ? (
        <div className="font-semibold flex items-center justify-between">
          <div>
            {isSearching ? (
              <HighlighterComp
                highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={text ? text.toString() : ""}
              />
            ) : (
              text
            )}
          </div>
          <Tag color={colorTag}>{record.api_endpoints.method}</Tag>
        </div>
      ) : (
        <div className="font-semibold">{text.charAt(0).toUpperCase() + text.slice(1)}</div>
      )
    }
  })

  const columns: any = [
    {
      title: "Nhóm",
      dataIndex: "group",
      width: 150,
      render: (text: string) => {
        return <div className="font-semibold">{text.charAt(0).toUpperCase() + text.slice(1)}</div>
      },
      ...getColumnSearchProps("group"),
      onCell: (row: PermissionType, rowIndex: number) => {
        const group = row.group
        let rowSpan = 1
        if (rowIndex === 0 || filteredData[rowIndex - 1].group !== group) {
          rowSpan = groupCount[group as string]
        } else {
          rowSpan = 0
        }
        return { rowSpan }
      }
    },
    {
      title: "Quyền hệ thống",
      dataIndex: "name",
      ...getColumnSearchProps("name")
    },
    ...listRole.map((item) => ({
      title: <div className="text-center">{item.name}</div>,
      dataIndex: item.name,
      width: 130,
      render: (text: any, record: PermissionType) => {
        const checkTrue = listPermissionByRolesId?.find(
          (itemPer) => itemPer._id === item._id && itemPer.permissions.find((per: any) => per._id === record._id)
        )
        return (
          <div className="text-center">
            <Checkbox key={record._id} checked={checkTrue} onChange={() => handleChangeChecked(record, item._id)} />
          </div>
        )
      }
    }))
  ]

  const [edited, setEdited] = useState<any[] | null>(null)

  const handleChangeChecked = (record: PermissionType, id_role: string) => {
    console.log(record, id_role)
  }

  useEffect(() => {
    if (isError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((error as any).response?.data?.message, { autoClose: 1500 })
    }
  }, [isError, error])

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
          Phân quyền hệ thống
        </h1>

        <div className="space-x-2">
          <Button type="primary" danger disabled>
            Hủy thay đổi
          </Button>
          <Button type="primary" disabled>
            Cập nhật
          </Button>
        </div>
      </div>

      <div className="permission">
        <Table
          key={refreshKey} // ép Table render lại từ đầu, giúp reset toàn bộ filter và hiển thị lại danh sách gốc.
          rowKey={(item) => item._id}
          columns={columns}
          scroll={{ y: "calc(100vh - 210px)" }} // 👈 chiều cao vùng scroll, header sẽ sticky
          dataSource={filteredData}
          pagination={false}
          bordered
          onChange={(pagination, filters, sorter, extra) => {
            console.log(extra.currentDataSource)
            setFilteredData(extra.currentDataSource)
          }}
        />
      </div>
    </div>
  )
}
