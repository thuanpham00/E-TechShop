import axios, { AxiosError } from "axios"
import { HttpStatusCode } from "src/Constants/http"

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
