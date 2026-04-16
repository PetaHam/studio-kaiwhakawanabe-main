'use client'

import React from 'react'
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Sparkles, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InsufficientShardsModalProps {
  isOpen: boolean
  onClose: () => void
  onBuyShards: () => void // Opens quick buy modal
  required: number // Shards needed
  current: number // User's current shards
  itemName?: string // What they're trying to buy
}

export function InsufficientShardsModal({
  isOpen,
  onClose,
  onBuyShards,
  required,
  current,
  itemName = 'this item'
}: InsufficientShardsModalProps) {
  const shortage = required - current
  const percentageShort = Math.round((shortage / required) * 100)

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md rounded-[3rem] border-2 border-orange-200 bg-white shadow-2xl p-0 overflow-hidden">
        {/* Warning stripe */}
        <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 animate-pulse" />
        
        <div className="p-6 space-y-6">
          <AlertDialogHeader>
            <div className="flex flex-col items-center text-center space-y-4 mb-2">
              {/* Icon */}
              <div className="relative">
                <div className="p-4 rounded-full bg-orange-100 border-4 border-orange-200">
                  <AlertTriangle className="w-10 h-10 text-orange-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white shadow-lg">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              </div>

              <div>
                <AlertDialogTitle className="text-2xl font-black uppercase italic text-slate-950 mb-2">
                  Insufficient Shards
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm font-medium text-slate-600">
                  You need more Mana Shards to unlock {itemName}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          {/* Shortage details */}
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-slate-500">Your Balance</span>
                <span className="text-primary">{current.toLocaleString()} Shards</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                  style={{ width: `${Math.min((current / required) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-slate-400">Required</span>
                <span className="text-slate-700">{required.toLocaleString()} Shards</span>
              </div>
            </div>

            {/* Shortage amount */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1">
                    You Need
                  </p>
                  <p className="text-2xl font-black text-orange-700 tabular-nums">
                    {shortage.toLocaleString()}
                  </p>
                  <p className="text-[9px] font-bold text-orange-600 mt-1">
                    more shards ({percentageShort}% short)
                  </p>
                </div>
                <Badge className="bg-orange-500 text-white font-black text-xs h-8 px-4">
                  {shortage.toLocaleString()}
                </Badge>
              </div>
            </div>

            {/* Recommended pack suggestion */}
            {shortage <= 5000 && (
              <div className="text-center p-3 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-[10px] font-black uppercase text-blue-700">
                  💡 Try the <span className="text-blue-900">Initiate Pack</span> (5,000 shards - $0.99)
                </p>
              </div>
            )}
            {shortage > 5000 && shortage <= 17000 && (
              <div className="text-center p-3 rounded-xl bg-cyan-50 border border-cyan-200">
                <p className="text-[10px] font-black uppercase text-cyan-700">
                  💡 Try the <span className="text-cyan-900">Matataki Pouch</span> (17,000 shards - $2.99)
                </p>
              </div>
            )}
            {shortage > 17000 && (
              <div className="text-center p-3 rounded-xl bg-purple-50 border border-purple-200">
                <p className="text-[10px] font-black uppercase text-purple-700">
                  💡 Try the <span className="text-purple-900">Legendary Vault</span> (35,000 shards - $4.99)
                </p>
              </div>
            )}
          </div>

          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              onClick={onBuyShards}
              className={cn(
                "w-full h-12 rounded-2xl font-black uppercase text-sm shadow-lg",
                "bg-gradient-to-r from-primary via-orange-500 to-red-500 text-white",
                "hover:shadow-xl transition-all"
              )}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Buy Shards Now
            </Button>
            
            <AlertDialogCancel asChild>
              <Button
                variant="outline"
                className="w-full h-12 rounded-2xl font-black uppercase text-xs border-2"
              >
                Maybe Later
              </Button>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
