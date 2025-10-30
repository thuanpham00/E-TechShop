import Http from "src/Helpers/http"
import { CreateProductBodyReq } from "src/Types/product.type"
import { queryParamConfigProduct } from "src/Types/queryParams.type"

export const ProductAPI = {
  // lấy danh sách sản phẩm
  getProducts: (params: queryParamConfigProduct, signal: AbortSignal) => {
    return Http.get(`/admin/products`, {
      params,
      signal
    })
  },

  // lấy danh sách tên sản phẩm de lọc
  getNameProducts: () => {
    return Http.get(`/admin/name-products`)
  },

  addProduct: (body: CreateProductBodyReq) => {
    const formData = new FormData()

    // formData: dùng để vừa gửi dữ liệu dạng text + file xuống server
    formData.append("name", body.name)
    formData.append("category", body.category)
    formData.append("brand", body.brand)
    formData.append("price", String(body.price))
    formData.append("discount", String(body.discount))
    formData.append("stock", String(body.stock))
    formData.append("isFeatured", body.isFeatured)
    formData.append("description", body.description)

    if (body.banner) {
      formData.append("banner", body.banner)
    }

    body.medias.forEach((file) => {
      formData.append("medias", file)
    })

    formData.append("specifications", JSON.stringify(body.specifications))
    // formData sẽ không hiểu body.specifications là gì (vì nó là một mảng các object), và sẽ biến nó thành chuỗi [object Object] — điều này sẽ khiến backend parse sai hoặc không parse được.
    // JSON.stringify giúp giữ nguyên cấu trúc kiểu mảng đối tượng khi bạn gửi qua FormData.

    return Http.post(`/admin/products`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  }
}
