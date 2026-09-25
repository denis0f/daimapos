import { NavLink, useNavigate } from 'react-router-dom'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const username = localStorage.getItem('username')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
  }

  const navItems = [
    {
      label: 'Products',
      path: '/products',
    },
    {
      label: 'Product Management',
      path: '/product-management',
    },
    {
      label: 'Statistics',
      path: '/stats',
    },
  ]

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col overflow-hidden bg-[#4a2c20] text-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#6b3f2a] px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold">
              DAIMAPOS
            </h1>

            <p className="mt-1 text-sm text-[#d8c8bd]">
              Management System
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-[#d8c8bd] lg:hidden"
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 overflow-hidden px-4 py-6">
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-3 transition ${
                    isActive
                      ? 'bg-[#8b5e3c] text-white'
                      : 'text-[#eadfd6] hover:bg-[#6b3f2a]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="shrink-0 border-t border-[#6b3f2a] p-4">
          <div className="mb-3 px-4">
            <p className="text-xs text-[#d8c8bd]">
              Signed in as
            </p>

            <p className="truncate font-medium">
              {username}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-4 py-3 text-left text-[#eadfd6] transition hover:bg-[#6b3f2a]"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar