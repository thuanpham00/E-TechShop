import logo from "src/Assets/img/logo_techzone_black.png"
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
import { SidebarItem } from "./SidebarItem"

const sideBarList = [
  {
    name: "Thống kê",
    icon: <LayoutDashboard color="black" />,
    path: path.AdminDashboard
  },
  {
    name: "Quản lý Khách hàng",
    icon: <User color="black" />,
    path: path.AdminCustomers
  },
  {
    name: "Quản lý Nhân viên",
    icon: <Users color="black" />,
    path: path.AdminEmployees
  },
  {
    name: "Quản lý Danh mục",
    icon: <BookOpenCheck color="black" />,
    path: path.AdminCategories
  },
  {
    name: "Quản lý Sản phẩm",
    icon: <PackageSearch color="black" />,
    path: path.AdminProducts
  },
  {
    name: "Quản lý Đơn hàng",
    icon: <Banknote color="black" />,
    path: path.AdminOrders
  },
  {
    name: "Quản lý Đơn nhập hàng",
    icon: <ClipboardCopy color="black" />,
    path: path.AdminReceipts
  },
  {
    name: "Quản lý Nguồn hàng",
    icon: <PackageSearch color="black" />,
    path: path.AdminSupplies
  },
  {
    name: "Quản lý Nhà cung cấp",
    icon: <House color="black" />,
    path: path.AdminSuppliers
  },
  {
    name: "Quản lý Vai trò",
    icon: <IdCard color="black" />,
    path: path.AdminRole
  },
  {
    name: "Quản lý Doanh thu",
    icon: <CircleDollarSign color="black" />,
    path: path.AdminRole
  }
]
export function Sidebar() {
  const location = useLocation()
  return (
    <div className="sticky top-0 left-0 p-4 bg-white h-screen border-r border-[#dedede]">
      <div>
        <img src={logo} alt="logo" className="w-[75%] mx-auto" />

        <div className="mt-8 pl-2">
          {sideBarList.map((item, index) => (
            <div key={index}>
              <SidebarItem
                className={`${location.pathname.startsWith(item.path) ? "text-[14px] text-[#df0019] font-semibold" : "text-[14px] text-black font-medium hover:text-[#495057] duration-200 ease-in"}`}
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
