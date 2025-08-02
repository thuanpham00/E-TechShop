import { createContext, useState } from "react"
import {
  getAccessTokenFromLS,
  getAvatarImageFromLS,
  getNameUserFromLS,
  getRoleFromLS,
  getUserIdFromLS
} from "src/Helpers/auth"

type Props = {
  children: React.ReactNode
}

type TypeInitialState = {
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  nameUser: string | null
  setNameUser: React.Dispatch<React.SetStateAction<string | null>>
  role: string | null
  setRole: React.Dispatch<React.SetStateAction<string | null>>
  avatar: string | null
  setAvatar: React.Dispatch<React.SetStateAction<string | null>>
  userId: string | null
  setUserId: React.Dispatch<React.SetStateAction<string | null>>
  isShowCategory: boolean
  setIsShowCategory: React.Dispatch<React.SetStateAction<boolean>>
  reset: () => void
}

// giá trị khởi tạo cho state global
const initialStateContext: TypeInitialState = {
  isAuthenticated: Boolean(getAccessTokenFromLS()),
  setIsAuthenticated: () => null,
  nameUser: getNameUserFromLS(),
  setNameUser: () => null,
  role: getRoleFromLS(),
  setRole: () => null,
  avatar: getAvatarImageFromLS(),
  setAvatar: () => null,
  userId: getUserIdFromLS(),
  setUserId: () => null,
  isShowCategory: false,
  setIsShowCategory: () => null,
  reset: () => null
}

export const AppContext = createContext<TypeInitialState>(initialStateContext)

export default function AppClientProvider({ children }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialStateContext.isAuthenticated)
  const [nameUser, setNameUser] = useState<string | null>(initialStateContext.nameUser)
  const [isShowCategory, setIsShowCategory] = useState<boolean>(initialStateContext.isShowCategory)
  const [role, setRole] = useState<string | null>(initialStateContext.role)
  const [avatar, setAvatar] = useState<string | null>(initialStateContext.avatar)
  const [userId, setUserId] = useState<string | null>(initialStateContext.userId)

  // nếu ko dùng state thì nó ko set lại giá trị context được vì ở đây tôi () => null đúng ko . 
  // nên dùng state để nó có thể trigger set lại giá trị đúng ko
  /**
   * Các biến trong context (như isAuthenticated, nameUser, isShowCategory, ...) phải khớp với các biến state trong AppClientProvider để đảm bảo rằng chúng phản ánh đúng dữ liệu toàn cục được quản lý bởi context.
   * Việc các biến trong context đặt tên giống state là giúp quản lý trạng thái dữ liệu toàn cục và khi các biến trong context thay đổi đồng thời state thay đổi dẫn đến các component con sử dụng context đó sẽ re-render lại do state
   */

  const reset = () => {
    setIsAuthenticated(false)
    setNameUser(null)
    setRole(null)
    setAvatar(null)
    setUserId(null)
  }

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        nameUser,
        setNameUser,
        isShowCategory,
        setIsShowCategory,
        reset,
        role,
        setRole,
        avatar,
        setAvatar,
        userId,
        setUserId
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
