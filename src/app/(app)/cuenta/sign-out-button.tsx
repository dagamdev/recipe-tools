'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { buttonSecondary } from '@/components/ui'

export function SignOutButton () {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  return (
    <button type='button' disabled={pending} className={buttonSecondary}
      onClick={async () => {
        setPending(true)
        await authClient.signOut()
        router.replace('/login')
        router.refresh()
      }}>
      {pending ? 'Cerrando sesión…' : 'Cerrar sesión'}
    </button>
  )
}
