import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from '../store/authStore'
import { FullPageLoader } from './ui/Spinner'

export default function ProtectedRoute() {
  const status = useAuthStore((state) => state.status)
  const checkSession = useAuthStore((state) => state.checkSession)
  const location = useLocation()

  useEffect(() => {
    if (status === 'idle') checkSession()
  }, [status, checkSession])

  if (status === 'idle' || status === 'loading') {
    return <FullPageLoader label="Checking your session…" />
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export function PublicOnly() {
  const status = useAuthStore((state) => state.status)
  const checkSession = useAuthStore((state) => state.checkSession)

  useEffect(() => {
    if (status === 'idle') checkSession()
  }, [status, checkSession])

  if (status === 'idle' || status === 'loading') {
    return <FullPageLoader label="Checking your session…" />
  }

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
