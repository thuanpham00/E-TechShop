/* eslint-disable @typescript-eslint/no-explicit-any */
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
  status: StatusProduct
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

export type SupplyItemType = {
  _id: string
  productId: {
    name: string
  }[]
  supplierId: {
    name: string
  }[]
  importPrice: number
  warrantyMonths: number
  leadTimeDays: number
  description: string
  created_at: string
  updated_at: string
}

export type ReceiptItemType = {
  _id: string
  items: {
    productId: {
      _id: string
      name: string
      averageRating: number
      brand: string
      category: string
      created_at: string
      description: string
      discount: number
      gifts: any[]
      isFeatured: string
      medias: {
        url: string
        type: number
      }[]
      price: number
      reviews: any[]
      sold: number
      specifications: any[]
      stock: number
      updated_at: string
      viewCount: number
      banner: {
        type: number
        url: string
      }
      status: string
    }
    supplierId: {
      _id: string
      name: string
      contactName: string
      email: string
      phone: string
      address: string
      taxCode: string
      description: string
      created_at: string
      updated_at: string
      id: string
    }
    quantity: number
    pricePerUnit: number
    totalPrice: number
  }[]
  totalAmount: number
  totalItem: number
  importDate: string
  note: string
  created_at: string
  updated_at: string
}

export type OrderItemType = {
  _id: string
  user_id: string
  customer_info: {
    name: string
    phone: string
    address: string
  }
  products: {
    product_id: string
    name: string
    price: number
    quantity: number
    image: string
    discount: number // phần trăm giảm giá, ví dụ: 5 = 5%
  }[]
  totalAmount: number
  status: OrderStatus
  status_history: {
    status: OrderStatus
    updated_at: string
  }[]
  note: string
  created_at: string // hoặc Date nếu bạn muốn parse
  updated_at: string // hoặc Date nếu bạn muốn parse
}

type OrderStatus = "Chờ xác nhận" | "Đang xử lý" | "Đang vận chuyển" | "Đã giao hàng" | "Đã hủy"

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

export type UpdateSupplyBodyReq = {
  productId?: string
  supplierId?: string
  importPrice?: number
  warrantyMonths?: number
  leadTimeDays?: number
  description?: string
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

  quantity?: number // Thêm trường quantity nếu cần thiết - dành cho cart
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

export type CreateReceiptBodyReq = {
  importDate: string
  totalItem: number
  totalAmount: number
  items: {
    productId: string
    supplierId: string
    quantity: number
    pricePerUnit: number
    totalPrice: number
  }[]
}

export type CreateCustomerBodyReq = {
  id: string
  name: string
  email: string
  phone: string
  date_of_birth: Date
  password: string
  confirm_password: string
  avatar: string
}

export type FavouriteType = {
  product_id: string
  added_at?: Date
}

export type CartType = {
  product_id: string
  quantity: number
  added_at?: Date
}

export type OrderType = {
  customer_info: {
    name: string // người nhận
    phone: string
    address: string
  }
  products: {
    product_id: string // ref tới bảng Product (để tra cứu thêm nếu cần)
    name: string // tên sản phẩm tại thời điểm mua
    price: number // đơn giá lúc mua
    quantity: number // số lượng mua
    image: string
    discount?: number
  }[]
  totalAmount: number
  note?: string
}
