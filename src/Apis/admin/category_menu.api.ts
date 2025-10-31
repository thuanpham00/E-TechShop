import Http from "src/Helpers/http"

export const CategoryMenuAPI = {
  addGroupCategoryMenu: (data: FormData) => {
    if (data instanceof FormData) {
      return Http.post(`/admin/category_menus/group`, data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
    }
    return Http.post(`/admin/category_menus/group`, data)
  },

  deleteGroupCategoryMenu: (idMenuCategory: string) => {
    return Http.delete(`/admin/category_menus/group/${idMenuCategory}`)
  },

  getMenuCategoryById: (idCategory: string) => {
    return Http.get(`/admin/category_menus/${idCategory}`)
  },

  updateGroupNameMenu: (idMenuCategory: string, data: { id_section: string; name: string }) => {
    return Http.put(`/admin/category_menus/${idMenuCategory}/name-group`, data)
  },

  addLinkCategoryMenu: (
    idMenuCategory: string,
    data: { id_category: string; id_section: string; name: string; slug: string; type_filter: string; image?: File }
  ) => {
    const formData = new FormData()
    formData.append("id_category", data.id_category)
    formData.append("id_section", data.id_section)
    formData.append("name", data.name)
    formData.append("slug", data.slug)
    formData.append("type_filter", data.type_filter)

    if (data.image) {
      formData.append("image", data.image)
    }
    return Http.post(`/admin/category_menus/${idMenuCategory}/link`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  },

  updateCategoryLink: (
    idLink: string,
    data: { id_category: string; name: string; slug: string; type_filter: string; image?: File }
  ) => {
    const formData = new FormData()
    formData.append("id_category", data.id_category)
    formData.append("name", data.name)
    formData.append("slug", data.slug)
    formData.append("type_filter", data.type_filter)

    if (data.image) {
      formData.append("image", data.image)
    }
    return Http.put(`/admin/category_links/${idLink}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  },

  deleteCategoryLink: (idLink: string) => {
    return Http.delete(`/admin/category_links/${idLink}`)
  }
}
