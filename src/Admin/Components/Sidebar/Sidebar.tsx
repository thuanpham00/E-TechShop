import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Banknote,
  BookOpenCheck,
  ClipboardCopy,
  Cpu,
  House,
  Info,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageCircle,
  PackageSearch,
  User,
  Users,
  Settings,
  Settings2,
  Tickets,
  Star
} from "lucide-react"
import { path } from "src/Constants/path"
import SidebarItem from "../SidebarItem"
import React, { useContext } from "react"
import { AppContext } from "src/Context/authContext"
import useRolePermissions from "src/Hook/useRolePermissions"
import { permissions } from "src/Helpers/role_permission"
import { Menu, MenuProps } from "antd"
import "./Sidebar.css"
import { useMutation } from "@tanstack/react-query"
import { userAPI } from "src/Apis/user.api"
import { toast } from "react-toastify"

export default function Sidebar() {
  const { setIsAuthenticated, setNameUser, setRole, setAvatar, role } = useContext(AppContext)
  const navigate = useNavigate()
  const { hasPermission } = useRolePermissions(role as string)

  const location = useLocation()

  const sideBarList = [
    { name: "Thống kê hệ thống", icon: LayoutDashboard, path: path.AdminDashboard },
    { name: "Quản lý Khách hàng", icon: User, path: path.AdminCustomers },
    { name: "Quản lý Nhân viên", icon: Users, path: path.AdminEmployees },
    { name: "Quản lý Danh mục", icon: BookOpenCheck, path: path.AdminCategories },
    { name: "Quản lý Sản phẩm", icon: PackageSearch, path: path.AdminProducts },
    { name: "Quản lý Đơn hàng", icon: Banknote, path: path.AdminOrders },
    { name: "Quản lý Phiếu nhập", icon: ClipboardCopy, path: path.AdminReceipts },
    { name: "Quản lý Cung ứng", icon: PackageSearch, path: path.AdminSupplies },
    { name: "Quản lý Nhà cung cấp", icon: House, path: path.AdminSuppliers },
    { name: "Quản lý Vai trò", icon: Settings2, path: path.AdminRole },
    { name: "Thông báo Email", icon: Mail, path: path.AdminEmail },
    { name: "Hệ thống chat", icon: MessageCircle, path: path.AdminChat },
    { name: "Phân quyền hệ thống", icon: Settings, path: path.AdminPermission },
    { name: "Quản lý Voucher", icon: Tickets, path: path.AdminVoucher },
    { name: "Quản lý Đánh giá", icon: Star, path: path.AdminReview }
  ]

  const logoutMutation = useMutation({
    mutationFn: () => {
      return userAPI.logoutUser()
    }
  })

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: (response) => {
        setIsAuthenticated(false)
        setNameUser(null)
        setRole(null)
        setAvatar(null)

        navigate(path.Login)
        toast.success(response.data.message, {
          autoClose: 1000
        })
      }
    })
  }

  const checkActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + "/") // dùng để chính route chính và các route con như /id ...
  }

  const getSelectedKey = (): string => {
    const activeItem = sideBarList.find(
      (item) => location.pathname === item.path || location.pathname.startsWith(item.path + "/")
    )
    return activeItem ? activeItem.path : location.pathname
  }

  const sub1Menu = [
    hasPermission(permissions.VIEW_CUSTOMER) && {
      key: path.AdminCustomers,
      label: (
        <SidebarItem
          className={`${checkActive(sideBarList[1].path) ? "text-[14px] text-[#3b82f6] font-semibold" : "text-[14px] text-white font-normal hover:text-[#495057] duration-200 ease-in"}`}
          classNameWrapper={`flex items-center gap-2 cursor-pointer`}
          icon={React.createElement(sideBarList[1].icon, {
            color: checkActive(sideBarList[1].path) ? "#3b82f6" : "white"
          })}
          nameSideBar={sideBarList[1].name}
          path={sideBarList[1].path}
        />
      )
    },
    hasPermission(permissions.VIEW_ORDERS) && {
      key: path.AdminOrders,
      label: (
        <SidebarItem
          className={`${checkActive(sideBarList[5].path) ? "text-[14px] text-[#3b82f6] font-semibold" : "text-[14px] text-white font-normal hover:text-[#495057] duration-200 ease-in"}`}
          classNameWrapper={`flex items-center gap-2 cursor-pointer`}
          icon={React.createElement(sideBarList[5].icon, {
            color: checkActive(sideBarList[5].path) ? "#3b82f6" : "white"
          })}
          nameSideBar={sideBarList[5].name}
          path={sideBarList[5].path}
        />
      )
    },
    hasPermission(permissions.VIEW_VOUCHER) && {
      key: path.AdminVoucher,
      label: (
        <SidebarItem
          className={`${checkActive(sideBarList[13].path) ? "text-[14px] text-[#3b82f6] font-semibold" : "text-[14px] text-white font-normal hover:text-[#495057] duration-200 ease-in"}`}
          classNameWrapper={`flex items-center gap-2 cursor-pointer`}
          icon={React.createElement(sideBarList[13].icon, {
            color: checkActive(sideBarList[13].path) ? "#3b82f6" : "white"
          })}
          nameSideBar={sideBarList[13].name}
          path={sideBarList[13].path}
        />
      )
    },
    hasPermission(permissions.VIEW_REVIEW) && {
      key: path.AdminReview,
      label: (
        <SidebarItem
          className={`${checkActive(sideBarList[14].path) ? "text-[14px] text-[#3b82f6] font-semibold" : "text-[14px] text-white font-normal hover:text-[#495057] duration-200 ease-in"}`}
          classNameWrapper={`flex items-center gap-2 cursor-pointer`}
          icon={React.createElement(sideBarList[14].icon, {
            color: checkActive(sideBarList[14].path) ? "#3b82f6" : "white"
          })}
          nameSideBar={sideBarList[14].name}
          path={sideBarList[14].path}
        />
      )
    }
  ].filter(Boolean)

  const sub1 =
    sub1Menu.length > 0
      ? {
          key: "sub1",
          label: <div className="font-semibold text-[15px] text-white">Quản lý Bán hàng</div>,
          children: sub1Menu
        }
      : null

  const sub2Menu = [
    hasPermission(permissions.VIEW_CATEGORY) && {
      key: path.AdminCategories,
      label: (
        <SidebarItem
          className={`${checkActive(sideBarList[3].path) ? "text-[14px] text-[#3b82f6] font-semibold" : "text-[14px] text-white font-normal hover:text-[#495057] duration-200 ease-in"}`}
          classNameWrapper={`flex items-center gap-2 cursor-pointer`}
          icon={React.createElement(sideBarList[3].icon, {
            color: checkActive(sideBarList[3].path) ? "#3b82f6" : "white"
          })}
          nameSideBar={sideBarList[3].name}
          path={sideBarList[3].path}
        />
      )
    },
    hasPermission(permissions.VIEW_PRODUCT) && {
      key: path.AdminProducts,
      label: (
        <SidebarItem
          className={`${checkActive(sideBarList[4].path) ? "text-[14px] text-[#3b82f6] font-semibold" : "text-[14px] text-white font-normal hover:text-[#495057] duration-200 ease-in"}`}
          classNameWrapper={`flex items-center gap-2 cursor-pointer`}
          icon={React.createElement(sideBarList[4].icon, {
            color: checkActive(sideBarList[4].path) ? "#3b82f6" : "white"
          })}
          nameSideBar={sideBarList[4].name}
          path={sideBarList[4].path}
        />
      )
    }
  ].filter(Boolean)

  const sub2 =
    sub2Menu.length > 0
      ? {
          key: "sub2",
          label: <div className="font-semibold text-[15px] text-white">Quản lý Sản phẩm</div>,
          children: sub2Menu
        }
      : null

  const sub4Menu = [
    hasPermission(permissions.VIEW_RECEIPT) && {
      key: path.AdminReceipts,
      label: (
        <SidebarItem
          className={`${checkActive(sideBarList[6].path) ? "text-[14px] text-[#3b82f6] font-semibold" : "text-[14px] text-white font-normal hover:text-[#495057] duration-200 ease-in"}`}
          classNameWrapper={`flex items-center gap-2 cursor-pointer`}
          icon={React.createElement(sideBarList[6].icon, {
            color: checkActive(sideBarList[6].path) ? "#3b82f6" : "white"
          })}
          nameSideBar={sideBarList[6].name}
          path={sideBarList[6].path}
        />
      )
    },
    hasPermission(permissions.VIEW_SUPPLIERS) && {
      key: path.AdminSuppliers,
      label: (
        <SidebarItem
          className={`${checkActive(sideBarList[8].path) ? "text-[14px] text-[#3b82f6] font-semibold" : "text-[14px] text-white font-normal hover:text-[#495057] duration-200 ease-in"}`}
          classNameWrapper={`flex items-center gap-2 cursor-pointer`}
          icon={React.createElement(sideBarList[8].icon, {
            color: checkActive(sideBarList[8].path) ? "#3b82f6" : "white"
          })}
          nameSideBar={sideBarList[8].name}
          path={sideBarList[8].path}
        />
      )
    },
    hasPermission(permissions.VIEW_SUPPLIES) && {
      key: path.AdminSupplies,
      label: (
        <SidebarItem
          className={`${checkActive(sideBarList[7].path) ? "text-[14px] text-[#3b82f6] font-semibold" : "text-[14px] text-white font-normal hover:text-[#495057] duration-200 ease-in"}`}
          classNameWrapper={`flex items-center gap-2 cursor-pointer`}
          icon={React.createElement(sideBarList[7].icon, {
            color: checkActive(sideBarList[7].path) ? "#3b82f6" : "white"
          })}
          nameSideBar={sideBarList[7].name}
          path={sideBarList[7].path}
        />
      )
    }
  ].filter(Boolean)

  const sub4 =
    sub4Menu.length > 0
      ? {
          key: "sub4",
          label: <div className="font-semibold text-[15px] text-white">Quản lý Nhập hàng</div>,
          children: sub4Menu
        }
      : null

  const sub5Menu = [
    hasPermission(permissions.VIEW_EMPLOYEE) && {
      key: path.AdminEmployees,
      label: (
        <SidebarItem
          className={`${checkActive(sideBarList[2].path) ? "text-[14px] text-[#3b82f6] font-semibold" : "text-[14px] text-white font-normal hover:text-[#495057] duration-200 ease-in"}`}
          classNameWrapper={`flex items-center gap-2 cursor-pointer`}
          icon={React.createElement(sideBarList[2].icon, {
            color: checkActive(sideBarList[2].path) ? "#3b82f6" : "white"
          })}
          nameSideBar={sideBarList[2].name}
          path={sideBarList[2].path}
        />
      )
    },
    hasPermission(permissions.VIEW_ROLES) && {
      key: path.AdminRole,
      label: (
        <SidebarItem
          className={`${checkActive(sideBarList[9].path) ? "text-[14px] text-[#3b82f6] font-semibold" : "text-[14px] text-white font-normal hover:text-[#495057] duration-200 ease-in"}`}
          classNameWrapper={`flex items-center gap-2 cursor-pointer`}
          icon={React.createElement(sideBarList[9].icon, {
            color: checkActive(sideBarList[9].path) ? "#3b82f6" : "white"
          })}
          nameSideBar={sideBarList[9].name}
          path={sideBarList[9].path}
        />
      )
    },
    hasPermission(permissions.VIEW_PERMISSION) && {
      key: path.AdminPermission,
      label: (
        <SidebarItem
          className={`${checkActive(sideBarList[12].path) ? "text-[14px] text-[#3b82f6] font-semibold" : "text-[14px] text-white font-normal hover:text-[#495057] duration-200 ease-in"}`}
          classNameWrapper={`flex items-center gap-2 cursor-pointer`}
          icon={React.createElement(sideBarList[12].icon, {
            color: checkActive(sideBarList[12].path) ? "#3b82f6" : "white"
          })}
          nameSideBar={sideBarList[12].name}
          path={sideBarList[12].path}
        />
      )
    }
  ].filter(Boolean) // dùng Filter(Boolean) để loại bỏ false undefined null

  const sub5 =
    sub5Menu.length > 0
      ? {
          key: "sub5",
          label: <div className="font-semibold text-[15px] text-white">Cấu hình và bảo mật</div>,
          children: sub5Menu
        }
      : null

  const items: MenuProps["items"] = [
    ...(hasPermission(permissions.VIEW_DASHBOARD)
      ? [
          {
            key: path.AdminDashboard, // key trùng pathname
            label: (
              <Link to={path.AdminDashboard} className="font-semibold text-white block text-[15px]">
                Thống kê hệ thống
              </Link>
            )
          }
        ]
      : []),
    sub1,
    {
      type: "divider"
    },
    sub2,
    {
      type: "divider"
    },
    ...(hasPermission(permissions.VIEW_CHAT)
      ? [
          {
            key: path.AdminChat, // key trùng pathname
            label: (
              <Link to={path.AdminChat} className="font-semibold text-white block text-[15px]">
                Hệ thống tư vấn
              </Link>
            )
          }
        ]
      : []),
    {
      type: "divider"
    },
    ...(hasPermission(permissions.VIEW_EMAIL)
      ? [
          {
            key: path.AdminEmail, // key trùng pathname
            label: (
              <Link to={path.AdminEmail} className="font-semibold text-white block text-[15px]">
                Thông báo email
              </Link>
            )
          }
        ]
      : []),
    {
      type: "divider"
    },
    sub4,
    {
      type: "divider"
    },
    sub5
  ]

  return (
    <div className="sticky top-0 left-0 py-4 bg-darkPrimary h-screen border-r border-[#dedede] dark:border-darkBorder shadow-xl">
      <div>
        <div className="flex items-center justify-center gap-2 py-1 rounded-lg mr-2">
          <Cpu color={"white"} size={30} />
          <span className="text-white text-2xl font-bold">TechZone</span>
        </div>
        <div className="mt-4 menu-sidebar">
          <Menu
            mode="inline"
            style={{
              maxHeight: "calc(100vh - 190px)", // 64px là header, bạn tuỳ chỉnh
              overflowY: "auto",
              overflowX: "hidden"
            }}
            selectedKeys={[getSelectedKey()]}
            defaultOpenKeys={["sub1", "sub2"]}
            className="bg-darkPrimary menu-scroll"
            items={items}
          />
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-darkPrimary">
          <div className="m-4">
            <Link
              to={path.AdminProfile}
              className={`text-[14px] flex items-center gap-1 px-3 py-2 w-full hover:text-primaryBlue bg-darkPrimary hover:underline duration-100 ${checkActive(path.AdminProfile) ? "text-primaryBlue font-semibold" : "text-white"}`}
            >
              Thông tin tài khoản
              <Info size={16} />
            </Link>
            <button
              onClick={handleLogout}
              className="text-[14px] flex items-center gap-1 px-3 py-2 w-full hover:text-primaryBlue text-white bg-darkPrimary hover:underline duration-100"
            >
              Đăng xuất
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
