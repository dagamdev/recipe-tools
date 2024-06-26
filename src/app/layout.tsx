import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/header'
import { ThemeProvider } from '@/components/theme-provider'
import FormDialog from '@/components/form-dialog'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Recipe tools',
  description: 'Generated by create next app and developing by dagamdev',
  other: {
    viewport: 'width=device-width, user-scalable=no'
  }
}

export default function RootLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className='p-5 space-y-20 max-w-4xl mx-auto'>
            {children}
          </main>
          <FormDialog />
        </ThemeProvider>
      </body>
    </html>
  )
}
