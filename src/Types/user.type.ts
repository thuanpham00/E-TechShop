export type UserType = {
  _id: string
  name: string
  email: string
  role: string
  numberPhone: string
  avatar: string
  date_of_birth: string
  verify: number
  created_at: string
  updated_at: string

  employeeInfo?: {
    department: string
    hire_date: Date // ngày vào làm
    contract_type: string // loại hợp đồng
    salary: number // lương
    status: string
  }
}
