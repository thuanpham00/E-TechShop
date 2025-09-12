/* eslint-disable @typescript-eslint/no-explicit-any */
import { Menu } from "lucide-react"
import avatarDefault from "src/Assets/img/avatarDefault.png"
import { useContext } from "react"
import { AppContext } from "src/Context/authContext"
import ModeToggle from "../Mode-Toggle"
import { useTheme } from "../Theme-provider/Theme-provider"
import { Tag } from "antd"

interface Props {
  handleSidebar: (boolean: boolean) => void
  isShowSidebar: boolean
}

export default function HeaderAdmin({ handleSidebar, isShowSidebar }: Props) {
  const { theme } = useTheme() // Lấy theme hiện tại
  const iconColor = theme === "dark" || theme === "system" ? "white" : "black" // Xác định màu icon
  const { avatar, nameUser, role } = useContext(AppContext)

  const handleSideBarFunc = () => {
    handleSidebar(!isShowSidebar)
  }

  const renderRoleTag = () => {
    switch (role) {
      case "ADMIN":
        return <Tag color="red">ADMIN</Tag>
      case "SALES_STAFF":
        return <Tag color="blue">SALES STAFF</Tag>
      case "INVENTORY_STAFF":
        return <Tag color="green">INVENTORY STAFF</Tag>
      default:
        return <Tag>{role}</Tag>
    }
  }

  return (
    <header className="sticky top-0 left-0 z-10 bg-white dark:bg-darkPrimary flex items-center justify-between p-3 border-b border-gray-200 dark:border-darkBorder">
      <Menu color={iconColor} size={28} onClick={handleSideBarFunc} />
      <div className="flex items-center gap-2">
        <ModeToggle />
        <div className="flex items-center gap-1 text-black font-semibold duration-200 transition ease-linear cursor-pointer">
          <img src={avatar || avatarDefault} className="h-8 w-8" alt="avatar default" />
          <div>
            <span className="text-xs dark:text-white">{renderRoleTag()}</span>
            <span className="block text-[13px] truncate w-32 dark:text-white">{nameUser}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
