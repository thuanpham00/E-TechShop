import { Tabs, TabsProps } from "antd"
import { Helmet } from "react-helmet-async"
import "../../../Client/Pages/User/Pages/Profile/Profile.css"
import { motion } from "framer-motion"
import ChangePassword from "src/Client/Pages/User/Pages/ChangePassword"
import Profile from "src/Client/Pages/User/Pages/Profile"

export default function AdminProfile() {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Thông tin tài khoản",
      children: <Profile />
    },
    {
      key: "2",
      label: "Thay đổi mật khẩu",
      children: <ChangePassword />
    }
  ]

  return (
    <div>
      <Helmet>
        <title>Hồ sơ của tôi - TechZone</title>
        <meta
          name="description"
          content="Xem và chỉnh sửa thông tin tài khoản, cập nhật mật khẩu để bảo mật tài khoản của bạn tại TechZone."
        />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 mt-2">
        <Tabs defaultActiveKey="1" items={items} />
      </motion.div>
    </div>
  )
}
