'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { buttonPrimary, buttonSecondary, Field, FormError, inputBase } from '@/components/ui'

type Mode = 'signIn' | 'signUp'

export function LoginForm ({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signIn')
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    const name = String(form.get('name') ?? '').trim()

    setPending(true)
    setError(undefined)
    const { error: authError } = mode === 'signIn'
      ? await authClient.signIn.email({ email, password })
      : await authClient.signUp.email({ email, password, name: name === '' ? email.split('@')[0] : name })
    setPending(false)

    if (authError !== null) {
      setError(translateError(authError.code, authError.message))
      return
    }
    router.replace('/')
    router.refresh()
  }

  return (
    <div className='flex flex-col gap-5'>
      <div role='tablist' aria-label='Acceso' className='grid grid-cols-2 gap-1 rounded-2xl bg-surface-2 p-1'>
        {(['signIn', 'signUp'] as const).map(m => (
          <button key={m} type='button' role='tab' aria-selected={mode === m}
            onClick={() => { setMode(m); setError(undefined) }}
            className={`h-11 rounded-xl text-sm font-semibold transition ${mode === m ? 'bg-surface text-ink shadow-sm' : 'text-muted'}`}>
            {m === 'signIn' ? 'Entrar' : 'Crear cuenta'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        {mode === 'signUp' && (
          <Field label='Nombre' htmlFor='name'>
            <input id='name' name='name' autoComplete='name' className={inputBase} />
          </Field>
        )}
        <Field label='Correo' htmlFor='email'>
          <input id='email' name='email' type='email' required autoComplete='email' inputMode='email' className={inputBase} />
        </Field>
        <Field label='Contraseña' htmlFor='password' hint={mode === 'signUp' ? 'Mínimo 8 caracteres' : undefined}>
          <input id='password' name='password' type='password' required minLength={8}
            autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'} className={inputBase} />
        </Field>
        <FormError message={error} />
        <button type='submit' disabled={pending} className={buttonPrimary}>
          {pending ? 'Un momento…' : mode === 'signIn' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>

      {googleEnabled && (
        <button type='button' className={buttonSecondary}
          onClick={() => { void authClient.signIn.social({ provider: 'google', callbackURL: '/' }) }}>
          Continuar con Google
        </button>
      )}
    </div>
  )
}

function translateError (code: string | undefined, fallback: string | undefined): string {
  switch (code) {
    case 'INVALID_EMAIL_OR_PASSWORD': return 'Correo o contraseña incorrectos.'
    case 'USER_ALREADY_EXISTS':
    case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL': return 'Ya existe una cuenta con ese correo.'
    case 'PASSWORD_TOO_SHORT': return 'La contraseña debe tener al menos 8 caracteres.'
    case 'INVALID_EMAIL': return 'Ese correo no es válido.'
    default: return fallback ?? 'No se pudo completar. Intenta de nuevo.'
  }
}
