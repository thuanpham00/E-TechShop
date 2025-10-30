import Http from "src/Helpers/http"
import { UpdateCategoryBodyReq } from "src/Types/product.type"
import { queryParamConfigBrand } from "src/Types/queryParams.type"

export const BrandAPI = {
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

  getNameBrand: () => {
    return Http.get("/admin/name-brands")
  },

  // cập nhật thương hiệu
  updateBrandDetail: (id: string, body: UpdateCategoryBodyReq) => {
    return Http.put(`/admin/brands/${id}`, body)
  },

  // xóa thương hiệu
  deleteBrand: (id: string, categoryId: string) => {
    return Http.delete(`/admin/brands/${id}?categoryId=${categoryId}`)
  }
}
