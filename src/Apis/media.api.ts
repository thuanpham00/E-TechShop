import Http from "src/Helpers/http"

export const MediaAPI = {
  uploadImageProfile: (file: File, userId: string) => {
    const formData = new FormData()
    formData.append("image", file)
    formData.append("userId", userId)
    return Http.post("/medias/upload-image-user", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  }
}
