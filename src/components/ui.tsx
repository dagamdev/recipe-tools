// Piezas de interfaz compartidas (sin librería de componentes)

export function cx (...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export const buttonPrimary = 'inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 text-base font-semibold text-brand-ink transition active:scale-[0.99] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
export const buttonSecondary = 'inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-4 text-sm font-semibold text-ink transition active:scale-[0.99] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
export const buttonDanger = 'inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-bad transition hover:bg-bad-soft disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bad'
export const iconButton = 'inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink transition hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
export const inputBase = 'h-13 w-full min-w-0 rounded-2xl border border-line bg-surface px-4 text-base text-ink placeholder:text-muted outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20'

export function Field ({ label, hint, children, htmlFor }: {
  label: string
  hint?: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-baseline justify-between gap-3'>
        <label htmlFor={htmlFor} className='text-sm font-semibold'>{label}</label>
        {hint !== undefined && <span className='text-right text-xs text-muted'>{hint}</span>}
      </div>
      {children}
    </div>
  )
}

export function FormError ({ message }: { message?: string }) {
  if (message === undefined) return null
  return <p role='alert' className='rounded-xl bg-bad-soft px-3 py-2 text-sm text-bad-soft-ink'>{message}</p>
}

export type Tone = 'good' | 'warn' | 'bad' | 'neutral'

const badgeTones: Record<Tone, string> = {
  good: 'bg-brand-soft text-brand-soft-ink',
  warn: 'bg-warn-soft text-warn-soft-ink',
  bad: 'bg-bad-soft text-bad-soft-ink',
  neutral: 'bg-surface-2 text-muted'
}

export function Badge ({ tone, children }: { tone: Tone, children: React.ReactNode }) {
  return <span className={cx('num inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold', badgeTones[tone])}>{children}</span>
}

export function EmptyState ({ title, children }: { title: string, children?: React.ReactNode }) {
  return (
    <div className='flex flex-col items-center gap-2 rounded-3xl border border-dashed border-line px-6 py-10 text-center'>
      <p className='font-display text-lg font-bold'>{title}</p>
      {children !== undefined && <div className='text-sm text-muted'>{children}</div>}
    </div>
  )
}
