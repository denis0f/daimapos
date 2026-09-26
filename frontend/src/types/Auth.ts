export interface RegisterRequest {
  fullName: string
  username: string
  password: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  username: string
}