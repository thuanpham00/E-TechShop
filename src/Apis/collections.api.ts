import Http from "src/Helpers/http"

export const collectionAPI = {
  getCollections: (slug: string, signal?: AbortSignal) => {
    return Http.get(`/collections/${slug}`, {
      signal
    })
  },

  getProductRelated: (params: { brand: string; category: string; idProduct: string }) => {
    return Http.get(`/products/related`, {
      params
    })
  },

  getProductDetail: (id: string) => {
    return Http.get(`/products/${id}`)
  }
}
