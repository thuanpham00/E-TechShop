export type queryParamConfig = {
  page?: string
  limit?: string
}

export type queryParamConfigCustomer = queryParamConfig & {
  email?: string
  name?: string
  phone?: string
}
