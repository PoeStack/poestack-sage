import { useEffect, useState, PropsWithChildren, ReactNode } from 'react'

type HydrationZustandProps = PropsWithChildren & {
  loadingComponent?: ReactNode
}

const HydrationZustand = ({ children, loadingComponent }: HydrationZustandProps) => {
  const [isHydrated, setIsHydrated] = useState(false)

  // Wait till Next.js rehydration completes
  useEffect(() => {
    setIsHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{isHydrated ? <div>{children}</div> : loadingComponent ? loadingComponent : null}</>
}

export default HydrationZustand
