import Http from "src/Helpers/http"

export const adminAPI = {
  getStatistical: (signal: AbortSignal) => {
    return Http.get("/admin/getStatistical", {
      signal
    })
  }
}
