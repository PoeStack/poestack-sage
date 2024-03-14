'use client'
import { auth, authDiscord } from '@/lib/http-util'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

export default function AuthPage() {
  return (
    <Suspense fallback={<div>loading</div>}>
      <Body></Body>
    </Suspense>
  )
}

function Body() {
  const router = useRouter()

  const searchParams = useSearchParams()
  useEffect(() => {
    const search = searchParams.get('code')
    authDiscord(search!!).then((resp) => {
      router.push('/')
    })
  }, [router, searchParams])

  return <div>Connecting....</div>
}
