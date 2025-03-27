import Http from "src/Helpers/http"
import { UpdateBodyReq, UpdateCategoryBodyReq } from "src/Types/product.type"
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
      return Http.get(`/admin/products/`, {
        params,
        signal
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
