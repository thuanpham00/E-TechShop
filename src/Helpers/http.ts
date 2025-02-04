import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios"
import { URL_Login, URL_Logout, URL_RefreshToken } from "src/Client/Apis/user.api"
import { clearLS, getAccessTokenFromLS, setAccessTokenToLS, setNameUserToLS, setRoleToLS } from "src/Helpers/auth"
import { config } from "src/Constants/config"
import { AuthResponse, MessageResponse } from "src/Types/utils.type"
import { isAxiosExpiredTokenError, isError401, isError404 } from "./utils"
import { toast } from "react-toastify"

class http {
  instance: AxiosInstance
  public accessToken: string

  constructor() {
    this.accessToken = getAccessTokenFromLS()
    this.instance = axios.create({
      baseURL: config.baseURLClient, // kết nối tới server
      timeout: 10000, // thời gian chờ server
      headers: {
        "Content-Type": "application/json" // yc server trả về json
      },
      withCredentials: true // cho phép gửi cookie tử client lên server
    })
    // interceptors : trung gian khi client gửi lên server và server gửi kết quả về client đều đi qua nó
    // sau khi login xong thì server gửi về access_token
    this.instance.interceptors.request.use(
      (config) => {
        if (config.headers && this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`
          return config
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
    this.instance.interceptors.response.use(
      (response) => {
        if (response.config.url === URL_Login) {
          const data = response.data as AuthResponse
          this.accessToken = data.result.accessToken
          setAccessTokenToLS(this.accessToken)
          setNameUserToLS(data.result.userInfo.name)
          setRoleToLS(data.result.userInfo.role)
          // ở server sẽ tự động lưu RT vào cookie ở trình duyệt
        }
        if (response.config.url === URL_Logout) {
          clearLS()
          this.accessToken = ""
          // ở server sẽ tự động xóa cookie đã lưu trên trình duyệt
        }
        return response
      },
      (error) => {
        if (isError404<MessageResponse>(error)) {
          toast.error(error.response?.data.message)
          // toast.error(error.)
        }
        if (isError401(error)) {
          const config = error.response?.config || ({ headers: {} } as InternalAxiosRequestConfig)
          const { url } = config

          if (isAxiosExpiredTokenError<MessageResponse>(error) && url !== URL_RefreshToken) {
            this.accessToken = ""
            clearLS()
            toast.error("Phiên làm việc hết hạn", { autoClose: 1500 })
          }
          // chưa xử lý refresh token
        }
        return Promise.reject(error)
      }
    )
  }
}

export const httpRaw = new http()

const Http = new http().instance
export default Http
