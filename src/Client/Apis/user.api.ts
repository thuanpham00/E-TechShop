import Http from "src/Helpers/http"
import { AuthResponse } from "src/Types/utils.type"

export const URL_Login = "/users/login"

export const userAPI = {
  loginUser: (body: { email: string; password: string }) => {
    return Http.post<AuthResponse>(URL_Login, body, {
      withCredentials: true // cho phép gửi cookie tử server lên client
    })
  }
}
