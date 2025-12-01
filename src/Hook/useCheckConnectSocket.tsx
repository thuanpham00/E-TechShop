import { useContext, useEffect, useState } from "react"
import { AppContext } from "src/Context/authContext"

export default function useCheckConnectSocket() {
  const { socket } = useContext(AppContext)
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(Boolean(socket?.connected))

  useEffect(() => {
    if (!socket) return

    const handleConnect = () => setIsSocketConnected(true)
    const handleDisconnect = () => {
      setIsSocketConnected(false)
      // Tự động thử kết nối lại sau 2 giây
      setTimeout(() => {
        if (!socket.connected) socket.connect()
      }, 2000)
    }

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)

    setIsSocketConnected(socket.connected)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
    }
  }, [socket])

  return { isSocketConnected }
}
