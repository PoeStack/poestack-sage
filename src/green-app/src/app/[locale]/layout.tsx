import Navbar from '@/components/navbar'
import { ProfileMenu } from '@/components/profile-menu'
import { Providers } from '@/components/providers'
import TranslationsProvider from '@/components/translations-provider'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import { dir } from 'i18next'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import 'react-toastify/dist/ReactToastify.css'
import poestackPic from '../../assets/poestack.png'
import '../../assets/toastify.css'
import initTranslations, { i18nConfig } from '../../config/i18n.config'
import './globals.css'

dayjs.extend(relativeTime)
dayjs.extend(utc)

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PoeStack - Bulk',
  description: 'Sell and buy items easily.'
}

export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode
  params: { locale: string }
}>) {
  const { t, resources } = await initTranslations(locale)

  return (
    <html lang={locale} dir={dir(locale)}>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.className)}>
        <Providers>
          <TranslationsProvider locale={locale} resources={resources}>
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
                <div className="flex justify-center gap-12">
                  <div className="flex items-center gap-2 shrink-0 font-bold">
                    <Image
                      src={poestackPic}
                      alt="poestack"
                      width={36}
                      height={36}
                      sizes="33vw"
                      style={{ width: 'auto', height: '36px', objectFit: 'contain', flexShrink: 0 }}
                    />

                    <div>{t('title.appTitle')}</div>
                  </div>
                  <Navbar />
                </div>
                <div className="flex flex-row gap-2 items-center justify-end">
                  <ProfileMenu />
                </div>
              </div>
            </header>
            <main className="flex flex-col p-4 gap-2 lg:gap-4">{children}</main>
          </TranslationsProvider>
        </Providers>
      </body>
    </html>
  )
}
