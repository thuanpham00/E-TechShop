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

  sortBy?: string
}

export type queryParamConfigCategory = queryParamConfig & {
  name?: string
  sortBy?: string
}

export type queryParamConfigBrand = queryParamConfig & {
  name?: string
  id?: string
  sortBy?: string
}

export type queryParamConfigSupplier = queryParamConfig & {
  name?: string
  email?: string
  phone?: string
  contactName?: string

  sortBy?: string
}

export type queryParamConfigSupply = queryParamConfig & {
  name_product?: string
  name_supplier?: string

  sortBy?: string
}

export type queryParamConfigReceipt = queryParamConfig & {
  name_product?: string
  name_supplier?: string
  quantity?: string
  price_min?: string
  price_max?: string
  import_date_start?: string
  import_date_end?: string

  sortBy?: string
}

export type queryParamConfigOrder = queryParamConfig & {
  name?: string
  address?: string
  phone?: string
  status?: string
  price_min?: string
  price_max?: string

  sortBy?: string
}

export type queryParamConfigProduct = queryParamConfig & {
  name?: string
  category?: string
  brand?: string
  price_min?: string
  price_max?: string
  status?: string

  sortBy?: string
}

export type queryParamsPricePerUnit = {
  name_product: string
  name_supplier: string
}

export type queryParamConfigEmail = {
  page?: string
  limit?: string
}
