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
  sold: number
  specifications: never[]
  viewCount: number
  reviews: string[]
}

export type CategoryItemType = {
  _id: string
  name: string
  created_at: string
  updated_at: string
}

export type BrandItemType = {
  _id: string
  name: string
  category_id: string
  created_at: string
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
