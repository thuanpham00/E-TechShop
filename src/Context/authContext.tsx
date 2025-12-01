/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useState } from "react"
import {
  getAccessTokenFromLS,
  getAvatarImageFromLS,
  getNameUserFromLS,
  getRoleFromLS,
  getUserIdFromLS
} from "src/Helpers/auth"
import { CollectionItemType } from "src/Types/product.type"
import type { Socket } from "socket.io-client"

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
  reset: () => void

  recentlyViewed: CollectionItemType[]
  setRecentlyViewed: React.Dispatch<React.SetStateAction<any[]>>

  socket: Socket | null
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>
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
  reset: () => null,

  recentlyViewed: [],
  setRecentlyViewed: () => null,

  socket: null,
  setSocket: () => null
}

export const AppContext = createContext<TypeInitialState>(initialStateContext)

export default function AppClientProvider({ children }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialStateContext.isAuthenticated)
  const [nameUser, setNameUser] = useState<string | null>(initialStateContext.nameUser)
  const [role, setRole] = useState<string | null>(initialStateContext.role)
  const [avatar, setAvatar] = useState<string | null>(initialStateContext.avatar)
  const [userId, setUserId] = useState<string | null>(initialStateContext.userId)

  const [recentlyViewed, setRecentlyViewed] = useState<CollectionItemType[]>([])
  const [socket, setSocket] = useState<Socket | null>(initialStateContext.socket)

  /**
   * Các biến trong context (như isAuthenticated, nameUser, isShowCategory, ...) phải khớp với các biến state trong AppClientProvider để đảm bảo rằng chúng phản ánh đúng dữ liệu toàn cục được quản lý bởi context.
   * Việc các biến trong context đặt tên giống state là giúp quản lý trạng thái dữ liệu toàn cục và khi các biến trong context thay đổi đồng thời state thay đổi dẫn đến các component con sử dụng context đó sẽ re-render lại do state
   */
  /**
   * truyền giá trị tĩnh context vào state và sau đó mượn hàm set state này trigger set lại giá trị đồng thời giá trị set (state) khớp với context nên nó re-render lại các component đang sử dụng đúng ko
   *
   * Bạn truyền giá trị khởi tạo (static) vào state → sau đó dùng state + setState để biến context thành nguồn dữ liệu động. Khi state thay đổi, context thay đổi, và toàn bộ component dùng context sẽ re-render theo. ✅
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
        reset,
        role,
        setRole,
        avatar,
        setAvatar,
        userId,
        setUserId,
        recentlyViewed,
        setRecentlyViewed,
        socket,
        setSocket
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
