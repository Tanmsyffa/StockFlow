import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { getSession } from 'next-auth/react'

export default function SignOut() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is still logged in
    getSession().then((session) => {
      if (!session) {
        // User is successfully signed out, redirect to sign in
        router.push('/auth/SignIn')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Signing out...
        </h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  )
}