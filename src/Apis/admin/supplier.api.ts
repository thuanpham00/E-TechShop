import Http from "src/Helpers/http"
import { UpdateSupplierBodyReq } from "src/Types/product.type"
import { queryParamConfigSupplier } from "src/Types/queryParams.type"

export const SupplierAPI = {
  // lấy danh sách nhà cung cấp
  getSuppliers: (params: queryParamConfigSupplier, signal: AbortSignal) => {
    return Http.get(`/admin/suppliers`, {
      params,
      signal
    })
  },

  // lấy danh sách tên nhà cung cấp de lọc
  getNameSuppliers: () => {
    return Http.get(`/admin/name-suppliers`)
  },

  // lấy danh sách tên nhà cung cấp dựa trên tên sản phẩm
  // nếu sản phẩm đã liên kết với nhà cung cấp đó rồi sẽ bị lọc ra
  getNameSuppliersNotLinkedToProduct: (productId: string) => {
    return Http.get(`/admin/not-linked-to-product`, {
      params: { productId }
    })
  },

  getNameSuppliersLinkedToProduct: (productId: string) => {
    return Http.get(`/admin/linked-to-product`, {
      params: { productId }
    })
  },

  // thêm nhà cung cấp
  createSupplier: (body: {
    name: string
    contactName: string
    email: string
    phone: string
    description: string
    address: string
  }) => {
    return Http.post("/admin/suppliers", body)
  },

  // cập nhật chi tiết nhà cung cấp
  updateSupplierDetail: (id: string, body: UpdateSupplierBodyReq) => {
    return Http.put(`/admin/suppliers/${id}`, body)
  },

  // xóa nhà cung cấp
  deleteSupplierDetail: (id: string) => {
    return Http.delete(`/admin/suppliers/${id}`)
  }
}
