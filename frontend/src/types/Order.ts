
export interface OrderItemRequest {
  productId: number
  quantity: number
}

export interface CompleteOrderRequest {
  items: OrderItemRequest[]
  paymentMethod: 'Cash' | 'Mpesa'
  amountPaid?: number
  transactionId?: string
}

export interface CompleteOrderResponse {
  receiptNumber: string
  total: number
  paymentMethod: string
  amountPaid?: number
  change?: number
  transactionId?: string
  date: string
}

export interface MpesaPaymentRequest {
  customerName: string
  phoneNumber: string
  amount: number
}

export interface MpesaPaymentResponse {
  transactionId: string
  status: string
}