import { useLocation } from "react-router-dom"
import {
  Banknote,
  BookOpenCheck,
  CircleDollarSign,
  ClipboardCopy,
  House,
  IdCard,
  LayoutDashboard,
  PackageSearch,
  User,
  Users
} from "lucide-react"
import { path } from "src/Constants/path"
import SidebarItem from "../SidebarItem"
import { useTheme } from "../Theme-provider/Theme-provider"

export default function Sidebar() {
  const location = useLocation()
  const { theme } = useTheme() // Lấy theme hiện tại
  const iconColor = theme === "dark" || theme === "system" ? "gray" : "black" // Xác định màu icon

  const sideBarList = [
    { name: "Thống kê", icon: <LayoutDashboard color={iconColor} />, path: path.AdminDashboard },
    { name: "Quản lý Khách hàng", icon: <User color={iconColor} />, path: path.AdminCustomers },
    { name: "Quản lý Nhân viên", icon: <Users color={iconColor} />, path: path.AdminEmployees },
    { name: "Quản lý Danh mục", icon: <BookOpenCheck color={iconColor} />, path: path.AdminCategories },
    { name: "Quản lý Sản phẩm", icon: <PackageSearch color={iconColor} />, path: path.AdminProducts },
    { name: "Quản lý Đơn hàng", icon: <Banknote color={iconColor} />, path: path.AdminOrders },
    { name: "Quản lý Đơn nhập hàng", icon: <ClipboardCopy color={iconColor} />, path: path.AdminReceipts },
    { name: "Quản lý Nguồn hàng", icon: <PackageSearch color={iconColor} />, path: path.AdminSupplies },
    { name: "Quản lý Nhà cung cấp", icon: <House color={iconColor} />, path: path.AdminSuppliers },
    { name: "Quản lý Vai trò", icon: <IdCard color={iconColor} />, path: path.AdminRole },
    { name: "Quản lý Doanh thu", icon: <CircleDollarSign color={iconColor} />, path: path.AdminRole }
  ]

  return (
    <div className="sticky top-0 left-0 p-4 bg-white dark:bg-darkPrimary h-screen border-r border-[#dedede] dark:border-darkBorder">
      <div>
        <div className="text-center">
          <span className="text-darkPrimary dark:text-white text-2xl font-semibold text-center border-b-[3px] border-darkPrimary dark:border-white">
            TechZone
          </span>
        </div>
        <div className="mt-4">
          {sideBarList.map((item, index) => (
            <div key={index}>
              <SidebarItem
                className={`${location.pathname.startsWith(item.path) ? "text-[14px] text-[#df0019] font-semibold" : "text-[14px] text-black dark:text-white/80 font-medium hover:text-[#495057] duration-200 ease-in"}`}
                classNameWrapper={`${location.pathname.startsWith(item.path) ? "flex items-center gap-2 cursor-pointer mb-2 rounded-sm p-2 bg-red-100" : "flex items-center gap-2 cursor-pointer mb-2 rounded-sm p-2"}`}
                icon={item.icon}
                nameSideBar={item.name}
                path={item.path}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
