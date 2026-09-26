export interface Product {
  id: number
  name: string
  price: number
  buyingPrice: number
  stock: number
  imageUrl: string
  categoryId: number
}

export interface CreateProductRequest {
  name: string
  price: number
  buyingPrice: number
  stock: number
  categoryId: number
  imageUrl: string
}

export interface RestockProductRequest {
  productId: number
  quantity: number
  unitCost: number
  supplier: string
  reason: string
}

export interface InventoryBatch {
  id: number
  productId: number
  quantityReceived: number
  quantityRemaining: number
  unitCost: number
  supplier: string
  reason: string
  createdAt: string
}

export interface CartItem {
  product: Product
  quantity: number
}