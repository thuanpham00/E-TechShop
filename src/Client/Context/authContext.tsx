import { createContext, useState } from "react"
import { getAccessTokenFromLS, getNameUserFromLS } from "../../Helpers/auth"

type Props = {
  children: React.ReactNode
}

type TypeInitialState = {
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  nameUser: string | null
  setNameUser: React.Dispatch<React.SetStateAction<string | null>>
  isShowCategory: boolean
  setIsShowCategory: React.Dispatch<React.SetStateAction<boolean>>
}

// giá trị khởi tạo cho state global
const initialStateContext: TypeInitialState = {
  isAuthenticated: Boolean(getAccessTokenFromLS()),
  setIsAuthenticated: () => null,
  nameUser: getNameUserFromLS(),
  setNameUser: () => null,
  isShowCategory: false,
  setIsShowCategory: () => null
}

export const AppContext = createContext<TypeInitialState>(initialStateContext)

export default function AppClientProvider({ children }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialStateContext.isAuthenticated)
  const [nameUser, setNameUser] = useState<string | null>(initialStateContext.nameUser)
  const [isShowCategory, setIsShowCategory] = useState<boolean>(initialStateContext.isShowCategory)
  /**
   * Các biến trong context (như isAuthenticated, nameUser, isShowCategory, ...) phải khớp với các biến state trong AppClientProvider để đảm bảo rằng chúng phản ánh đúng dữ liệu toàn cục được quản lý bởi context.
   * Việc các biến trong context đặt tên giống state là giúp quản lý trạng thái dữ liệu toàn cục và khi các biến trong context thay đổi đồng thời state thay đổi dẫn đến các component con sử dụng context đó sẽ re-render lại do state
   */
  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        nameUser,
        setNameUser,
        isShowCategory,
        setIsShowCategory
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
