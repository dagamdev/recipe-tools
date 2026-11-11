// Preferencia de tema guardada en este dispositivo: 'system' (por defecto), 'light' o 'dark'

export type ThemePreference = 'system' | 'light' | 'dark'

export const THEME_STORAGE_KEY = 'escandallo-theme'
const CHANGE_EVENT = 'escandallo-theme-change'
const THEME_COLORS = { light: '#F5F6F2', dark: '#101512' }

// Script que corre antes de pintar para evitar el parpadeo del tema equivocado
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}})()`

export function readThemePreference (): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

// Aplica el tema a <html> y a la barra del navegador (theme-color)
export function applyTheme (preference: ThemePreference) {
  const root = document.documentElement
  if (preference === 'system') delete root.dataset.theme
  else root.dataset.theme = preference

  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(meta => {
    const media = meta.dataset.media ?? meta.media
    meta.dataset.media = media
    if (preference === 'system') {
      meta.media = media
      meta.content = media.includes('dark') ? THEME_COLORS.dark : THEME_COLORS.light
    } else {
      meta.media = ''
      meta.content = THEME_COLORS[preference]
    }
  })
}

export function setThemePreference (preference: ThemePreference) {
  try {
    if (preference === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
    else localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // Sin almacenamiento el cambio dura solo esta visita
  }
  applyTheme(preference)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function subscribeTheme (callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      applyTheme(readThemePreference())
      callback()
    }
  }
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener('storage', onStorage)
  }
}
