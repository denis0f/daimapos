// src/pages/Checkout.tsx

import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import MpesaPayment from '../components/MpesaPayment'
import { productService } from '../services/productService'
import type { CartItem } from '../types/Product'
import type { CompleteOrderResponse } from '../types/Order'

interface CheckoutState {
  items: CartItem[]
}

function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()

  const state = location.state as CheckoutState | null
  const items = state?.items ?? []

  const [paymentMethod, setPaymentMethod] =
    useState<'Cash' | 'Mpesa'>('Cash')

  const [amountPaid, setAmountPaid] = useState('')
  const [mpesaOpen, setMpesaOpen] = useState(false)
  const [mpesaPaid, setMpesaPaid] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [receiptVisible, setReceiptVisible] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] =
    useState<CompleteOrderResponse | null>(null)

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const cashAmount = Number(amountPaid) || 0
  const change = Math.max(cashAmount - total, 0)

  const canCompleteSale =
    paymentMethod === 'Cash'
      ? cashAmount >= total
      : mpesaPaid && transactionId !== ''

  const handlePaymentMethodChange = (
    method: 'Cash' | 'Mpesa'
  ) => {
    setPaymentMethod(method)
    setError('')

    if (method === 'Cash') {
      setMpesaOpen(false)
      setMpesaPaid(false)
      setTransactionId('')
      setCustomerName('')
      setPhoneNumber('')
    }
  }

  const handleMpesaPayment = (
    name: string,
    phone: string,
    transaction: string
  ) => {
    setCustomerName(name)
    setPhoneNumber(phone)
    setTransactionId(transaction)
    setMpesaPaid(true)
    setMpesaOpen(false)
    setError('')
  }

  const handleCompleteSale = async () => {
    if (!canCompleteSale || processing) {
      return
    }

    try {
      setProcessing(true)
      setError('')

      const response = await productService.completeOrder({
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        paymentMethod,
        ...(paymentMethod === 'Cash'
          ? {
              amountPaid: cashAmount,
            }
          : {
              transactionId,
            }),
      })

      setOrder(response)
      setReceiptVisible(true)
    } catch {
      setError('The sale could not be completed.')
    } finally {
      setProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl bg-white px-6 py-12 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#4a2c20]">
            No items in checkout
          </h1>

          <p className="mt-2 text-[#7a6258]">
            Add products to the cart before proceeding to checkout.
          </p>

          <button
            onClick={() => navigate('/products')}
            className="mt-6 rounded-lg bg-[#6b3f2a] px-6 py-3 font-semibold text-white transition hover:bg-[#4a2c20]"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  if (receiptVisible && order) {
    const receiptTotal = order.total
    const receiptAmountPaid =
      order.amountPaid ?? cashAmount
    const receiptChange =
      order.change ?? Math.max(receiptAmountPaid - receiptTotal, 0)

    return (
      <div className="receipt-page mx-auto max-w-3xl">
        <div className="receipt-screen">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#4a2c20]">
              Receipt
            </h1>

            <p className="mt-2 text-[#7a6258]">
              Sale completed successfully.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="border-b border-dashed border-[#d8c8bd] pb-5 text-center">
              <h2 className="text-2xl font-bold text-[#4a2c20]">
                DAIMAPOS
              </h2>

              <p className="mt-1 text-sm text-[#7a6258]">
                Wholesale & Retail
              </p>

              <p className="mt-3 text-xs text-[#7a6258]">
                Receipt #{order.receiptNumber}
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-medium text-[#4a2c20]">
                      {item.product.name}
                    </p>

                    <p className="text-xs text-[#7a6258]">
                      {item.quantity} × KSh{' '}
                      {item.product.price.toLocaleString()}
                    </p>
                  </div>

                  <span className="font-semibold text-[#4a2c20]">
                    KSh{' '}
                    {(
                      item.product.price * item.quantity
                    ).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-dashed border-[#d8c8bd] pt-5">
              <div className="flex justify-between">
                <span className="text-[#7a6258]">
                  Total
                </span>

                <span className="text-xl font-bold text-[#4a2c20]">
                  KSh {receiptTotal.toLocaleString()}
                </span>
              </div>

              <div className="mt-2 flex justify-between text-sm">
                <span className="text-[#7a6258]">
                  Payment
                </span>

                <span className="font-medium text-[#4a2c20]">
                  {paymentMethod === 'Mpesa'
                    ? 'M-Pesa'
                    : 'Cash'}
                </span>
              </div>

              {paymentMethod === 'Cash' && (
                <>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-[#7a6258]">
                      Amount Paid
                    </span>

                    <span className="font-medium text-[#4a2c20]">
                      KSh{' '}
                      {receiptAmountPaid.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-[#7a6258]">
                      Change
                    </span>

                    <span className="font-medium text-[#4a2c20]">
                      KSh {receiptChange.toLocaleString()}
                    </span>
                  </div>
                </>
              )}

              {paymentMethod === 'Mpesa' && (
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-[#7a6258]">
                    Phone
                  </span>

                  <span className="font-medium text-[#4a2c20]">
                    {phoneNumber}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => navigate('/products')}
                className="flex-1 rounded-lg border border-[#d8c8bd] py-3 font-semibold text-[#4a2c20] transition hover:bg-[#f5f0e8]"
              >
                New Sale
              </button>

              <button
                onClick={() => window.print()}
                className="flex-1 rounded-lg bg-[#6b3f2a] py-3 font-semibold text-white transition hover:bg-[#4a2c20]"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>

        <div className="receipt-print">
          <div className="receipt-print-header">
            <h1>DAIMAPOS</h1>
            <p>Wholesale & Retail</p>
          </div>

          <div className="receipt-print-divider" />

          <div className="receipt-print-info">
            <div>
              <span>Receipt #:</span>
              <span>{order.receiptNumber}</span>
            </div>

            <div>
              <span>Date:</span>
              <span>
                {new Date(order.date).toLocaleDateString()}
              </span>
            </div>

            <div>
              <span>Cashier:</span>
              <span>
                {localStorage.getItem('username') ?? ''}
              </span>
            </div>
          </div>

          <div className="receipt-print-divider" />

          <div className="receipt-print-items">
            <div className="receipt-print-item receipt-print-item-header">
              <span>Product</span>
              <span>Qty</span>
              <span>Total</span>
            </div>

            {items.map((item) => (
              <div
                key={item.product.id}
                className="receipt-print-item"
              >
                <span>{item.product.name}</span>

                <span>{item.quantity}</span>

                <span>
                  KSh{' '}
                  {(
                    item.product.price * item.quantity
                  ).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="receipt-print-divider" />

          <div className="receipt-print-summary">
            <div className="receipt-print-total">
              <span>TOTAL</span>

              <span>
                KSh {receiptTotal.toLocaleString()}
              </span>
            </div>

            <div>
              <span>Payment:</span>

              <span>
                {paymentMethod === 'Mpesa'
                  ? 'M-Pesa'
                  : 'Cash'}
              </span>
            </div>

            {paymentMethod === 'Cash' && (
              <>
                <div>
                  <span>Amount Paid:</span>

                  <span>
                    KSh{' '}
                    {receiptAmountPaid.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span>Change:</span>

                  <span>
                    KSh {receiptChange.toLocaleString()}
                  </span>
                </div>
              </>
            )}

            {paymentMethod === 'Mpesa' && (
              <div>
                <span>Phone:</span>

                <span>{phoneNumber}</span>
              </div>
            )}
          </div>

          <div className="receipt-print-divider" />

          <div className="receipt-print-footer">
            <p>Thank you!</p>
            <p>Thank you for shopping with us.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#4a2c20]">
          Checkout
        </h1>

        <p className="mt-2 text-[#7a6258]">
          Complete the payment before finalizing the sale.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#4a2c20]">
            Payment
          </h2>

          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-[#4a2c20]">
              Payment Method
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  handlePaymentMethodChange('Cash')
                }
                className={`rounded-lg border px-4 py-3 font-semibold transition ${
                  paymentMethod === 'Cash'
                    ? 'border-[#6b3f2a] bg-[#6b3f2a] text-white'
                    : 'border-[#d8c8bd] text-[#4a2c20] hover:bg-[#f5f0e8]'
                }`}
              >
                Cash
              </button>

              <button
                onClick={() =>
                  handlePaymentMethodChange('Mpesa')
                }
                className={`rounded-lg border px-4 py-3 font-semibold transition ${
                  paymentMethod === 'Mpesa'
                    ? 'border-[#6b3f2a] bg-[#6b3f2a] text-white'
                    : 'border-[#d8c8bd] text-[#4a2c20] hover:bg-[#f5f0e8]'
                }`}
              >
                M-Pesa
              </button>
            </div>
          </div>

          {paymentMethod === 'Cash' && (
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                Amount Paid
              </label>

              <input
                type="number"
                min="0"
                value={amountPaid}
                onChange={(event) =>
                  setAmountPaid(event.currentTarget.value)
                }
                placeholder="Enter amount paid"
                className="w-full rounded-lg border border-[#d8c8bd] bg-white px-4 py-3 text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
              />

              <div className="mt-4 rounded-lg bg-[#f5f0e8] p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-[#7a6258]">
                    Change
                  </span>

                  <span className="font-bold text-[#4a2c20]">
                    KSh {change.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'Mpesa' && (
            <div className="mt-6">
              <div className="rounded-lg border border-[#d8c8bd] bg-[#faf7f4] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7a6258]">
                      M-Pesa Amount
                    </p>

                    <p className="mt-1 text-2xl font-bold text-[#4a2c20]">
                      KSh {total.toLocaleString()}
                    </p>
                  </div>

                  {mpesaPaid && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Paid
                    </span>
                  )}
                </div>

                {!mpesaPaid && (
                  <button
                    onClick={() => setMpesaOpen(true)}
                    className="mt-4 w-full rounded-lg bg-[#6b3f2a] py-3 font-semibold text-white transition hover:bg-[#4a2c20]"
                  >
                    Pay with M-Pesa
                  </button>
                )}

                {mpesaPaid && (
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#7a6258]">
                        Customer
                      </span>

                      <span className="font-medium text-[#4a2c20]">
                        {customerName}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#7a6258]">
                        Phone
                      </span>

                      <span className="font-medium text-[#4a2c20]">
                        {phoneNumber}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => navigate('/products')}
              disabled={processing}
              className="flex-1 rounded-lg border border-[#d8c8bd] py-3 font-semibold text-[#4a2c20] transition hover:bg-[#f5f0e8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>

            <button
              onClick={handleCompleteSale}
              disabled={!canCompleteSale || processing}
              className="flex-1 rounded-lg bg-[#6b3f2a] py-3 font-semibold text-white transition hover:bg-[#4a2c20] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {processing
                ? 'Completing Sale...'
                : 'Complete Sale'}
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#4a2c20]">
            Order Summary
          </h2>

          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3"
              >
                <img
                  src={
                    item.product.imageUrl.startsWith('http')
                      ? item.product.imageUrl
                      : `${import.meta.env.VITE_API_URL}${item.product.imageUrl}`
                  }
                  alt={item.product.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#4a2c20]">
                    {item.product.name}
                  </p>

                  <p className="text-xs text-[#7a6258]">
                    {item.quantity} × KSh{' '}
                    {item.product.price.toLocaleString()}
                  </p>
                </div>

                <span className="text-sm font-bold text-[#4a2c20]">
                  KSh{' '}
                  {(
                    item.product.price * item.quantity
                  ).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-[#e2d5cc] pt-5">
            <div className="flex items-center justify-between">
              <span className="text-[#7a6258]">
                Total
              </span>

              <span className="text-2xl font-bold text-[#4a2c20]">
                KSh {total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {mpesaOpen && (
        <MpesaPayment
          amount={total}
          onClose={() => setMpesaOpen(false)}
          onPaid={handleMpesaPayment}
        />
      )}
    </div>
  )
}

export default Checkout