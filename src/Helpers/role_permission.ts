export const roles = {
  ADMIN: "Admin", // quản trị viên cấp cao, có toàn quyền
  SALES_STAFF: "Sales Staff", // nhân viên bán hàng (bao gồm thu ngân)
  INVENTORY_STAFF: "Inventory Staff", // nhân viên kho
  CLIENT: "Client" // khách hàng, người dùng cuối
}

export const permissions = {
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_CUSTOMER: "view_customer",
  VIEW_EMPLOYEE: "view_employee",
  VIEW_CATEGORY: "view_category",
  VIEW_PRODUCT: "view_product",
  VIEW_ORDERS: "view_orders",
  VIEW_RECEIPT: "view_receipt",
  VIEW_SUPPLIERS: "view_suppliers",
  VIEW_SUPPLIES: "view_supplies",
  VIEW_ROLES: "view_roles",
  VIEW_REVENUE: "view_revenue"
}

export const Roles_Permissions = {
  [roles.ADMIN]: [
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
    permissions.VIEW_REVENUE
  ]
}
