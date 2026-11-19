import { create } from 'zustand'

let counter = 0

export const useToastStore = create((set) => ({
  toasts: [],

  push: (message, type = 'success') => {
    const id = `${Date.now()}-${counter++}`
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }))
    }, 4200)

    return id
  },

  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))

export const toast = {
  success: (message) => useToastStore.getState().push(message, 'success'),
  error: (message) => useToastStore.getState().push(message, 'error'),
  info: (message) => useToastStore.getState().push(message, 'info'),
}
