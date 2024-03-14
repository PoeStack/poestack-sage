'use client'

import { usePathname } from 'next/navigation'
import { Link } from './ui/link'
import { useTranslation } from 'react-i18next'

const Navbar = () => {
  const { t } = useTranslation()
  const pathname = usePathname()

  return (
    <>
      <nav className="flex items-center gap-6 text-sm">
        <Link href={'/listing-tool'} variant="navbar" selected={pathname.includes('/listing-tool')}>
          {t('action.bulkOfferingsPage')}
        </Link>
        <Link href={'/listings'} variant="navbar" selected={pathname.includes('/listings')}>
          {t('action.bulkListingsPage')}
        </Link>
      </nav>
    </>
  )
}

export default Navbar
