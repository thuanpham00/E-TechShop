import Http from "src/Helpers/http"

export const TicketAPI = {
  getListTicket: (signal: AbortSignal, params: { status: string }) => {
    return Http.get(`/tickets`, {
      params,
      signal
    })
  },

  getMessageTicketAdmin: (signal: AbortSignal, id: string, params: { limit: number; page: number }) => {
    return Http.get(`/tickets/${id}/messages`, {
      params,
      signal
    })
  },

  getImageTicketAdmin: (signal: AbortSignal, id: string) => {
    return Http.get(`/tickets/${id}/images`, {
      signal
    })
  },

  getMessageTicketClient: (signal: AbortSignal, params: { limit: number; page: number }) => {
    return Http.get(`/users/tickets/messages`, {
      params,
      signal
    })
  }
}
