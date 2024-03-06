import Navbar from '@/components/navbar'
import { ProfileMenu } from '@/components/profile-menu'
import { Providers } from '@/components/providers'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import 'react-toastify/dist/ReactToastify.css'
import poestackPic from '../assets/poestack.png'
import '../assets/toastify.css'
import './globals.css'

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
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
              <div className="flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <Image
                    src={poestackPic}
                    alt="poestack"
                    width={24}
                    height={24}
                    className="block h-6 min-h-fit min-w-fit shrink-0"
                    sizes="33vw"
                    style={{ width: 'auto', height: '24px' }}
                  />
                  <span>PoeStack</span>
                </div>
                <Navbar />
              </div>
              <div className="flex flex-row gap-2 justify-end">
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
