import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Cart from '../components/Cart'
import { productService } from '../services/productService'
import type { CartItem, Product } from '../types/Product'

function Products() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await productService.getProducts()

        setProducts(data)
      } catch {
        setError('Failed to load products.')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

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
    if (cartItems.length === 0) {
      return
    }

    navigate('/checkout', {
      state: {
        items: cartItems,
      },
    })
  }

  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl
    }

    return `${import.meta.env.VITE_API_URL}${imageUrl}`
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
          onChange={(event) =>
            setSearchTerm(event.currentTarget.value)
          }
          placeholder="Search products..."
          className="w-full rounded-lg border border-[#d8c8bd] bg-white px-4 py-3 text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
        />
      </div>

      {loading && (
        <div className="rounded-xl bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-[#7a6258]">
            Loading products...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl bg-white px-6 py-12 text-center shadow-sm">
          <p className="font-semibold text-red-600">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="rounded-xl bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#4a2c20]">
            No products found
          </p>

          <p className="mt-2 text-sm text-[#7a6258]">
            Try searching for a different product name.
          </p>
        </div>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
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
                  src={getImageUrl(product.imageUrl)}
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
                  disabled={product.stock === 0}
                  className="mt-3 w-full rounded-lg bg-[#6b3f2a] py-2.5 font-semibold text-white transition hover:bg-[#4a2c20] disabled:cursor-not-allowed disabled:opacity-40"
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