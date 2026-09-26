import api from "./api";
import type {
  CreateProductRequest,
  InventoryBatch,
  Product,
  RestockProductRequest,
} from "../types/Product";
import type {
  CompleteOrderRequest,
  CompleteOrderResponse,
  MpesaPaymentRequest,
  MpesaPaymentResponse,
} from "../types/Order";

export const productService = {
  async getProducts(): Promise<Product[]> {
    const response = await api.get<Product[]>("/api/products");
    return response.data;
  },

  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await api.post<Product>("/api/products", data);
    return response.data;
  },

  async updateProduct(
    id: number,
    data: CreateProductRequest,
  ): Promise<Product> {
    const response = await api.put<Product>(`/api/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/api/products/${id}`);
  },

  async restockProduct(
    data: RestockProductRequest,
  ): Promise<InventoryBatch> {
    const response = await api.post<InventoryBatch>(
      "/api/inventory/restock",
      data,
    );

    return response.data;
  },

  async getProductBatches(
    productId: number,
  ): Promise<InventoryBatch[]> {
    const response = await api.get<InventoryBatch[]>(
      `/api/inventory/product/${productId}`,
    );

    return response.data;
  },

  async completeOrder(
    data: CompleteOrderRequest,
  ): Promise<CompleteOrderResponse> {
    const response = await api.post<CompleteOrderResponse>(
      "/api/completeorder",
      data,
    );

    return response.data;
  },

  async payWithMpesa(
    data: MpesaPaymentRequest,
  ): Promise<MpesaPaymentResponse> {
    const response = await api.post<MpesaPaymentResponse>(
      "/api/mpesa",
      data,
    );

    return response.data;
  },
};