import { io } from "socket.io-client"

const socket = io(import.meta.env.VITE_API_SERVER, {
  auth: {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`
  }
}) // nó tự kết nối tới server socket (ko cần dùng connect())
export default socket
