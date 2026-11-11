'use client'

import { useEffect, useState } from 'react'
import { buttonPrimary } from '@/components/ui'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Mode = 'hidden' | 'prompt' | 'ios'

// Ofrece instalar la app: botón en Android/Chrome, instrucciones en iPhone
export function InstallApp () {
  const [mode, setMode] = useState<Mode>('hidden')
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    if (standalone) return

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    // Se decide después del montaje porque depende del navegador
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isIos) setMode('ios')

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
      setMode('prompt')
    }
    const onInstalled = () => { setMode('hidden') }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (mode === 'hidden') return null

  return (
    <section className='flex flex-col gap-3 rounded-[20px] border border-line bg-surface p-4'>
      <div className='flex flex-col gap-1'>
        <h2 className='font-display text-lg font-bold'>Instala Escandallo</h2>
        <p className='text-sm text-muted'>Ábrela desde tu pantalla de inicio como cualquier otra app.</p>
      </div>
      {mode === 'prompt' && deferred !== null && (
        <button type='button' className={buttonPrimary}
          onClick={async () => {
            await deferred.prompt()
            const { outcome } = await deferred.userChoice
            if (outcome === 'accepted') setMode('hidden')
            setDeferred(null)
          }}>
          Instalar app
        </button>
      )}
      {mode === 'ios' && (
        <ol className='flex list-decimal flex-col gap-1 pl-5 text-sm'>
          <li>Abre esta página en Safari.</li>
          <li>Toca el botón <strong>Compartir</strong>.</li>
          <li>Elige <strong>Agregar a inicio</strong>.</li>
        </ol>
      )}
    </section>
  )
}
