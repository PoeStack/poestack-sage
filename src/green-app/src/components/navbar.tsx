'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navbar = () => {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-6 text-sm">
      <Link
        className={cn(
          'transition-colors hover:text-foreground/80 text-foreground/60',
          pathname.startsWith('/listing-tool') && 'text-foreground'
        )}
        href={'/listing-tool'}
      >
        Bulk Offerings
      </Link>
      <Link
        className={cn(
          'transition-colors hover:text-foreground/80 text-foreground/60',
          pathname.startsWith('/listings') && 'text-foreground'
        )}
        href={'/listings'}
      >
        Bulk Listings
      </Link>
    </nav>
  )
}

export default Navbar
