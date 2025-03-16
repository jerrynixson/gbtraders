import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GB Trader',
  description: 'Best car deals online',
  generator: 'JAB Developers',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
