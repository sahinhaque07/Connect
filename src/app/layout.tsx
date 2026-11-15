import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Shell from '@/components/Shell'

const font = Plus_Jakarta_Sans({ subsets: ['latin'] })
export const metadata: Metadata = { title: 'Connect', description: 'Share • Explore • Belong' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${font.className} min-h-screen bg-bg text-white antialiased`}>
        <Suspense fallback={null}><Shell>{children}</Shell></Suspense>
      </body>
    </html>
  )
}