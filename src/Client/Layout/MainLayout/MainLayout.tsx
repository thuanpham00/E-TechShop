import { Outlet } from "react-router-dom"
import Footer from "src/Client/Components/Footer"
import Header from "src/Client/Components/Header"

export default function MainLayout() {
  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}
