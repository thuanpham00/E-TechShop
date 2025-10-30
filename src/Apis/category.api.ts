import Http from "src/Helpers/http"

export const categoryAPI = {
  getListCategoryIsActive: (signal?: AbortSignal) => {
    return Http.get(`/categories`, {
      signal
    })
  }
}
