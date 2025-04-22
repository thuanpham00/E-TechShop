// const { VITE_API_SERVER } = import.meta.env

export const config = {
  baseURLClient: "https://techzoneapi.io.vn/",
  // baseURLClient: VITE_API_SERVER,
  maxSizeUploadImage: 1048576 // 1mb = 1.048.576 byte
}

console.log("BASE_URL dùng:", config.baseURLClient)
