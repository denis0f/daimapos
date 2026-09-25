// src/components/MpesaPayment.tsx

import { useState } from 'react'
import { productService } from '../services/productService'

interface MpesaPaymentProps {
  amount: number
  onClose: () => void
  onPaid: (
    name: string,
    phone: string,
    transactionId: string
  ) => void
}

function MpesaPayment({
  amount,
  onClose,
  onPaid,
}: MpesaPaymentProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handlePay = async () => {
    if (!name.trim() || !phone.trim()) {
      return
    }

    try {
      setProcessing(true)
      setError('')

      const response = await productService.payWithMpesa({
        customerName: name.trim(),
        phoneNumber: phone.trim(),
        amount,
      })

      onPaid(
        name.trim(),
        phone.trim(),
        response.transactionId
      )
    } catch {
      setError('M-Pesa payment could not be initiated.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#4a2c20]">
              M-Pesa Payment
            </h2>

            <p className="mt-1 text-sm text-[#7a6258]">
              Enter the customer's details.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-[#7a6258] transition hover:text-[#4a2c20]"
            aria-label="Close M-Pesa payment"
          >
            ×
          </button>
        </div>

        <div className="mt-6 rounded-xl bg-[#f5f0e8] p-5 text-center">
          <p className="text-sm text-[#7a6258]">
            Amount to Pay
          </p>

          <p className="mt-1 text-3xl font-bold text-[#4a2c20]">
            KSh {amount.toLocaleString()}
          </p>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
            Customer Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.currentTarget.value)
            }
            placeholder="Enter customer name"
            className="w-full rounded-lg border border-[#d8c8bd] px-4 py-3 text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
            Phone Number
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(event.currentTarget.value)
            }
            placeholder="07XXXXXXXX"
            className="w-full rounded-lg border border-[#d8c8bd] px-4 py-3 text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
          />
        </div>

        {error && (
          <p className="mt-4 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 rounded-lg border border-[#d8c8bd] py-3 font-semibold text-[#4a2c20] transition hover:bg-[#f5f0e8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handlePay}
            disabled={
              !name.trim() ||
              !phone.trim() ||
              processing
            }
            className="flex-1 rounded-lg bg-[#6b3f2a] py-3 font-semibold text-white transition hover:bg-[#4a2c20] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {processing ? 'Processing...' : 'Pay'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MpesaPayment