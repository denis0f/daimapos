export interface User {
  id: number
  fullName: string
  username: string
  role: 'Admin' | 'Cashier'
}

export interface CreateUserRequest {
  fullName: string
  username: string
  password: string
  role: 'Admin' | 'Cashier'
}

export interface UpdateUserRequest {
  fullName: string
  username: string
  password: string
  role: 'Admin' | 'Cashier'
}