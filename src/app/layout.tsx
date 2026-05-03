import type { Metadata } from 'next'
import { Cairo, Inter } from 'next/font/google'
import './globals.css'
import { UiProvider } from '@/context/UiContext'
import { getServerLang } from '@/lib/i18n'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Dourous-Net — دروس نت',
  description: 'Plateforme de cours particuliers en Algérie | Private tutoring platform in Algeria',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getServerLang()
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} ${cairo.className}`}>
        <UiProvider initialLang={lang as any}>{children}</UiProvider>
      </body>
    </html>
  )
}
