export type queryParamConfig = {
  page?: string
  limit?: string
}

export type queryParamConfigCustomer = queryParamConfig & {
  email?: string
  name?: string
  phone?: string
}

export type queryParamConfigCategory = queryParamConfig & {
  name?: string
}

export type queryParamConfigBrand = queryParamConfig & {
  name?: string
  id?: string
}

export type queryParamConfigProduct = queryParamConfig & {
  name_product?: string
  category_product?: string
  brand_product?: string
}
