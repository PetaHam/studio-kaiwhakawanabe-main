import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shard Vault - Shop | Kaiwhakawānabe',
  description: 'Buy Mana Shards, unlock Heritage Teams, and customize your judge profile',
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Shop page uses its own full-width layout
  // Bypass the root layout's max-w-md container
  return <>{children}</>
}
