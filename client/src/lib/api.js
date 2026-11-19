import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 30000,
})

let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''

    // A failed login is not an expired session — leave the form in control.
    if (status === 401 && !url.includes('/admin/login')) {
      unauthorizedHandler?.()
    }

    return Promise.reject(error)
  },
)

export default api
