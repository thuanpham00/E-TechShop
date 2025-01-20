import Http from "src/Helpers/http"
import { AuthResponse, MessageResponse } from "src/Types/utils.type"

export const URL_Login = "/users/login"
export const URL_Logout = "/users/logout"
export const URL_RefreshToken = "/users/refresh-token"

export const userAPI = {
  loginUser: (body: { email: string; password: string }) => {
    return Http.post<AuthResponse>(URL_Login, body)
  },
  logoutUser: () => {
    return Http.post<MessageResponse>(URL_Logout)
  }
}
