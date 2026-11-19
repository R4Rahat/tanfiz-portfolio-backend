export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function getErrorMessage(error, fallback = 'Something went wrong') {
  const data = error?.response?.data

  if (typeof data === 'string' && data.trim()) return data
  if (data?.message) return data.message
  if (data?.error) return data.error
  if (error?.code === 'ECONNABORTED') return 'The request timed out. Please try again.'
  if (error?.message === 'Network Error') {
    return 'Cannot reach the server. Make sure the API is running.'
  }
  return error?.message || fallback
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function initials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'A'
  )
}

export function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function optimizedImage(url, width = 640) {
  if (!url) return ''
  if (!url.includes('ik.imagekit.io')) return url
  if (url.includes('tr=')) return url
  return `${url}${url.includes('?') ? '&' : '?'}tr=w-${width}`
}

export function parseRoles(value = '') {
  return value
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean)
}
