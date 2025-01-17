import axios, { AxiosInstance } from "axios"
import { URL_Login } from "src/Client/Apis/user.api"
import { getAccessTokenFromLS, setAccessTokenToLS, setNameUserToLS } from "src/Client/Utils/auth"
import { config } from "src/Constants/config"
import { AuthResponse } from "src/Types/utils.type"

class http {
  instance: AxiosInstance
  private accessToken: string
  constructor() {
    this.accessToken = getAccessTokenFromLS()
    this.instance = axios.create({
      baseURL: config.baseURLClient, // kết nối tới server
      timeout: 10000, // thời gian chờ server
      headers: {
        "Content-Type": "application/json" // yc server trả về json
      }
    })
    // interceptors : trung gian khi client gửi lên server và server gửi kết quả về client đều đi qua nó
    // sau khi login xong thì server gửi về access_token
    this.instance.interceptors.request.use(
      (config) => {
        if (config.headers && this.accessToken) {
          config.headers.authorization = `Bearer ${this.accessToken}`
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
        }
        return response
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }
}

const Http = new http().instance
export default Http
