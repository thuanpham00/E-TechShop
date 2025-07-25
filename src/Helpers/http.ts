import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios"
import {
  clearLS,
  getAccessTokenFromLS,
  setAccessTokenToLS,
  setAvatarImageToLS,
  setNameUserToLS,
  setRoleToLS,
  setUserIdToLS
} from "src/Helpers/auth"
import { config } from "src/Constants/config"
import { AuthResponse, MessageResponse, SuccessResponse } from "src/Types/utils.type"
import { isAxiosExpiredTokenError, isError401, isError404 } from "./utils"
import { toast } from "react-toastify"

class http {
  // khai báo các thuộc tính của class
  instance: AxiosInstance
  public accessToken: string
  private refreshTokenRequest: Promise<string> | null
  constructor() {
    this.accessToken = getAccessTokenFromLS()
    this.refreshTokenRequest = null
    this.instance = axios.create({
      baseURL: config.baseURLClient, // kết nối tới server
      timeout: 10000, // thời gian chờ server
      headers: {
        "Content-Type": "application/json" // yc server trả về json
      },
      withCredentials: true // cho phép gửi cookie từ client lên server
    })
    // interceptors : trung gian khi client gửi lên server và server gửi kết quả về client đều đi qua nó
    // sau khi login xong thì server gửi về access_token
    this.instance.interceptors.request.use(
      (config) => {
        if (config.headers && this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`
          // config > headers > Authorization
          return config
        }
        return config // nếu ko có AT thì không cần gửi lên server (tùy api)
      },
      (error) => {
        return Promise.reject(error)
      }
    )
    this.instance.interceptors.response.use(
      (response) => {
        if (response.config.url === "users/login") {
          const data = response.data as AuthResponse
          this.accessToken = data.result.accessToken
          setAccessTokenToLS(this.accessToken)
          setNameUserToLS(data.result.userInfo.name)
          setRoleToLS(data.result.userInfo.role)
          setAvatarImageToLS(data.result.userInfo.avatar)
          setUserIdToLS(data.result.userInfo._id)
          // ở server sẽ tự động lưu RT vào cookie ở trình duyệt
        }
        if (response.config.url === "users/logout") {
          clearLS()
          this.accessToken = ""
          // ở server sẽ tự động xóa cookie đã lưu trên trình duyệt
        }
        return response
      },
      (error) => {
        if (isError404<MessageResponse>(error)) {
          //
        }
        if (isError401(error)) {
          const config = error.response?.config || ({ headers: {} } as InternalAxiosRequestConfig)
          const { url } = config
          // lỗi Unauthorized (401) có nhiều trường hợp
          // - token không đúng
          // - không truyền token
          // - token hết hạn*

          // nếu là lỗi accessToken hết hạn thì tạo mới accessToken
          if (
            isAxiosExpiredTokenError<MessageResponse>(error, "AccessToken expired") &&
            url !== "/users/refresh-token"
          ) {
            this.refreshTokenRequest = this.refreshTokenRequest ? this.refreshTokenRequest : this.handleRefreshToken()

            // nếu không return ở đây nó sẽ chạy xuống bên dưới
            return this.refreshTokenRequest.then((accessToken) => {
              if (error.response?.config.headers) {
                return this.instance({
                  ...config,
                  headers: { ...config.headers, Authorization: `Bearer ${accessToken}` } // gửi lại lên server accessToken mới
                })
              }
            })
          }

          if (isAxiosExpiredTokenError<MessageResponse>(error, "RefreshToken expired")) {
            // nếu refresh-token hết hạn thì nó clearLS
            this.accessToken = ""
            clearLS()
            toast.error("Phiên làm việc hết hạn", { autoClose: 1500 })
          }
        }
        return Promise.reject(error)
      }
    )
  }

  private handleRefreshToken() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.instance
      .post<SuccessResponse<{ accessToken: string }>>("/users/refresh-token")
      .then((res) => {
        const { accessToken } = res.data.result
        this.accessToken = accessToken
        this.refreshTokenRequest = null
        setAccessTokenToLS(accessToken)
        return accessToken
      })
      .catch((err) => {
        clearLS()
        this.accessToken = ""
        this.refreshTokenRequest = null
        throw err
      })
  }
}

/**
 * nếu ko set lại refreshTokenRequest = null thì khi lần sau token hết hạn thì gọi lại promise cũ và promise cũ có token đã hết hạn dẫn đến nó gọi server check Token đó (hết hạn) và lỗi => dẫn đến liên tục gửi request đến server
 */

export const httpRaw = new http()

const Http = new http().instance
export default Http
