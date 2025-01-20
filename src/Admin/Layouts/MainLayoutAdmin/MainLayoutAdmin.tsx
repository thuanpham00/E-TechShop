import { Outlet } from "react-router-dom"
import Header from "src/Client/Components/Header"

export default function MainLayoutAdmin() {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  )
}
