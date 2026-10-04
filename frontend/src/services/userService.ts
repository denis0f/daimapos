import api from './api'
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/User'

const userService = {
  async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/api/users')
    return response.data
  },

  async getUser(id: number): Promise<User> {
    const response = await api.get<User>(`/api/users/${id}`)
    return response.data
  },

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await api.post<User>('/api/users', data)
    return response.data
  },

  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await api.put<User>(`/api/users/${id}`, data)
    return response.data
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/api/users/${id}`)
  },
}

export default userService
