import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { path } from "src/Constants/path"
import { setAccessTokenToLS, setNameUserToLS, setRoleToLS } from "src/Helpers/auth"
import useQueryParams from "src/Hook/useQueryParams"
import { httpRaw } from "src/Helpers/http"
import { AppContext } from "src/Context/authContext"

export default function LoginGoogle() {
  const { access_token, name } = useQueryParams()
  const { setIsAuthenticated, setNameUser, setRole } = useContext(AppContext)
  const navigate = useNavigate()
  // component re-render khi và chỉ khi state hoặc props thay đổi thì re-render
  useEffect(() => {
    setAccessTokenToLS(access_token)
    setNameUserToLS(name)
    setRoleToLS("User")
    // nếu không set state tại đây thì nó chỉ set LS và không re-render app
    // -> dẫn đến UI không cập nhật (mới nhất sau khi login) -> cần set state
    // để app re-render lại và đặt giá trị mới cho state global
    // và giá trị khởi tạo cho state global (LS)
    setIsAuthenticated(true)
    setNameUser(name)
    setRole("User")
    navigate(path.Home)
    httpRaw.accessToken = access_token // để có token gửi đi
    window.location.reload()
  }, [access_token, name, navigate, setIsAuthenticated, setNameUser, setRole])

  return <div>LoginGoogle</div>
}
