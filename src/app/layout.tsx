import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lightwalker™ - Your Ideal Future Self',
  description: 'Human development as easy as copying from the smartest kid in class',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {children}
        </div>
      </body>
    </html>
  )
}