import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getAccessToken } from '../lib/authStorage'

export default function ProtectedRoute() {
  const location = useLocation()
  const token = getAccessToken()

  if (!token) {
    return <Navigate to="/giris" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
