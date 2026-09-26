import type { CartItem } from '../types/Product'

interface CartProps {
  items: CartItem[]
  onClose: () => void
  onIncrease: (productId: number) => void
  onDecrease: (productId: number) => void
  onCheckout: () => void
}

function Cart({
  items,
  onClose,
  onIncrease,
  onDecrease,
  onCheckout,
}: CartProps) {
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl
    }

    return `${import.meta.env.VITE_API_URL}${imageUrl}`
  }

  return (
    <aside className="fixed right-0 top-0 z-40 flex h-screen w-80 flex-col bg-white shadow-2xl">
      <div className="flex shrink-0 items-center justify-between border-b border-[#e2d5cc] px-4 py-4">
        <h2 className="text-xl font-bold text-[#4a2c20]">
          Cart
        </h2>

        <button
          onClick={onClose}
          className="text-2xl text-[#7a6258] transition hover:text-[#4a2c20]"
          aria-label="Close cart"
        >
          ×
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4">
            <p className="text-sm text-[#7a6258]">
              Your cart is empty
            </p>
          </div>
        ) : (
          <div>
            {items.map((item, index) => {
              const subtotal =
                item.product.price * item.quantity

              return (
                <div
                  key={item.product.id}
                  className={`px-3 py-3 ${
                    index % 2 === 0
                      ? 'bg-[#faf7f4]'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[#4a2c20]">
                        {item.product.name}
                      </p>

                      <p className="text-[11px] text-[#7a6258]">
                        KSh {item.product.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() =>
                          onDecrease(item.product.id)
                        }
                        className="flex h-6 w-6 items-center justify-center rounded border border-[#d8c8bd] text-xs text-[#4a2c20] transition hover:bg-[#f5f0e8]"
                      >
                        −
                      </button>

                      <span className="w-4 text-center text-xs font-semibold text-[#4a2c20]">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          onIncrease(item.product.id)
                        }
                        className="flex h-6 w-6 items-center justify-center rounded bg-[#6b3f2a] text-xs text-white transition hover:bg-[#4a2c20]"
                      >
                        +
                      </button>
                    </div>

                    <span className="w-16 shrink-0 text-right text-xs font-bold text-[#4a2c20]">
                      KSh {subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#e2d5cc] bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-[#7a6258]">
            Total
          </span>

          <span className="text-lg font-bold text-[#4a2c20]">
            KSh {total.toLocaleString()}
          </span>
        </div>

        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full rounded-lg bg-[#6b3f2a] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a2c20] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Proceed to Checkout
        </button>
      </div>
    </aside>
  )
}

export default Cart