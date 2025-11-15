import { useCallback, useEffect, useState } from "react"
import socket from "src/socket"

export default function useCheckConnectSocket() {
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(Boolean(socket?.connected))

  useEffect(() => {
    const onConnect = () => setIsSocketConnected(true)
    const onDisconnect = () => setIsSocketConnected(false)

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)

    // cleanup
    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
    }
  }, [])

  const retryConnect = useCallback(() => {
    try {
      if (socket && typeof socket.connect === "function") {
        socket.connect()
        // nếu sau 1.5s vẫn chưa connect thì reload trang để đảm bảo tái tạo socket/auth
        setTimeout(() => {
          if (!socket.connected) {
            window.location.reload()
          }
        }, 1500)
      } else {
        window.location.reload()
      }
    } catch {
      window.location.reload()
    }
  }, [])

  return { isSocketConnected, retryConnect }
}
