import { VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import React from 'react'
import NextLink from 'next/link'
import { Url } from 'next/dist/shared/lib/router/router'

const linkVariants = cva('', {
  variants: {
    variant: {
      default: 'text-foreground',
      navbar: 'font-semibold transition-colors hover:text-foreground text-muted-foreground text-sm'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
    VariantProps<typeof linkVariants> {
  href: Url
  selected?: boolean
  external?: boolean
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, selected, children, external, href, variant, ...props }, ref) => {
    return (
      <NextLink
        href={href}
        className={cn(
          linkVariants({ variant, className }),
          selected && 'text-blue-600 hover:text-blue-600',
          external && 'relative'
        )}
        ref={ref}
        {...props}
      >
        {children}
        {external && (
          <svg className="absolute top-0 right-[-10px]" height="7" width="7" viewBox="0 0 6 6">
            <path
              d="M1.25215 5.54731L0.622742 4.9179L3.78169 1.75597H1.3834L1.38936 0.890915H5.27615V4.78069H4.40513L4.41109 2.38538L1.25215 5.54731Z"
              fill="hsl(var(--muted-foreground))"
            />
          </svg>
        )}
      </NextLink>
    )
  }
)
Link.displayName = 'Link'

export { Link, linkVariants }
