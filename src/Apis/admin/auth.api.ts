import Http from "src/Helpers/http"
import { AuthResponse } from "src/Types/utils.type"

export const authAPI = {
  loginAdmin: (body: { email: string; password: string }) => {
    return Http.post<AuthResponse>("/admin/login", body)
  }
}
