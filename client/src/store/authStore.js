import { create } from 'zustand'

import api, { setUnauthorizedHandler } from '../lib/api'
import { getErrorMessage } from '../lib/utils'

let sessionRequest = null

export const useAuthStore = create((set, get) => ({
  user: null,
  status: 'idle', // idle | loading | authenticated | guest
  error: null,

  checkSession: async () => {
    const { status } = get()

    if (status === 'authenticated') return true
    if (sessionRequest) return sessionRequest

    set({ status: 'loading', error: null })

    sessionRequest = api
      .get('/admin/me')
      .then(({ data }) => {
        set({ user: data.data, status: 'authenticated', error: null })
        return true
      })
      .catch(() => {
        set({ user: null, status: 'guest' })
        return false
      })
      .finally(() => {
        sessionRequest = null
      })

    return sessionRequest
  },

  login: async (email, password) => {
    set({ error: null })

    try {
      const { data } = await api.post('/admin/login', { email, password })
      set({ user: data.data, status: 'authenticated', error: null })
      return data.data
    } catch (error) {
      set({ user: null, status: 'guest', error: getErrorMessage(error) })
      throw error
    }
  },

  logout: async () => {
    try {
      await api.post('/admin/logout')
    } catch {
      // The local session is cleared even if the server call fails.
    }

    set({ user: null, status: 'guest', error: null })
  },

  clearError: () => set({ error: null }),
}))

setUnauthorizedHandler(() => {
  const { status } = useAuthStore.getState()
  if (status === 'authenticated') {
    useAuthStore.setState({ user: null, status: 'guest' })
  }
})
