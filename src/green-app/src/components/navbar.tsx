'use client'

import { usePathname } from 'next/navigation'
import { Link } from './ui/link'

const Navbar = () => {
  const pathname = usePathname()

  return (
    <>
      <nav className="flex items-center gap-6 text-sm">
        <Link
          href={'/listing-tool'}
          variant="navbar"
          selected={pathname.includes('/listing-tool')}
        >
          Bulk Offerings
        </Link>
        <Link href={'/listings'} variant="navbar" selected={pathname.includes('/listings')}>
          Bulk Listings
        </Link>
      </nav>
    </>
  )
}

export default Navbar
