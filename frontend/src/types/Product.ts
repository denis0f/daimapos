export interface Product {
  id: number
  name: string
  price: number
  stock: number
  image: string
}

export interface CartItem {
  product: Product
  quantity: number
}