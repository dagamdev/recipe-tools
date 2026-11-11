import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', weight: ['600', '700'] })

export const metadata: Metadata = {
  title: { default: 'Escandallo', template: '%s · Escandallo' },
  description: 'Calcula el costo de tus recetas a partir de lo que pagas por cada insumo.'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F6F2' },
    { media: '(prefers-color-scheme: dark)', color: '#101512' }
  ]
}

export default function RootLayout ({ children }: { children: React.ReactNode }) {
  return (
    <html lang='es' className={`${inter.variable} ${bricolage.variable}`}>
      <body className='min-h-dvh antialiased'>{children}</body>
    </html>
  )
}
