import { User } from "./user.type"

export type SuccessResponse<Data> = {
  message: string
  result: Data
}

export type ErrorResponse<Data> = {
  message: string
  errors?: Data
}

export type MessageResponse = {
  message: string
}

export type AuthResponse = SuccessResponse<{
  accessToken: string
  refreshToken: string
  userInfo: User
}>
