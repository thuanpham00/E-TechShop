export enum StatusProduct {
  "out_of_stock" = "out_of_stock",
  "discontinued" = "discontinued",
  "available" = "available"
}

export type CollectionItemType = {
  _id: string
  name: string
  averageRating: number
  discount: number
  price: number
  isFeatured: string
  medias: {
    url: string
    type: number
  }[]
  banner: {
    url: string
    type: number
  }
  sold: number
  specifications: never[]
  viewCount: number
  reviews: string[]
  category: string[]
  brand: string[]
}

export type CategoryItemType = {
  _id: string
  name: string
  created_at: string
  updated_at: string
  brand_ids: string[]
}

export type BrandItemType = {
  _id: string
  name: string
  category_id: string
  created_at: string
  updated_at: string
  category_ids: string[]
}

export type SupplierItemType = {
  _id: string
  name: string
  phone: string
  email: string
  contactName: string

  address?: string
  taxCode?: string
  description?: string
  created_at: string
  updated_at: string
}

export type ProductItemType = {
  _id: string
  name: string
  brand: {
    name: string
  }[]
  category: {
    name: string
  }[]
  created_at: string
  medias: {
    url: string
    type: number
  }[]
  banner: {
    url: string
    type: number
  }
  price: number
  status: StatusProduct
  updated_at: string
}

export type UpdateBodyReq = {
  name?: string
  date_of_birth?: Date
  numberPhone?: string
  avatar?: string
}

export type UpdateCategoryBodyReq = {
  name?: string
}

export type UpdateSupplierBodyReq = {
  name?: string
  contactName?: string
  email?: string
  phone?: string
  description?: string
  address?: string
}

export type ProductDetailType = {
  _id: string
  name: string
  averageRating: number
  brand: string
  category: string
  created_at: string
  description: string
  discount: number
  gifts: string[] // Dữ liệu cụ thể có thể được định nghĩa thêm nếu cần
  isFeatured: string
  medias: {
    url: string
    type: number
  }[]
  price: number
  reviews: string[] // Dữ liệu có thể thay đổi tùy thuộc vào yêu cầu
  sold: number
  specifications: {
    name: string
    value: string
  }[]
  stock: number
  updated_at: string
  viewCount: number
  banner: {
    type: number
    url: string
  }
  status: StatusProduct
}

export type CreateProductBodyReq = {
  name: string
  category: string
  brand: string
  price: number
  discount: number
  stock: number
  isFeatured: string
  description: string
  banner: File
  medias: File[]
  specifications: { name: string; value: string }[]
}
