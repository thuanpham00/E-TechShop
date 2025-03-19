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

export const setRoleToLS = (roleName: string) => {
  return localStorage.setItem("role", roleName)
}

export const getRoleFromLS = () => {
  return localStorage.getItem("role") || ""
}

export const setAvatarImageToLS = (avatar: string) => {
  return localStorage.setItem("avatar", avatar)
}

export const getAvatarImageFromLS = () => {
  return localStorage.getItem("avatar") || ""
}

export const LocalStorageEventTarget = new EventTarget() // tạo ra 1 event target để lắng nghe sự kiện thay đổi LocalStorage

export const clearLS = () => {
  localStorage.removeItem("access_token")
  localStorage.removeItem("name_user")
  localStorage.removeItem("role")
  localStorage.removeItem("avatar")
  const ClearLSEvent = new Event("ClearLS")
  LocalStorageEventTarget.dispatchEvent(ClearLSEvent) // phát sự kiện
}
