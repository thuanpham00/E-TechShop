import { useQuery } from "@tanstack/react-query"
import { userAPI } from "src/Client/Apis/user.api"

export default function MyProfile() {
  const getMeQuery = useQuery({
    queryKey: ["getMe"],
    queryFn: () => userAPI.getMe()
  })
  console.log(getMeQuery.data)
  return <div>MyProfile</div>
}
