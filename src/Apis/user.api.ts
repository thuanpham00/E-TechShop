import Http from "src/Helpers/http"
import { AuthResponse, MessageResponse } from "src/Types/utils.type"

export const URL_Register = "/users/register"
export const URL_Login = "/users/login"
export const URL_Logout = "/users/logout"
export const URL_GetMe = "/users/me"
export const URL_RefreshToken = "/users/refresh-token"
export const URL_VerifyEmail = "/users/verify-email"

export const userAPI = {
  registerUser: (body: { email: string; password: string; confirm_password: string; name: string }) => {
    return Http.post<AuthResponse>(URL_Register, body)
  },
  loginUser: (body: { email: string; password: string }) => {
    return Http.post<AuthResponse>(URL_Login, body)
  },
  logoutUser: () => {
    return Http.post<MessageResponse>(URL_Logout)
  },
  getMe: () => {
    return Http.get<AuthResponse>(URL_GetMe)
  },
  verifyEmail: (email_verify_token: string) => {
    return Http.post(URL_VerifyEmail, { email_verify_token })
  }
}
