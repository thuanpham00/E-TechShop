import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { path } from "src/Client/Constants/path"
import { AppContext } from "src/Client/Context/authContext"
import { setAccessTokenToLS, setNameUserToLS } from "src/Client/Utils/auth"
import useQueryParams from "src/Hook/useQueryParams"

export default function LoginGoogle() {
  const { access_token, name } = useQueryParams()
  const { setIsAuthenticated, setNameUser } = useContext(AppContext)
  const navigate = useNavigate()

  // component re-render khi và chỉ khi state hoặc props thay đổi thì re-render
  useEffect(() => {
    setAccessTokenToLS(access_token)
    setNameUserToLS(name)
    setIsAuthenticated(true)
    setNameUser(name)
    navigate(path.Home)
  }, [access_token, name, navigate, setIsAuthenticated, setNameUser])

  return <div>LoginGoogle</div>
}
