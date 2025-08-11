import Http from "src/Helpers/http"

export const conversationAPI = {
  getUserListType: (signal: AbortSignal, params: { type_user: string }) => {
    return Http.get(`/conversation/list-user-type`, {
      params,
      signal
    })
  }
}
