import './globals.css'

export const metadata = {
  title: 'Battery Calculator',
  description: 'Calculator for battery orders from China',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
