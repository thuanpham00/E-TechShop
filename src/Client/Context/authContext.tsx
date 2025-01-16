import { createContext, useState } from "react"
import { getAccessTokenFromLS, getNameUserFromLS } from "../Utils/auth"

type Props = {
  children: React.ReactNode
}

type TypeInitialState = {
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  nameUser: string
  setNameUser: React.Dispatch<React.SetStateAction<string>>
}

const initialStateContext: TypeInitialState = {
  isAuthenticated: Boolean(getAccessTokenFromLS()),
  setIsAuthenticated: () => null,
  nameUser: getNameUserFromLS(),
  setNameUser: () => null
}

export const AppContext = createContext<TypeInitialState>(initialStateContext)

export default function AppClientProvider({ children }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialStateContext.isAuthenticated)
  const [nameUser, setNameUser] = useState<string>(initialStateContext.nameUser)

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        nameUser,
        setNameUser
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
