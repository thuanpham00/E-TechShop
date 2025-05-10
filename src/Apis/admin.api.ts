import Http from "src/Helpers/http"
import {
  CreateProductBodyReq,
  UpdateBodyReq,
  UpdateCategoryBodyReq,
  UpdateSupplierBodyReq,
  UpdateSupplyBodyReq
} from "src/Types/product.type"
import {
  queryParamConfigBrand,
  queryParamConfigCategory,
  queryParamConfigCustomer,
  queryParamConfigProduct,
  queryParamConfigSupplier
} from "src/Types/queryParams.type"

export const adminAPI = {
  statistical: {
    // lấy số liệu thống kê hệ thống
    getStatistical: (signal: AbortSignal) => {
      return Http.get("/admin/statistical", {
        signal
      })
    }
  },
  customer: {
    // lấy danh sách khách hàng
    getCustomers: (params: queryParamConfigCustomer, signal: AbortSignal) => {
      return Http.get("/admin/customers", {
        params,
        signal
      })
    },

    // lấy chi tiết khách hàng
    getCustomerDetail: (id: string) => {
      return Http.get(`/admin/customers/${id}`)
    },

    // cập nhật khách hàng
    updateProfileCustomer: (id: string, body: UpdateBodyReq) => {
      return Http.patch(`/admin/customers/${id}`, body)
    },

    // xóa khách hàng
    deleteProfileCustomer: (id: string) => {
      return Http.delete(`/admin/customers/${id}`)
    }
  },
  category: {
    // tạo danh mục
    createCategory: (body: { name: string }) => {
      return Http.post("/admin/categories", body)
    },

    // lấy danh sách danh mục
    getCategories: (params: queryParamConfigCategory, signal: AbortSignal) => {
      return Http.get(`/admin/categories`, {
        params,
        signal
      })
    },

    getNameCategory: () => {
      return Http.get("/admin/name-categories")
    },

    // lấy chi tiết danh mục
    getCategoryDetail: (id: string) => {
      return Http.get(`/admin/categories/${id}`)
    },

    // cập nhật danh mục
    updateCategoryDetail: (id: string, body: UpdateCategoryBodyReq) => {
      return Http.patch(`/admin/categories/${id}`, body)
    },

    // xóa danh mục
    deleteCategory: (id: string) => {
      return Http.delete(`/admin/categories/${id}`)
    },

    // tạo danh mục
    createBrand: (body: { name: string; categoryId: string }) => {
      return Http.post("/admin/brands", body)
    },

    // lấy danh sách thương hiệu thuộc về 1 danh mục
    getBrands: (params: queryParamConfigBrand, signal: AbortSignal) => {
      return Http.get("/admin/brands", {
        params,
        signal
      })
    },

    // lấy chi tiết thương hiệu
    getBrandDetail: (id: string) => {
      return Http.get(`/admin/brands/${id}`)
    },

    getNameBrand: () => {
      return Http.get("/admin/name-brands")
    },

    // cập nhật thương hiệu
    updateBrandDetail: (id: string, body: UpdateCategoryBodyReq) => {
      return Http.patch(`/admin/brands/${id}`, body)
    },

    // xóa thương hiệu
    deleteBrand: (id: string, categoryId: string) => {
      return Http.delete(`/admin/brands/${id}?categoryId=${categoryId}`)
    }
  },

  product: {
    // lấy danh sách sản phẩm
    getProducts: (params: queryParamConfigProduct, signal: AbortSignal) => {
      return Http.get(`/admin/products`, {
        params,
        signal
      })
    },

    // lấy danh sách tên sản phẩm de lọc
    getNameProducts: () => {
      return Http.get(`/admin/name-products`)
    },

    addProduct: (body: CreateProductBodyReq) => {
      const formData = new FormData()

      // formData: dùng để vừa gửi dữ liệu dạng text + file xuống server
      formData.append("name", body.name)
      formData.append("category", body.category)
      formData.append("brand", body.brand)
      formData.append("price", String(body.price))
      formData.append("discount", String(body.discount))
      formData.append("stock", String(body.stock))
      formData.append("isFeatured", body.isFeatured)
      formData.append("description", body.description)

      if (body.banner) {
        formData.append("banner", body.banner)
      }

      body.medias.forEach((file) => {
        formData.append("medias", file)
      })

      formData.append("specifications", JSON.stringify(body.specifications))
      // formData sẽ không hiểu body.specifications là gì (vì nó là một mảng các object), và sẽ biến nó thành chuỗi [object Object] — điều này sẽ khiến backend parse sai hoặc không parse được.
      // JSON.stringify giúp giữ nguyên cấu trúc kiểu mảng đối tượng khi bạn gửi qua FormData.

      return Http.post(`/admin/products`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
    }
  },

  supplier: {
    // lấy danh sách nhà cung cấp
    getSuppliers: (params: queryParamConfigSupplier, signal: AbortSignal) => {
      return Http.get(`/admin/suppliers`, {
        params,
        signal
      })
    },

    // lấy chi tiết nhà cung cấp
    getSupplierDetail: (id: string) => {
      return Http.get(`/admin/suppliers/${id}`)
    },

    // lấy danh sách tên nhà cung cấp de lọc
    getNameSuppliers: () => {
      return Http.get(`/admin/name-suppliers`)
    },

    // lấy danh sách tên nhà cung cấp dựa trên tên sản phẩm
    // nếu sản phẩm đã liên kết với nhà cung cấp đó rồi sẽ bị lọc ra
    getNameSuppliersBasedOnNameProduct: (productId: string) => {
      return Http.get(`/admin/name-suppliers-based-on-product`, {
        params: { productId }
      })
    },

    // thêm nhà cung cấp
    createSupplier: (body: {
      name: string
      contactName: string
      email: string
      phone: string
      description: string
      address: string
    }) => {
      return Http.post("/admin/suppliers", body)
    },

    // cập nhật chi tiết nhà cung cấp
    updateSupplierDetail: (id: string, body: UpdateSupplierBodyReq) => {
      return Http.patch(`/admin/suppliers/${id}`, body)
    },

    // xóa nhà cung cấp
    deleteSupplierDetail: (id: string) => {
      return Http.delete(`/admin/suppliers/${id}`)
    }
  },
  supply: {
    // lấy danh sách cung ứng
    getSupplies: (params: queryParamConfigSupplier, signal: AbortSignal) => {
      return Http.get(`/admin/supplies`, {
        params,
        signal
      })
    },

    // lấy chi tiết cung ứng
    getSupplyDetail: (id: string) => {
      return Http.get(`/admin/supplies/${id}`)
    },

    createSupply: (body: {
      productId: string
      supplierId: string
      importPrice: number
      warrantyMonths: number
      leadTimeDays: number
      description: string
    }) => {
      return Http.post(`/admin/supplies`, body)
    },

    // cập nhật chi tiết cung ứng
    updateSupplyDetail: (id: string, body: UpdateSupplyBodyReq) => {
      return Http.patch(`/admin/supplies/${id}`, body)
    },

    // xóa cung ứng
    deleteSupplyDetail: (id: string) => {
      return Http.delete(`/admin/supplies/${id}`)
    }
  }
}
