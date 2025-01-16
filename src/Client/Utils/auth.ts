export const setAccessTokenToLS = (accessToken: string) => {
  return localStorage.setItem("access_token", accessToken)
}

export const getAccessTokenFromLS = () => {
  return localStorage.getItem("access_token") || ""
}

export const setNameUserToLS = (name: string) => {
  return localStorage.setItem("name_user", name)
}

export const getNameUserFromLS = () => {
  return localStorage.getItem("name_user") || ""
}
