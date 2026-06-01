import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'CRM Dashboard',
  description: 'CRM Dashboard'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased dark`}
    >
      <body className="h-full bg-[var(--cf-bg)] text-[var(--cf-text)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
