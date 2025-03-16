import Http from "src/Helpers/http"
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

  getMe: () => {
    return Http.get<AuthResponse>("users/me")
  },

  verifyEmail: (email_verify_token: string) => {
    return Http.post("/users/verify-email", { email_verify_token })
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
  // 1 cái changePassword
  // 1 cái resend-email-token
  // 1 cái updateUser
  // 1 cái refreshToken (có rồi)
}
