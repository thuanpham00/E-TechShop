export type queryParamConfig = {
  page?: string
  limit?: string
  created_at_start?: string
  created_at_end?: string
  updated_at_start?: string
  updated_at_end?: string
}

export type queryParamConfigCustomer = queryParamConfig & {
  email?: string
  name?: string
  phone?: string
  verify?: string
}

export type queryParamConfigCategory = queryParamConfig & {
  name?: string
}

export type queryParamConfigBrand = queryParamConfig & {
  name?: string
  id?: string
}

export type queryParamConfigProduct = queryParamConfig & {
  name?: string
  category?: string
  brand?: string
  price_min?: string
  price_max?: string
  status?: string
}
