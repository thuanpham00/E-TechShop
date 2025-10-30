import Http from "src/Helpers/http"
import { UpdateCategoryBodyReq } from "src/Types/product.type"
import { queryParamConfigCategory } from "src/Types/queryParams.type"

export const CategoryAPI = {
  createCategory: (body: { name: string; is_active: boolean }) => {
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

  // cập nhật danh mục
  updateCategoryDetail: (id: string, body: UpdateCategoryBodyReq) => {
    return Http.put(`/admin/categories/${id}`, body)
  },

  // xóa danh mục
  deleteCategory: (id: string) => {
    return Http.delete(`/admin/categories/${id}`)
  }
}
