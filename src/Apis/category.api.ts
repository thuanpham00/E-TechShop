import Http from "src/Helpers/http"

export const categoryAPI = {
  getListCategoryIsActive: (signal?: AbortSignal) => {
    return Http.get(`/categories`, {
      signal
    })
  },

  getListCategoryMenu: (signal?: AbortSignal) => {
    return Http.get(`/categories/list-menu-category`, {
      signal
    })
  },

  getBannerSlugCategory: (signal?: AbortSignal) => {
    return Http.get(`/categories/banner`, {
      signal
    })
  }
}
