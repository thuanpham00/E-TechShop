import Http from "src/Helpers/http"

export const TicketAPI = {
  getListTicket: (signal: AbortSignal, params: { status: string }) => {
    return Http.get(`/tickets`, {
      params,
      signal
    })
  },

  updateStatusTicket: (idTicket: string, status: string) => {
    return Http.put(`/tickets/status/${idTicket}`, {
      status
    })
  },

  getMessageTicketAdmin: (signal: AbortSignal, id: string, params: { limit: number; page: number }) => {
    return Http.get(`/tickets/${id}/messages`, {
      params,
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
