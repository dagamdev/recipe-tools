// Preferencia de tema: 'system' (por defecto), 'light' o 'dark'.
// Se guarda en una cookie para que el servidor mande el HTML con el tema ya aplicado (sin parpadeo).

export type ThemePreference = 'system' | 'light' | 'dark'

export const THEME_COOKIE = 'escandallo-theme'
const CHANGE_EVENT = 'escandallo-theme-change'
const ONE_YEAR = 60 * 60 * 24 * 365
export const THEME_COLORS = { light: '#F5F6F2', dark: '#101512' }

export function parseThemePreference (value: string | undefined | null): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system'
}

export function readThemePreference (): ThemePreference {
  const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`))
  return parseThemePreference(match?.[1])
}

// Aplica el tema a <html> y a la barra del navegador (theme-color)
export function applyTheme (preference: ThemePreference) {
  const root = document.documentElement
  if (preference === 'system') delete root.dataset.theme
  else root.dataset.theme = preference

  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(meta => {
    // La media original se guarda para poder volver a "Sistema"
    meta.dataset.media ??= meta.media
    const media = meta.dataset.media
    if (preference === 'system' && media !== '') {
      meta.media = media
      meta.content = media.includes('dark') ? THEME_COLORS.dark : THEME_COLORS.light
    } else if (preference === 'system') {
      meta.content = window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME_COLORS.dark : THEME_COLORS.light
    } else {
      meta.media = ''
      meta.content = THEME_COLORS[preference]
    }
  })
}

export function setThemePreference (preference: ThemePreference) {
  document.cookie = preference === 'system'
    ? `${THEME_COOKIE}=; path=/; max-age=0; samesite=lax`
    : `${THEME_COOKIE}=${preference}; path=/; max-age=${ONE_YEAR}; samesite=lax`
  applyTheme(preference)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function subscribeTheme (callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback)
  return () => { window.removeEventListener(CHANGE_EVENT, callback) }
}
