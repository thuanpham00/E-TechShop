const { VITE_API_SERVER } = import.meta.env

export const config = {
  // baseURLClient: "https://techzoneapi.io.vn/",
  baseURLClient: VITE_API_SERVER,
  maxSizeUploadImage: 5242880 // 1mb = 1.048.576 byte
}
