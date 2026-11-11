import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Inter } from 'next/font/google'
import { RegisterServiceWorker } from '@/components/register-sw'
import { THEME_COLORS } from '@/lib/theme'
import { getThemePreference } from '@/lib/theme-server'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', weight: ['600', '700'] })

export const metadata: Metadata = {
  title: { default: 'Escandallo', template: '%s · Escandallo' },
  description: 'Calcula el costo de tus recetas a partir de lo que pagas por cada insumo.',
  applicationName: 'Escandallo',
  // Instalación en iPhone: pantalla completa y nombre bajo el icono
  appleWebApp: { capable: true, title: 'Escandallo', statusBarStyle: 'default' },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }, { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }]
  },
  formatDetection: { telephone: false }
}

// El color de la barra del navegador sigue la preferencia guardada, o al sistema
export async function generateViewport (): Promise<Viewport> {
  const theme = await getThemePreference()
  return {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    themeColor: theme === 'system'
      ? [
          { media: '(prefers-color-scheme: light)', color: THEME_COLORS.light },
          { media: '(prefers-color-scheme: dark)', color: THEME_COLORS.dark }
        ]
      : THEME_COLORS[theme]
  }
}

export default async function RootLayout ({ children }: { children: React.ReactNode }) {
  // El tema elegido llega en una cookie: el HTML sale ya con data-theme, sin script ni parpadeo
  const theme = await getThemePreference()

  return (
    <html lang='es' className={`${inter.variable} ${bricolage.variable}`} data-theme={theme === 'system' ? undefined : theme}>
      <body className='min-h-dvh antialiased'>
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  )
}
