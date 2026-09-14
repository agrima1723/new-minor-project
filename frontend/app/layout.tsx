import './globals.css'

export const metadata = {
  title: 'AlgoLens',
  description: 'Real-World Scenario to DSA Mapper',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
