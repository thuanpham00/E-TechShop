import Http from "src/Helpers/http"
import { FavouritesType } from "src/Types/product.type"

export const collectionAPI = {
  getCollections: (slug: string, signal?: AbortSignal) => {
    return Http.get(`/collections/${slug}`, {
      signal
    })
  },

  createCollectionsFavourite: (body: FavouritesType) => {
    return Http.post(`/collections/favourite`, body)
  },

  getCollectionsFavourite: (signal?: AbortSignal) => {
    return Http.get(`/collections/favourite`, {
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
