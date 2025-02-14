import {
  Banknote,
  BookOpenCheck,
  ClipboardCopy,
  House,
  IdCard,
  LayoutDashboard,
  PackageSearch,
  User,
  Users
} from "lucide-react"
import logo from "src/Assets/img/logo_techzone_black.png"
import SidebarItem from "../SidebarItem/SidebarItem"
import { path } from "src/Constants/path"

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
  }
]

export default function Sidebar() {
  return (
    <div className="sticky top-0 left-0 p-4 bg-white h-screen border-r border-[#dedede]">
      <div>
        <img src={logo} alt="logo" className="w-[75%] mx-auto" />

        <div className="mt-8 pl-2">
          {sideBarList.map((item, index) => (
            <div key={index}>
              <SidebarItem icon={item.icon} nameSideBar={item.name} path={item.path} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
