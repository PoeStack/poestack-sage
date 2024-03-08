'use client'

import { cn } from '@/lib/utils'
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
          selected={pathname.startsWith('/listing-tool')}
        >
          Bulk Offerings
        </Link>
        <Link href={'/listings'} variant="navbar" selected={pathname.startsWith('/listings')}>
          Bulk Listings
        </Link>
        <Link
          href="https://discord.gg/path-of-exile-trading-530668348682403841"
          aria-label="discord"
          target="_blank"
          rel="noopener"
          variant="navbar"
          external
        >
          PoE Trading Discord
        </Link>
      </nav>
    </>
  )
}

export default Navbar
