import api from './api'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/Auth'

const register = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    '/api/auth/register',
    data
  )

  return response.data
}

const login = async (
  data: LoginRequest
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    '/api/auth/login',
    data
  )

  return response.data
}

export const authService = {
  register,
  login,
}