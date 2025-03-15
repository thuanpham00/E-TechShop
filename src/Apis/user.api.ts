import { apiPath } from "src/Constants/config"
import Http from "src/Helpers/http"
import { AuthResponse, MessageResponse } from "src/Types/utils.type"

export const userAPI = {
  registerUser: (body: { email: string; password: string; confirm_password: string; name: string }) => {
    return Http.post<AuthResponse>(apiPath.URL_Register, body)
  },
  loginUser: (body: { email: string; password: string }) => {
    return Http.post<AuthResponse>(apiPath.URL_Login, body)
  },
  logoutUser: () => {
    return Http.post<MessageResponse>(apiPath.URL_Logout)
  },
  getMe: () => {
    return Http.get<AuthResponse>(apiPath.URL_GetMe)
  },
  verifyEmail: (email_verify_token: string) => {
    return Http.post(apiPath.URL_VerifyEmail, { email_verify_token })
  },
  forgotPassword: (email: string) => {
    return Http.post(apiPath.URL_ForgotPassword, { email })
  },
  verifyForgotPasswordToken: (forgot_password_token: string) => {
    return Http.post(apiPath.URL_VerifyForgotPasswordToken, { forgot_password_token })
  },
  resetPassword: (forgot_password_token: string, password: string, confirm_password: string) => {
    return Http.post(apiPath.URL_ResetPassword, {
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
