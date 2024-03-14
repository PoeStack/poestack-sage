'use client'
import { currentUserAtom } from '@/components/providers'
import { auth } from '@/lib/http-util'
import { useSetAtom } from 'jotai'
import { jwtDecode } from 'jwt-decode'
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
  const setCurrentUser = useSetAtom(currentUserAtom)

  const searchParams = useSearchParams()
  useEffect(() => {
    const search = searchParams.get('code')
    auth(search!!).then((resp) => {
      localStorage.setItem('doNotShareJwt', resp.jwt)
      setCurrentUser(resp.jwt ? jwtDecode(resp.jwt) : null)
      router.push('/')
    })
  }, [router, searchParams, setCurrentUser])

  return <div>Connecting....</div>
}
