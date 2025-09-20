export const rolesForApi = {
  ADMIN: "ADMIN", // quản trị viên cấp cao, có toàn quyền
  SALES_STAFF: "SALES_STAFF", // nhân viên bán hàng (bao gồm thu ngân)
  INVENTORY_STAFF: "INVENTORY_STAFF", // nhân viên kho
  CUSTOMER: "CUSTOMER" // khách hàng, người dùng cuối
}

export const permissions = {
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_CUSTOMER: "view_customer",
  VIEW_ORDERS: "view_orders",
  VIEW_CATEGORY: "view_category",
  VIEW_PRODUCT: "view_product",
  VIEW_EMAIL: "view_email",
  VIEW_CHAT: "view_chat",
  VIEW_RECEIPT: "view_receipt",
  VIEW_SUPPLIERS: "view_suppliers",
  VIEW_SUPPLIES: "view_supplies",
  VIEW_EMPLOYEE: "view_employee",
  VIEW_ROLES: "view_roles",
  VIEW_PERMISSION: "view_permissions"
}

export const Roles_Permissions = {
  [rolesForApi.ADMIN]: [
    permissions.VIEW_DASHBOARD,
    permissions.VIEW_CUSTOMER,
    permissions.VIEW_EMPLOYEE,
    permissions.VIEW_CATEGORY,
    permissions.VIEW_PRODUCT,
    permissions.VIEW_ORDERS,
    permissions.VIEW_RECEIPT,
    permissions.VIEW_SUPPLIERS,
    permissions.VIEW_SUPPLIES,
    permissions.VIEW_ROLES,
    permissions.VIEW_EMAIL,
    permissions.VIEW_CHAT,
    permissions.VIEW_PERMISSION
  ],
  [rolesForApi.SALES_STAFF]: [
    permissions.VIEW_DASHBOARD,
    permissions.VIEW_CUSTOMER,
    permissions.VIEW_ORDERS,
    permissions.VIEW_CATEGORY,
    permissions.VIEW_PRODUCT,
    permissions.VIEW_EMAIL,
    permissions.VIEW_CHAT
  ]
}
