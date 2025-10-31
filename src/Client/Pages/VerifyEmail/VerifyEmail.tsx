import { useMutation } from "@tanstack/react-query"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { userAPI } from "src/Apis/user.api"
import { path } from "src/Constants/path"
import useQueryParams from "src/Hook/useQueryParams"

export default function VerifyEmail() {
  const queryParams = useQueryParams()
  const email_verify_token = queryParams.token
  const navigate = useNavigate()

  const verifyEmailToken = useMutation({
    mutationFn: (emailToken: string) => {
      return userAPI.verifyEmail(emailToken)
    }
  })

  useEffect(() => {
    verifyEmailToken.mutate(email_verify_token, {
      onSuccess() {
        navigate(path.Home)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <div>VerifyEmail</div>
}
