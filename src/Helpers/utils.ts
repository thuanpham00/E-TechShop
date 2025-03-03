import axios, { AxiosError } from "axios"
import { HttpStatusCode } from "src/Constants/httpStatus"
import { MessageResponse } from "src/Types/utils.type"

// Kiểm tra xem lỗi (error) có phải là lỗi Axios (AxiosError) hay không.
export function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  // eslint-disable-next-line import/no-named-as-default-member
  return axios.isAxiosError<T>(error)
}

export function isError422<FormError>(error: unknown): error is AxiosError<FormError> {
  return isAxiosError(error) && error.response?.status === HttpStatusCode.UnprocessableEntity
}

export function isError401<FormError>(error: unknown): error is AxiosError<FormError> {
  return isAxiosError(error) && error.response?.status === HttpStatusCode.Unauthorized
}

export function isError400<FormError>(error: unknown): error is AxiosError<FormError> {
  return isAxiosError(error) && error.response?.status === HttpStatusCode.BadRequest
}

export function isError404<FormError>(error: unknown): error is AxiosError<FormError> {
  return isAxiosError(error) && error.response?.status === HttpStatusCode.NotFound
}

export function isAxiosExpiredTokenError<FormError>(error: unknown, message: string): error is AxiosError<FormError> {
  return isError401<MessageResponse>(error) && error.response?.data.message === message
}
