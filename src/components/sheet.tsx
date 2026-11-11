'use client'

import { useEffect, useRef } from 'react'
import { CloseIcon } from './icons'
import { iconButton } from './ui'

// Hoja inferior accesible: usa <dialog> nativo (foco, Escape y fondo incluidos)
export function Sheet ({ open, onClose, title, children }: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (dialog === null) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className='sheet'
      aria-label={title}
      onClose={onClose}
      onClick={event => {
        // Cerrar al tocar el fondo
        if (event.target === ref.current) onClose()
      }}
    >
      {open && (
        <div className='flex flex-col gap-5 px-5 pt-2.5 pb-[max(1.75rem,env(safe-area-inset-bottom))]'>
          <div aria-hidden='true' className='mx-auto h-1.5 w-10 rounded-full bg-line sm:hidden' />
          <div className='flex items-center justify-between gap-3'>
            <h2 className='font-display text-[22px] font-bold'>{title}</h2>
            <button type='button' onClick={onClose} aria-label='Cerrar' className={`${iconButton} bg-surface-2`}>
              <CloseIcon size={18} />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
