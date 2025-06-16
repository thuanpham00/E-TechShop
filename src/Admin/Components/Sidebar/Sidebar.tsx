import { useLocation } from "react-router-dom"
import {
  Banknote,
  BookOpenCheck,
  CircleDollarSign,
  ClipboardCopy,
  Cpu,
  House,
  IdCard,
  LayoutDashboard,
  PackageSearch,
  User,
  Users
} from "lucide-react"
import { path } from "src/Constants/path"
import SidebarItem from "../SidebarItem"
import React, { useContext } from "react"
import { AppContext } from "src/Context/authContext"
import useRolePermissions from "src/Hook/useRolePermissions"
import { permissions } from "src/Helpers/role_permission"

export default function Sidebar() {
  const { role } = useContext(AppContext)
  const { hasPermission } = useRolePermissions(role as string)

  const location = useLocation()

  const sideBarList = [
    { name: "Thống kê", icon: LayoutDashboard, path: path.AdminDashboard },
    { name: "Quản lý Khách hàng", icon: User, path: path.AdminCustomers },
    { name: "Quản lý Nhân viên", icon: Users, path: path.AdminEmployees },
    { name: "Quản lý Danh mục", icon: BookOpenCheck, path: path.AdminCategories },
    { name: "Quản lý Sản phẩm", icon: PackageSearch, path: path.AdminProducts },
    { name: "Quản lý Đơn hàng", icon: Banknote, path: path.AdminOrders },
    { name: "Quản lý Nhập hàng", icon: ClipboardCopy, path: path.AdminReceipts },
    { name: "Quản lý Cung ứng", icon: PackageSearch, path: path.AdminSupplies },
    { name: "Quản lý Nhà cung cấp", icon: House, path: path.AdminSuppliers },
    { name: "Quản lý Vai trò", icon: IdCard, path: path.AdminRole },
    { name: "Quản lý Doanh thu", icon: CircleDollarSign, path: path.AdminRevenue }
  ]

  return (
    <div className="sticky top-0 left-0 p-4 pl-3 bg-white dark:bg-darkPrimary h-screen border-r border-[#dedede] dark:border-darkBorder shadow-xl">
      <div>
        <div className="flex items-center justify-center">
          <Cpu />
          <span className="text-darkPrimary dark:text-white text-2xl font-bold">TechZone</span>
        </div>
        <div className="mt-4">
          {hasPermission(permissions.VIEW_DASHBOARD) && (
            <SidebarItem
              className={`${location.pathname.startsWith(sideBarList[0].path) ? "text-[14px] text-white font-semibold" : "text-[14px] text-black dark:text-white/80 font-medium hover:text-[#495057] duration-200 ease-in"}`}
              classNameWrapper={`${location.pathname.startsWith(sideBarList[0].path) ? "flex items-center gap-2 cursor-pointer mb-2 rounded-3xl p-2 bg-[#3b82f6] shadow-3xl" : "flex items-center gap-2 cursor-pointer mb-2 rounded-sm p-2"} pl-4`}
              icon={React.createElement(sideBarList[0].icon, {
                color: location.pathname.startsWith(sideBarList[0].path) ? "white" : "black"
              })}
              nameSideBar={sideBarList[0].name}
              path={sideBarList[0].path}
            />
          )}
          {hasPermission(permissions.VIEW_CUSTOMER) && (
            <SidebarItem
              className={`${location.pathname.startsWith(sideBarList[1].path) ? "text-[14px] text-white font-semibold" : "text-[14px] text-black dark:text-white/80 font-medium hover:text-[#495057] duration-200 ease-in"}`}
              classNameWrapper={`${location.pathname.startsWith(sideBarList[1].path) ? "flex items-center gap-2 cursor-pointer mb-2 rounded-3xl p-2 bg-[#3b82f6] shadow-3xl" : "flex items-center gap-2 cursor-pointer mb-2 rounded-sm p-2"} pl-4`}
              icon={React.createElement(sideBarList[1].icon, {
                color: location.pathname.startsWith(sideBarList[1].path) ? "white" : "black"
              })}
              nameSideBar={sideBarList[1].name}
              path={sideBarList[1].path}
            />
          )}
          {hasPermission(permissions.VIEW_EMPLOYEE) && (
            <SidebarItem
              className={`${location.pathname.startsWith(sideBarList[2].path) ? "text-[14px] text-white font-semibold" : "text-[14px] text-black dark:text-white/80 font-medium hover:text-[#495057] duration-200 ease-in"}`}
              classNameWrapper={`${location.pathname.startsWith(sideBarList[2].path) ? "flex items-center gap-2 cursor-pointer mb-2 rounded-3xl p-2 bg-[#3b82f6] shadow-3xl" : "flex items-center gap-2 cursor-pointer mb-2 rounded-sm p-2"} pl-4`}
              icon={React.createElement(sideBarList[2].icon, {
                color: location.pathname.startsWith(sideBarList[2].path) ? "white" : "black"
              })}
              nameSideBar={sideBarList[2].name}
              path={sideBarList[2].path}
            />
          )}
          {hasPermission(permissions.VIEW_CATEGORY) && (
            <SidebarItem
              className={`${location.pathname.startsWith(sideBarList[3].path) ? "text-[14px] text-white font-semibold" : "text-[14px] text-black dark:text-white/80 font-medium hover:text-[#495057] duration-200 ease-in"}`}
              classNameWrapper={`${location.pathname.startsWith(sideBarList[3].path) ? "flex items-center gap-2 cursor-pointer mb-2 rounded-3xl p-2 bg-[#3b82f6] shadow-3xl" : "flex items-center gap-2 cursor-pointer mb-2 rounded-sm p-2"} pl-4`}
              icon={React.createElement(sideBarList[3].icon, {
                color: location.pathname.startsWith(sideBarList[3].path) ? "white" : "black"
              })}
              nameSideBar={sideBarList[3].name}
              path={sideBarList[3].path}
            />
          )}
          {hasPermission(permissions.VIEW_PRODUCT) && (
            <SidebarItem
              className={`${location.pathname.startsWith(sideBarList[4].path) ? "text-[14px] text-white font-semibold" : "text-[14px] text-black dark:text-white/80 font-medium hover:text-[#495057] duration-200 ease-in"}`}
              classNameWrapper={`${location.pathname.startsWith(sideBarList[4].path) ? "flex items-center gap-2 cursor-pointer mb-2 rounded-3xl p-2 bg-[#3b82f6] shadow-3xl" : "flex items-center gap-2 cursor-pointer mb-2 rounded-sm p-2"} pl-4`}
              icon={React.createElement(sideBarList[4].icon, {
                color: location.pathname.startsWith(sideBarList[4].path) ? "white" : "black"
              })}
              nameSideBar={sideBarList[4].name}
              path={sideBarList[4].path}
            />
          )}
          {hasPermission(permissions.VIEW_ORDERS) && (
            <SidebarItem
              className={`${location.pathname.startsWith(sideBarList[5].path) ? "text-[14px] text-white font-semibold" : "text-[14px] text-black dark:text-white/80 font-medium hover:text-[#495057] duration-200 ease-in"}`}
              classNameWrapper={`${location.pathname.startsWith(sideBarList[5].path) ? "flex items-center gap-2 cursor-pointer mb-2 rounded-3xl p-2 bg-[#3b82f6] shadow-3xl" : "flex items-center gap-2 cursor-pointer mb-2 rounded-sm p-2"} pl-4`}
              icon={React.createElement(sideBarList[5].icon, {
                color: location.pathname.startsWith(sideBarList[5].path) ? "white" : "black"
              })}
              nameSideBar={sideBarList[5].name}
              path={sideBarList[5].path}
            />
          )}
          {hasPermission(permissions.VIEW_RECEIPT) && (
            <SidebarItem
              className={`${location.pathname.startsWith(sideBarList[6].path) ? "text-[14px] text-white font-semibold" : "text-[14px] text-black dark:text-white/80 font-medium hover:text-[#495057] duration-200 ease-in"}`}
              classNameWrapper={`${location.pathname.startsWith(sideBarList[6].path) ? "flex items-center gap-2 cursor-pointer mb-2 rounded-3xl p-2 bg-[#3b82f6] shadow-3xl" : "flex items-center gap-2 cursor-pointer mb-2 rounded-sm p-2"} pl-4`}
              icon={React.createElement(sideBarList[6].icon, {
                color: location.pathname.startsWith(sideBarList[6].path) ? "white" : "black"
              })}
              nameSideBar={sideBarList[6].name}
              path={sideBarList[6].path}
            />
          )}
          {hasPermission(permissions.VIEW_SUPPLIERS) && (
            <SidebarItem
              className={`${location.pathname.startsWith(sideBarList[7].path) ? "text-[14px] text-white font-semibold" : "text-[14px] text-black dark:text-white/80 font-medium hover:text-[#495057] duration-200 ease-in"}`}
              classNameWrapper={`${location.pathname.startsWith(sideBarList[7].path) ? "flex items-center gap-2 cursor-pointer mb-2 rounded-3xl p-2 bg-[#3b82f6] shadow-3xl" : "flex items-center gap-2 cursor-pointer mb-2 rounded-sm p-2"} pl-4`}
              icon={React.createElement(sideBarList[7].icon, {
                color: location.pathname.startsWith(sideBarList[7].path) ? "white" : "black"
              })}
              nameSideBar={sideBarList[7].name}
              path={sideBarList[7].path}
            />
          )}
          {hasPermission(permissions.VIEW_SUPPLIES) && (
            <SidebarItem
              className={`${location.pathname.startsWith(sideBarList[8].path) ? "text-[14px] text-white font-semibold" : "text-[14px] text-black dark:text-white/80 font-medium hover:text-[#495057] duration-200 ease-in"}`}
              classNameWrapper={`${location.pathname.startsWith(sideBarList[8].path) ? "flex items-center gap-2 cursor-pointer mb-2 rounded-3xl p-2 bg-[#3b82f6] shadow-3xl" : "flex items-center gap-2 cursor-pointer mb-2 rounded-sm p-2"} pl-4`}
              icon={React.createElement(sideBarList[8].icon, {
                color: location.pathname.startsWith(sideBarList[8].path) ? "white" : "black"
              })}
              nameSideBar={sideBarList[8].name}
              path={sideBarList[8].path}
            />
          )}
          {hasPermission(permissions.VIEW_ROLES) && (
            <SidebarItem
              className={`${location.pathname.startsWith(sideBarList[9].path) ? "text-[14px] text-white font-semibold" : "text-[14px] text-black dark:text-white/80 font-medium hover:text-[#495057] duration-200 ease-in"}`}
              classNameWrapper={`${location.pathname.startsWith(sideBarList[9].path) ? "flex items-center gap-2 cursor-pointer mb-2 rounded-3xl p-2 bg-[#3b82f6] shadow-3xl" : "flex items-center gap-2 cursor-pointer mb-2 rounded-sm p-2"} pl-4`}
              icon={React.createElement(sideBarList[9].icon, {
                color: location.pathname.startsWith(sideBarList[9].path) ? "white" : "black"
              })}
              nameSideBar={sideBarList[9].name}
              path={sideBarList[9].path}
            />
          )}
          {hasPermission(permissions.VIEW_REVENUE) && (
            <SidebarItem
              className={`${location.pathname.startsWith(sideBarList[10].path) ? "text-[14px] text-white font-semibold" : "text-[14px] text-black dark:text-white/80 font-medium hover:text-[#495057] duration-200 ease-in"}`}
              classNameWrapper={`${location.pathname.startsWith(sideBarList[10].path) ? "flex items-center gap-2 cursor-pointer mb-2 rounded-3xl p-2 bg-[#3b82f6] shadow-3xl" : "flex items-center gap-2 cursor-pointer mb-2 rounded-sm p-2"} pl-4`}
              icon={React.createElement(sideBarList[10].icon, {
                color: location.pathname.startsWith(sideBarList[10].path) ? "white" : "black"
              })}
              nameSideBar={sideBarList[10].name}
              path={sideBarList[10].path}
            />
          )}
        </div>
      </div>
    </div>
  )
}
