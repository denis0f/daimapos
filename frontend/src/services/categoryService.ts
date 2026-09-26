import api from './api'
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/Category'

const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/api/categories')

  return response.data
}

const createCategory = async (
  data: CreateCategoryRequest
): Promise<Category> => {
  const response = await api.post<Category>(
    '/api/categories',
    data
  )

  return response.data
}

const updateCategory = async (
  id: number,
  data: UpdateCategoryRequest
): Promise<Category> => {
  const response = await api.put<Category>(
    `/api/categories/${id}`,
    data
  )

  return response.data
}

const deleteCategory = async (
  id: number
): Promise<void> => {
  await api.delete(`/api/categories/${id}`)
}

export const categoryService = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
}