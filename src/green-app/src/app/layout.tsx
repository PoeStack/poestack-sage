import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'react-toastify/dist/ReactToastify.css'
import '../assets/toastify.css'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ProfileMenu } from '@/components/profile-menu'
import { Providers } from '@/components/providers'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
dayjs.extend(relativeTime)
dayjs.extend(utc)

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PoeStack - Bulk',
  description: 'Sell and buy items easily.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.className)}>
        <Providers>
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="w-full px-2 flex h-14 items-center justify-between">
              <div className="flex basis-1/3" />
              <div className="flex justify-center">
                <Button variant="link" asChild>
                  <Link href={'/listing-tool'}>Bulk Offerings</Link>
                </Button>
                <Button variant="link" asChild>
                  <Link href={'/listings'}>Bulk Listings</Link>
                </Button>
              </div>
              <div className="flex flex-row basis-1/3 gap-2 justify-end">
                <ProfileMenu />
              </div>
            </div>
          </header>
          <main className="flex flex-col p-4 gap-2 lg:gap-4">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
