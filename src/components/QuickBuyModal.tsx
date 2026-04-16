'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Flame, Zap, Trophy, X, TrendingUp } from 'lucide-react'
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates'
import { doc, serverTimestamp, increment } from 'firebase/firestore'
import { useFirestore, useUser } from '@/firebase'
import { showToast } from '@/lib/toast-helpers'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const QUICK_BUY_PACKS = [
  { 
    id: 'starter',
    name: 'Initiate Pack', 
    mana: 5000, 
    price: 0.99, 
    icon: Flame,
    gradient: 'from-orange-500 via-red-500 to-pink-500',
  },
  { 
    id: 'standard',
    name: 'Matataki Pouch', 
    mana: 15000, 
    price: 2.99, 
    icon: Zap,
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    popular: true,
    bonus: 2000,
  },
  { 
    id: 'premium',
    name: 'Legendary Vault', 
    mana: 30000, 
    price: 4.99, 
    icon: Trophy,
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    bonus: 5000,
  },
]

interface QuickBuyModalProps {
  isOpen: boolean
  onClose: () => void
  highlightAmount?: number // Highlight packs that provide this amount or more
}

export function QuickBuyModal({ isOpen, onClose, highlightAmount }: QuickBuyModalProps) {
  const { user } = useUser()
  const db = useFirestore()
  const [purchasing, setPurchasing] = useState<string | null>(null)

  const handleBuyMana = async (pack: typeof QUICK_BUY_PACKS[0]) => {
    if (!user || user.isAnonymous) {
      showToast.warning('Registration Required', 'Please create an account to purchase')
      return
    }

    setPurchasing(pack.id)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      const totalMana = pack.mana + (pack.bonus || 0)
      await updateDocumentNonBlocking(
        doc(db, 'users', user.uid),
        {
          purchasedMana: increment(totalMana),
          updatedAt: serverTimestamp()
        }
      )
      
      showToast.manaEarned(totalMana, `Purchased ${pack.name}!`)
      
      // Close modal after successful purchase
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error) {
      showToast.error('Purchase Failed', 'Please try again')
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[3rem] border-2 border-primary/20 bg-white shadow-2xl p-0 overflow-hidden">
        {/* Header gradient bar */}
        <div className="h-2 w-full bg-gradient-to-r from-primary via-orange-500 to-yellow-500" />
        
        <div className="p-6 space-y-6">
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-orange-500 shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black uppercase italic text-slate-950">
                    Quick Buy
                  </DialogTitle>
                  <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                    Fast shard top-up
                  </DialogDescription>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full h-8 w-8 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {user?.isAnonymous && (
            <Link 
              href="/login"
              className="block text-center text-[10px] text-red-600 font-bold uppercase py-3 rounded-2xl bg-red-50 border-2 border-red-100 hover:bg-red-100 transition-colors"
            >
              Registration Required to Purchase
            </Link>
          )}

          {/* Quick buy packs */}
          <div className="space-y-3">
            {QUICK_BUY_PACKS.map((pack) => {
              const totalMana = pack.mana + (pack.bonus || 0)
              const isRecommended = highlightAmount && totalMana >= highlightAmount

              return (
                <Card 
                  key={pack.id}
                  className={cn(
                    "border-2 transition-all duration-300 overflow-hidden hover:shadow-lg",
                    pack.popular && "border-primary shadow-md shadow-primary/20",
                    isRecommended && "ring-2 ring-green-500 border-green-500",
                    !pack.popular && !isRecommended && "border-slate-200"
                  )}
                >
                  {pack.popular && (
                    <div className="bg-gradient-to-r from-primary to-orange-500 text-white text-center py-1.5 px-3">
                      <p className="text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Most Popular
                      </p>
                    </div>
                  )}
                  
                  {isRecommended && !pack.popular && (
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-1.5 px-3">
                      <p className="text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1">
                        ✓ Recommended
                      </p>
                    </div>
                  )}

                  <CardContent className="p-0">
                    <Button
                      disabled={user?.isAnonymous || purchasing === pack.id}
                      variant="ghost"
                      className="w-full h-auto p-4 hover:bg-slate-50 transition-all rounded-none"
                      onClick={() => handleBuyMana(pack)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-3 rounded-2xl bg-gradient-to-br shadow-md",
                            pack.gradient
                          )}>
                            <pack.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left space-y-0.5">
                            <p className="text-sm font-black uppercase italic text-slate-950">
                              {pack.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-primary">
                                +{pack.mana.toLocaleString()}
                              </p>
                              {pack.bonus && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-[8px] font-black h-4 px-1.5">
                                  +{pack.bonus.toLocaleString()}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-slate-950 text-white font-black italic text-sm h-9 px-4 shadow-md border-none rounded-2xl">
                          {purchasing === pack.id ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : (
                            `$${pack.price}`
                          )}
                        </Badge>
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* View all packs link */}
          <div className="text-center pt-2">
            <Link 
              href="/shop?tab=mana"
              className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
              onClick={onClose}
            >
              View All Packs →
            </Link>
          </div>
        </div>

        {/* Loading overlay */}
        {purchasing && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-[3rem]">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-sm font-black uppercase text-slate-950">Processing...</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
