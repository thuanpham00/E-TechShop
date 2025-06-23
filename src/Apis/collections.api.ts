import Http from "src/Helpers/http"
import { CartType, FavouriteType } from "src/Types/product.type"

export const collectionAPI = {
  getCollections: (slug: string, signal?: AbortSignal) => {
    return Http.get(`/collections/${slug}`, {
      signal
    })
  },

  addProductToFavourite: (body: FavouriteType) => {
    return Http.post(`/collections/favourite`, body)
  },

  getProductInFavourite: (signal?: AbortSignal) => {
    return Http.get(`/collections/favourite`, {
      signal
    })
  },

  addProductToCart: (body: CartType) => {
    return Http.post(`/collections/cart`, body)
  },

  getProductInCart: (signal?: AbortSignal) => {
    return Http.get(`/collections/cart`, {
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
