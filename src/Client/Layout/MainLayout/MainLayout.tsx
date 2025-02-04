import { Outlet } from "react-router-dom"
import Footer from "src/Client/Components/Footer"
import Header from "src/Client/Components/Header"
import MenuCategory from "src/Client/Components/MenuCategory"

export default function MainLayout() {
  return (
    <div>
      <Header />
      <MenuCategory />
      <Outlet />
      <Footer />
    </div>
  )
}
