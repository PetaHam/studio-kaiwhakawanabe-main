'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BuyShardsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/shop?tab=mana')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm font-black uppercase text-slate-950">Redirecting to Shard Vault...</p>
      </div>
    </div>
  )
}
