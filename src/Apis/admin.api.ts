import Http from "src/Helpers/http"
import { CreateProductBodyReq, UpdateBodyReq, UpdateCategoryBodyReq } from "src/Types/product.type"
import {
  queryParamConfigBrand,
  queryParamConfigCategory,
  queryParamConfigCustomer,
  queryParamConfigProduct
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
      return Http.get(`/admin/categories/`, {
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

    addProduct: (body: CreateProductBodyReq) => {
      const formData = new FormData()

      // formData: Cho phép gửi dữ liệu hỗn hợp: text + file
      // nó chỉ hỗ trợ string, file
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
  }
}

/**
 * Trang quản lý khách hàng
 * Get Tìm kiếm khách hàng
 * Get danh sách khách hàng + query
 * Get khách hàng
 * Patch khách hàng
 * Delete khách hàng
 * Post Tạo khách hàng (chưa)
 */

/**
 * Trang quản lý danh mục
 * Get tìm kiếm danh mục
 * Get danh sách danh mục + query
 * Get danh mục
 * Patch danh mục
 * Delete danh mục
 * Post Tạo danh mục
 */

/**
 * Trang quản lý thương hiệu
 * Get tìm kiếm thương hiệu
 * Get danh sách thương hiệu + query
 * Get danh mục
 * Patch thương hiệu
 * Delete thương hiệu
 * Post Tạo thương hiệu
 */

/**
 * Trang quản lý sản phẩm
 * Get tìm kiếm sản phẩm
 * Get danh sách sản phẩm + query
 * Get sản phẩm (chưa)
 * Patch sản phẩm (chưa)
 * Delete sản phẩm (chưa)
 * Post Tạo sản phẩm (chưa)
 */
