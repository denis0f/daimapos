import { useState } from 'react'
import Cart from '../components/Cart'
import type { CartItem, Product } from '../types/Product'

const products: Product[] = [
  {
    id: 1,
    name: 'Blue Band',
    price: 350,
    stock: 24,
    image: 'https://images.unsplash.com/photo-1606851094655-b2594a6a4f6b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    name: 'Milk',
    price: 120,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    name: 'Sugar',
    price: 500,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    name: 'Cooking Oil',
    price: 750,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    name: 'Rice',
    price: 280,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    name: 'Wheat Flour',
    price: 190,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?auto=format&fit=crop&w=600&q=80',
  },
]

function Products() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = products.filter((product) =>
    product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const addToCart = (product: Product) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id
      )

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, product.stock),
              }
            : item
        )
      }

      return [
        ...currentItems,
        {
          product,
          quantity: 1,
        },
      ]
    })

    setCartOpen(true)
  }

  const increaseQuantity = (productId: number) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: Math.min(
                item.quantity + 1,
                item.product.stock
              ),
            }
          : item
      )
    )
  }

  const decreaseQuantity = (productId: number) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const handleCheckout = () => {
    setCartOpen(false)
  }

  return (
    <div
      className={`min-w-0 ${
        cartOpen ? 'lg:pr-80' : ''
      }`}
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#4a2c20]">
            Products
          </h1>

          <p className="mt-2 text-[#7a6258]">
            Select products to add them to the cart.
          </p>
        </div>

        {!cartOpen && (
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#6b3f2a] text-white shadow-md transition hover:bg-[#4a2c20]"
            aria-label="Open cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 4h13M9 21h.01M18 21h.01"
              />
            </svg>

            {cartItems.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                {cartItems.length}
              </span>
            )}
          </button>
        )}
      </div>

      <div className="mb-8">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
          placeholder="Search products..."
          className="w-full rounded-lg border border-[#d8c8bd] bg-white px-4 py-3 text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-xl bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#4a2c20]">
            No products found
          </p>

          <p className="mt-2 text-sm text-[#7a6258]">
            Try searching for a different product name.
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${
            cartOpen
              ? 'lg:grid-cols-2 xl:grid-cols-3'
              : 'lg:grid-cols-3 xl:grid-cols-4'
          }`}
        >
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>

              <div className="p-4">
                <h2 className="text-center text-base font-semibold text-[#4a2c20]">
                  {product.name}
                </h2>

                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold text-[#6b3f2a]">
                    KSh {product.price.toLocaleString()}
                  </span>

                  <span className="text-sm text-[#7a6258]">
                    In stock: {product.stock}
                  </span>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className="mt-3 w-full rounded-lg bg-[#6b3f2a] py-2.5 font-semibold text-white transition hover:bg-[#4a2c20]"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cartOpen && (
        <Cart
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onIncrease={increaseQuantity}
          onDecrease={decreaseQuantity}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  )
}

export default Products