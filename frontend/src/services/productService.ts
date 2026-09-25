import api from './api'
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from '../types/Product'
import type {
  CompleteOrderRequest,
  CompleteOrderResponse,
  MpesaPaymentRequest,
  MpesaPaymentResponse,
} from '../types/Order'

const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>('/api/products')

  return response.data
}

const createProduct = async (
  data: CreateProductRequest
): Promise<Product> => {
  const response = await api.post<Product>(
    '/api/products',
    data
  )

  return response.data
}

const updateProduct = async (
  id: number,
  data: UpdateProductRequest
): Promise<Product> => {
  const response = await api.put<Product>(
    `/api/products/${id}`,
    data
  )

  return response.data
}

const deleteProduct = async (
  id: number
): Promise<void> => {
  await api.delete(`/api/products/${id}`)
}

const completeOrder = async (
  data: CompleteOrderRequest
): Promise<CompleteOrderResponse> => {
  const response = await api.post<CompleteOrderResponse>(
    '/api/completeorder',
    data
  )

  return response.data
}

const payWithMpesa = async (
  data: MpesaPaymentRequest
): Promise<MpesaPaymentResponse> => {
  const response = await api.post<MpesaPaymentResponse>(
    '/api/mpesa',
    data
  )

  return response.data
}

export const productService = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  completeOrder,
  payWithMpesa,
}