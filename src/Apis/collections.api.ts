import Http from "src/Helpers/http"
import { CartType, FavouriteType } from "src/Types/product.type"
import { queryParamsCollection } from "src/Types/queryParams.type"

export const collectionAPI = {
  getFilterBaseOnCategory: (category: string) => {
    return Http.get(`/collections/filters`, {
      params: {
        category
      }
    })
  },

  getCollections: (slug: string, params: queryParamsCollection, signal?: AbortSignal) => {
    return Http.get(`/collections/${slug}`, {
      params,
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

  updateQuantityProductInCart: (body: CartType) => {
    return Http.put(`/collections/cart`, body)
  },

  clearProductToCart: () => {
    return Http.delete(`/collections/cart`)
  },

  removeProductToCart: (productId: string) => {
    return Http.delete(`/collections/cart/${productId}`)
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
  },

  getSearchProduct: (params: { search: string }, signal?: AbortSignal) => {
    return Http.get(`/products`, {
      params,
      signal
    })
  }
}
