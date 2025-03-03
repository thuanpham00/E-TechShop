import Http from "src/Helpers/http"
import { UpdateBodyReq, UpdateCategoryBodyReq } from "src/Types/product.type"
import { queryParamConfigBrand, queryParamConfigCategory, queryParamConfigCustomer } from "src/Types/queryParams.type"

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

    deleteCategory: (id: string) => {
      return Http.delete(`/admin/categories/${id}`)
    },

    // lấy danh sách thương hiệu thuộc về 1 danh mục
    getBrands: (params: queryParamConfigBrand, signal: AbortSignal) => {
      return Http.get("/admin/brands", {
        params,
        signal
      })
    },

    getBrandDetail: (id: string) => {
      return Http.get(`/admin/brands/${id}`)
    },

    updateBrandDetail: (id: string, body: UpdateCategoryBodyReq) => {
      return Http.patch(`/admin/brands/${id}`, body)
    }
  }
}

/**
 * Trang quản lý khách hàng
 * Get Tìm kiếm khách hàng
 * Get danh sách khách hàng + query
 * Get khách hàng
 * Update khách hàng
 * Delete khách hàng
 *
 * Thiếu: Post Tạo khách hàng
 */

/**
 * Trang quản lý danh mục
 * Get tìm kiếm danh mục
 * Get danh sách danh mục + query
 * Get danh mục
 * Update danh mục
 *
 * Thiếu: Post Tạo danh mục; Delete Xóa danh mục
 */

/**
 * Trang quản lý thương hiệu
 * Get tìm kiếm thương hiệu
 * Get danh sách thương hiệu + query
 * Get danh mục
 * Update danh mục
 *
 * Thiếu: Post Tạo thương hiệu; Delete Xóa thương hiệu
 */
