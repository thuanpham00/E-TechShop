import { useQuery } from "@tanstack/react-query"
import { userAPI } from "src/Apis/user.api"

export default function Profile() {
  const getMeQuery = useQuery({
    queryKey: ["getMe"],
    queryFn: () => userAPI.getMe()
  })
  console.log(getMeQuery.data)
  return <div>MyProfile</div>
}
