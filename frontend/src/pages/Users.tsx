import { useCallback, useEffect, useMemo, useState } from 'react'
import userService from '../services/userService'
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/User'

type UserForm = {
  fullName: string
  username: string
  password: string
  role: 'Admin' | 'Cashier'
}

const emptyForm: UserForm = {
  fullName: '',
  username: '',
  password: '',
  role: 'Cashier',
}

const inputClass =
  'w-full rounded-lg border border-[#e5d8ca] bg-white px-3 py-2.5 text-sm text-[#4a2c20] outline-none transition focus:border-[#6b3f2a] focus:ring-2 focus:ring-[#6b3f2a]/10'

const labelClass = 'mb-1.5 block text-sm font-medium text-[#4a2c20]'

function getErrorMessage(error: unknown): string {
  const response = error as {
    response?: { data?: { message?: string; title?: string } }
  }

  return (
    response.response?.data?.message ||
    response.response?.data?.title ||
    'Something went wrong. Please try again.'
  )
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<UserForm>(emptyForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await userService.getUsers()
      setUsers(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return users

    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query),
    )
  }, [users, search])

  const adminCount = users.filter((user) => user.role === 'Admin').length
  const cashierCount = users.filter((user) => user.role === 'Cashier').length

  function openCreateForm() {
    setEditingUser(null)
    setForm(emptyForm)
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function openEditForm(user: User) {
    setEditingUser(user)
    setForm({
      fullName: user.fullName,
      username: user.username,
      password: '',
      role: user.role,
    })
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function closeForm() {
    if (saving) return
    setShowForm(false)
    setEditingUser(null)
    setForm(emptyForm)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.fullName.trim() || !form.username.trim()) {
      setError('Full name and username are required.')
      return
    }

    if (!editingUser && !form.password.trim()) {
      setError('Password is required for a new user.')
      return
    }

    if (form.password && form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSaving(true)

    try {
      if (editingUser) {
        const request: UpdateUserRequest = {
          fullName: form.fullName.trim(),
          username: form.username.trim(),
          password: form.password,
          role: form.role,
        }

        await userService.updateUser(editingUser.id, request)
        setSuccess('User updated successfully.')
      } else {
        const request: CreateUserRequest = {
          fullName: form.fullName.trim(),
          username: form.username.trim(),
          password: form.password,
          role: form.role,
        }

        await userService.createUser(request)
        setSuccess('User created successfully.')
      }

      setShowForm(false)
      setEditingUser(null)
      setForm(emptyForm)
      await loadUsers()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(user: User) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.fullName}?`,
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      await userService.deleteUser(user.id)
      setUsers((current) => current.filter((item) => item.id !== user.id))
      setSuccess(`${user.fullName} was deleted successfully.`)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="min-h-full bg-[#f5f0e8] p-4 text-[#4a2c20] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-sm font-medium text-[#8b6b57]">
              Administration
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              User Management
            </h1>
            <p className="mt-2 text-sm text-[#8b6b57]">
              Create, update and manage your shop's staff accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6b3f2a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4a2c20]"
          >
            <span className="text-lg leading-none">+</span>
            Add User
          </button>
        </div>

        {error && !showForm && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              className="font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <span>{success}</span>
            <button
              type="button"
              onClick={() => setSuccess('')}
              className="font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#e7dbcd] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#8b6b57]">Total users</p>
            <p className="mt-2 text-3xl font-bold">{users.length}</p>
            <p className="mt-1 text-xs text-[#8b6b57]">Registered accounts</p>
          </div>

          <div className="rounded-xl border border-[#e7dbcd] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#8b6b57]">Administrators</p>
            <p className="mt-2 text-3xl font-bold">{adminCount}</p>
            <p className="mt-1 text-xs text-[#8b6b57]">Admin accounts</p>
          </div>

          <div className="rounded-xl border border-[#e7dbcd] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#8b6b57]">Cashiers</p>
            <p className="mt-2 text-3xl font-bold">{cashierCount}</p>
            <p className="mt-1 text-xs text-[#8b6b57]">Cashier accounts</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#e7dbcd] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#eee4d9] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="font-semibold">All users</h2>
              <p className="mt-1 text-sm text-[#8b6b57]">
                {filteredUsers.length} of {users.length} users
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, username or role..."
                className={inputClass}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-56 items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-[#8b6b57]">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#e7dbcd] border-t-[#6b3f2a]" />
                Loading users...
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f0e8] text-xl">
                <span>♙</span>
              </div>
              <h3 className="font-semibold">
                {search ? 'No users found' : 'No users yet'}
              </h3>
              <p className="mt-1 text-sm text-[#8b6b57]">
                {search
                  ? 'Try a different search term.'
                  : 'Add a user to get started.'}
              </p>
              {!search && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-4 text-sm font-semibold text-[#6b3f2a] hover:underline"
                >
                  Add your first user
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-[#faf7f2] text-xs uppercase tracking-wide text-[#8b6b57]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">User</th>
                    <th className="px-5 py-4 font-semibold">Username</th>
                    <th className="px-5 py-4 font-semibold">Role</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee4d9]">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="transition hover:bg-[#fdfbf8]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eee2d4] font-bold text-[#6b3f2a]">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{user.fullName}</p>
                            <p className="mt-0.5 text-xs text-[#8b6b57]">
                              User ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#6b5142]">
                        @{user.username}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            user.role === 'Admin'
                              ? 'bg-[#eee2d4] text-[#6b3f2a]'
                              : 'bg-[#e8efe6] text-[#42633f]'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(user)}
                            className="rounded-lg border border-[#e5d8ca] px-3 py-2 text-xs font-semibold text-[#6b3f2a] transition hover:bg-[#f5f0e8]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(user)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-[#eee4d9] bg-[#faf7f2] px-5 py-3 text-xs text-[#8b6b57]">
            User accounts and roles
          </div>
        </div>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm()
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-form-title"
            className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-[#eee4d9] p-5 sm:p-6">
              <div>
                <h2 id="user-form-title" className="text-xl font-bold">
                  {editingUser ? 'Edit user' : 'Add new user'}
                </h2>
                <p className="mt-1 text-sm text-[#8b6b57]">
                  {editingUser
                    ? 'Update account details and permissions.'
                    : 'Create a staff account for your shop.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg px-2 py-1 text-xl text-[#8b6b57] hover:bg-[#f5f0e8]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="fullName" className={labelClass}>
                  Full name
                </label>
                <input
                  id="fullName"
                  value={form.fullName}
                  onChange={(event) =>
                    setForm({ ...form, fullName: event.target.value })
                  }
                  className={inputClass}
                  placeholder="Enter full name"
                  required
                  maxLength={150}
                />
              </div>

              <div>
                <label htmlFor="username" className={labelClass}>
                  Username
                </label>
                <input
                  id="username"
                  value={form.username}
                  onChange={(event) =>
                    setForm({ ...form, username: event.target.value })
                  }
                  className={inputClass}
                  placeholder="Enter username"
                  required
                  maxLength={50}
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>
                  Password {editingUser && '(optional)'}
                </label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  className={inputClass}
                  placeholder={
                    editingUser
                      ? 'Leave blank to keep current password'
                      : 'Enter password'
                  }
                  required={!editingUser}
                  minLength={6}
                  autoComplete="new-password"
                />
                <p className="mt-1.5 text-xs text-[#8b6b57]">
                  {editingUser
                    ? 'Only enter a password if you want to change it.'
                    : 'Use at least 6 characters.'}
                </p>
              </div>

              <div>
                <label htmlFor="role" className={labelClass}>
                  User role
                </label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      role: event.target.value as 'Admin' | 'Cashier',
                    })
                  }
                  className={inputClass}
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Admin">Admin</option>
                </select>
                <p className="mt-1.5 text-xs text-[#8b6b57]">
                  Role selection does not enforce access restrictions by itself.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#eee4d9] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-[#e5d8ca] px-5 py-2.5 text-sm font-semibold text-[#6b3f2a] hover:bg-[#f5f0e8] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#6b3f2a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4a2c20] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? 'Saving...'
                    : editingUser
                      ? 'Save changes'
                      : 'Create user'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}