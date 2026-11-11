'use client'

import { useEffect } from 'react'

// Registra el service worker solo en producción (en desarrollo estorbaría con la recarga en caliente)
export function RegisterServiceWorker () {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Sin service worker la app funciona igual, solo sin página sin conexión
    })
  }, [])
  return null
}
