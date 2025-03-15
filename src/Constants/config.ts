const { VITE_API_SERVER } = import.meta.env

export const config = {
  baseURLClient: VITE_API_SERVER,
  maxSizeUploadImage: 1048576 // 1mb = 1.048.576 byte
}

export const apiPath = {
  URL_Register: "/users/register",
  URL_Login: "/users/login",
  URL_Logout: "/users/logout",
  URL_GetMe: "/users/me",
  URL_RefreshToken: "/users/refresh-token",
  URL_VerifyEmail: "/users/verify-email",
  URL_ForgotPassword: "/users/forgot-password",
  URL_VerifyForgotPasswordToken: "/users/verify-forgot-password",
  URL_ResetPassword: "/users/reset-password"
}
