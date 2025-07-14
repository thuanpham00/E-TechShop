import Http from "src/Helpers/http"
import { UpdateBodyReq } from "src/Types/product.type"
import { UserType } from "src/Types/user.type"
import { AuthResponse, MessageResponse } from "src/Types/utils.type"

export const userAPI = {
  registerUser: (body: { email: string; password: string; confirm_password: string; name: string; phone: string }) => {
    return Http.post<AuthResponse>("/users/register", body)
  },

  loginUser: (body: { email: string; password: string }) => {
    return Http.post<AuthResponse>("users/login", body)
  },

  logoutUser: () => {
    return Http.post<MessageResponse>("users/logout")
  },

  getMe: (signal: AbortSignal) => {
    return Http.get<{ result: UserType }>("users/me", { signal })
  },

  updateMe: (body: UpdateBodyReq) => {
    return Http.patch("/users/me", body)
  },

  verifyEmail: (email_verify_token: string) => {
    return Http.post("/users/verify-email", { email_verify_token })
  },

  changePassword: (body: { old_password: string; password: string; confirm_password: string }) => {
    return Http.post("/users/change-password", body)
  },

  forgotPassword: (email: string) => {
    return Http.post("/users/forgot-password", { email })
  },

  verifyForgotPasswordToken: (forgot_password_token: string) => {
    return Http.post("/users/verify-forgot-password", { forgot_password_token })
  },

  resetPassword: (forgot_password_token: string, password: string, confirm_password: string) => {
    return Http.post("/users/reset-password", {
      forgot_password_token,
      password,
      confirm_password
    })
  }

  // 1 cái loginOauth (có rồi)
  // 1 cái refreshToken (có rồi)
  // 1 cái changePassword
  // 1 cái resend-email-token
  // 1 cái updateUser
}
