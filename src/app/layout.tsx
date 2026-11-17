import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Shell from '@/components/Shell'

const font = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Connect',
  description: 'Share • Explore • Belong',
  manifest: '/favicon/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${font.className} min-h-screen bg-bg text-white antialiased`}>
        <Suspense fallback={null}><Shell>{children}</Shell></Suspense>
      </body>
    </html>
  )
}