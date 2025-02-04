import Http from "src/Helpers/http"

export const collectionAPI = {
  getCollections: (slug: string, signal?: AbortSignal) => {
    return Http.get(`/collections/${slug}`, {
      signal
    })
  }
}
