import Http from "src/Helpers/http"
import { queryParamConfigEmail } from "src/Types/queryParams.type"

export const emailAPI = {
  getEmails: (signal: AbortSignal, params: queryParamConfigEmail) => {
    return Http.get(`/email`, {
      params,
      signal
    })
  }
}
