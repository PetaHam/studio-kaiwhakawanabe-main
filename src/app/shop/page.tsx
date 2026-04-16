'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Sparkles, Users, Gift, Palette, ChevronLeft, 
  Flame, Zap, Trophy, Crown, Star, Gem, 
  ShoppingBag, Lock, Check, TrendingUp, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useUser, useFirestore, useDoc } from '@/firebase'
import { doc, serverTimestamp, increment, arrayUnion } from 'firebase/firestore'
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates'
import { showToast } from '@/lib/toast-helpers'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// ==================== DATA STRUCTURES ====================

const MANA_PACKS = [
  { 
    id: 'starter',
    name: 'Initiate Pack', 
    mana: 5000, 
    price: 0.99, 
    icon: Flame,
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    popular: false,
    discount: null
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
    discount: null
  },
  { 
    id: 'premium',
    name: 'Legendary Vault', 
    mana: 30000, 
    price: 4.99, 
    icon: Trophy,
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    popular: false,
    bonus: 5000,
    discount: null
  },
  { 
    id: 'mega',
    name: 'Mega Vault', 
    mana: 50000, 
    price: 7.99, 
    icon: Crown,
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
    popular: false,
    bonus: 10000,
    discount: null
  },
  { 
    id: 'supreme',
    name: 'Supreme Cache', 
    mana: 100000, 
    price: 14.99, 
    icon: Star,
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    popular: false,
    bonus: 25000,
    discount: '20% OFF',
    originalPrice: 18.99
  },
  { 
    id: 'ultimate',
    name: 'Ultimate Hoard', 
    mana: 200000, 
    price: 24.99, 
    icon: Gem,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    popular: false,
    bonus: 60000,
    discount: '30% OFF',
    originalPrice: 34.99
  },
]

const HERITAGE_TEAMS = [
  {
    id: 'ngati-porou',
    name: 'Ngāti Porou',
    region: 'East Coast',
    tier: 'S',
    shardCost: 25000,
    moneyCost: 3.99,
    description: 'Elite coastal warriors known for their powerful haka',
    stats: { power: 95, technique: 92, spirit: 98 },
    gradient: 'from-blue-600 to-cyan-500',
    unlocked: false
  },
  {
    id: 'tuhoe',
    name: 'Tūhoe',
    region: 'Te Urewera',
    tier: 'S',
    shardCost: 25000,
    moneyCost: 3.99,
    description: 'Children of the mist, masters of the poi',
    stats: { power: 90, technique: 97, spirit: 94 },
    gradient: 'from-purple-600 to-pink-500',
    unlocked: false
  },
  {
    id: 'ngai-tahu',
    name: 'Ngāi Tahu',
    region: 'South Island',
    tier: 'A',
    shardCost: 18000,
    moneyCost: 2.99,
    description: 'Southern strength, legendary waiata',
    stats: { power: 88, technique: 90, spirit: 92 },
    gradient: 'from-emerald-600 to-teal-500',
    unlocked: false
  },
  {
    id: 'waikato',
    name: 'Waikato Tainui',
    region: 'Waikato',
    tier: 'A',
    shardCost: 18000,
    moneyCost: 2.99,
    description: 'River people with commanding presence',
    stats: { power: 92, technique: 87, spirit: 89 },
    gradient: 'from-red-600 to-orange-500',
    unlocked: false
  },
  {
    id: 'ngati-whatua',
    name: 'Ngāti Whātua',
    region: 'Auckland',
    tier: 'B',
    shardCost: 12000,
    moneyCost: 1.99,
    description: 'Urban warriors, modern tradition',
    stats: { power: 85, technique: 88, spirit: 86 },
    gradient: 'from-indigo-600 to-blue-500',
    unlocked: false
  },
  {
    id: 'te-arawa',
    name: 'Te Arawa',
    region: 'Rotorua',
    tier: 'B',
    shardCost: 12000,
    moneyCost: 1.99,
    description: 'Thermal heritage, fierce competitors',
    stats: { power: 87, technique: 84, spirit: 90 },
    gradient: 'from-yellow-600 to-amber-500',
    unlocked: false
  },
]

const SPECIAL_OFFERS = [
  {
    id: 'season-pass',
    name: 'Season Pass',
    description: '2x rewards on all battles for 30 days',
    price: 9.99,
    icon: Crown,
    gradient: 'from-yellow-500 to-orange-500',
    benefits: ['Double Mana Shards', 'Exclusive Badge', 'Priority Matchmaking', 'Ad-Free Experience']
  },
  {
    id: 'heritage-bundle',
    name: 'Heritage Mega Bundle',
    description: 'Unlock 3 S-Tier teams + 50k shards',
    price: 12.99,
    originalPrice: 19.99,
    icon: Star,
    gradient: 'from-purple-500 to-pink-500',
    benefits: ['3 S-Tier Teams', '50,000 Mana Shards', 'Exclusive Frame', 'Battle Pass Bonus']
  },
  {
    id: 'starter-bundle',
    name: 'Newcomer Bundle',
    description: 'Perfect start package for new judges',
    price: 4.99,
    icon: Gift,
    gradient: 'from-green-500 to-emerald-500',
    benefits: ['15,000 Shards', '1 A-Tier Team', 'Tutorial Boost', 'Welcome Badge']
  },
]

const COSMETICS = [
  {
    id: 'gold-frame',
    name: 'Golden Aura',
    type: 'Avatar Frame',
    shardCost: 5000,
    moneyCost: 0.99,
    rarity: 'Legendary',
    gradient: 'from-yellow-500 to-amber-600',
    preview: '🟡'
  },
  {
    id: 'judge-badge',
    name: 'Supreme Judge',
    type: 'Badge',
    shardCost: 3000,
    moneyCost: 0.49,
    rarity: 'Epic',
    gradient: 'from-blue-500 to-cyan-600',
    preview: '⚖️'
  },
  {
    id: 'chat-color-red',
    name: 'Crimson Voice',
    type: 'Chat Color',
    shardCost: 2000,
    moneyCost: 0.29,
    rarity: 'Rare',
    gradient: 'from-red-500 to-rose-600',
    preview: '🔴'
  },
  {
    id: 'victory-anim',
    name: 'Victory Fireworks',
    type: 'Battle Animation',
    shardCost: 8000,
    moneyCost: 1.49,
    rarity: 'Legendary',
    gradient: 'from-purple-500 to-pink-600',
    preview: '🎆'
  },
  {
    id: 'dark-theme',
    name: 'Midnight Mode',
    type: 'Theme',
    shardCost: 10000,
    moneyCost: 1.99,
    rarity: 'Epic',
    gradient: 'from-slate-700 to-slate-900',
    preview: '🌙'
  },
  {
    id: 'koru-border',
    name: 'Koru Border',
    type: 'Profile Border',
    shardCost: 4000,
    moneyCost: 0.79,
    rarity: 'Rare',
    gradient: 'from-green-500 to-teal-600',
    preview: '🌿'
  },
]

// ==================== MAIN COMPONENT ====================

export default function ShopPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('mana')

  // Fetch user data
  const userRef = user ? doc(db, 'users', user.uid) : null
  const { data: userData } = useDoc(userRef)

  const userMana = userData?.purchasedMana || 0
  const unlockedTeams = userData?.unlockedTeams || []
  const ownedCosmetics = userData?.ownedCosmetics || []

  // Purchase handlers
  const handleBuyMana = async (pack: typeof MANA_PACKS[0]) => {
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
    } catch (error) {
      showToast.error('Purchase Failed', 'Please try again')
    } finally {
      setPurchasing(null)
    }
  }

  const handleUnlockTeam = async (team: typeof HERITAGE_TEAMS[0], method: 'shards' | 'money') => {
    if (!user || user.isAnonymous) {
      showToast.warning('Registration Required', 'Please create an account')
      return
    }

    if (method === 'shards' && userMana < team.shardCost) {
      showToast.error('Insufficient Shards', `You need ${team.shardCost.toLocaleString()} shards`)
      return
    }

    setPurchasing(team.id)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      const updates: any = {
        unlockedTeams: arrayUnion(team.id),
        updatedAt: serverTimestamp()
      }

      if (method === 'shards') {
        updates.purchasedMana = increment(-team.shardCost)
      }

      await updateDocumentNonBlocking(doc(db, 'users', user.uid), updates)
      
      showToast.success('Team Unlocked!', `${team.name} added to your roster`)
    } catch (error) {
      showToast.error('Unlock Failed', 'Please try again')
    } finally {
      setPurchasing(null)
    }
  }

  const handleBuyCosmetic = async (cosmetic: typeof COSMETICS[0], method: 'shards' | 'money') => {
    if (!user || user.isAnonymous) {
      showToast.warning('Registration Required', 'Please create an account')
      return
    }

    if (method === 'shards' && userMana < cosmetic.shardCost) {
      showToast.error('Insufficient Shards', `You need ${cosmetic.shardCost.toLocaleString()} shards`)
      return
    }

    setPurchasing(cosmetic.id)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updates: any = {
        ownedCosmetics: arrayUnion(cosmetic.id),
        updatedAt: serverTimestamp()
      }

      if (method === 'shards') {
        updates.purchasedMana = increment(-cosmetic.shardCost)
      }

      await updateDocumentNonBlocking(doc(db, 'users', user.uid), updates)
      
      showToast.success('Cosmetic Unlocked!', `${cosmetic.name} added to your collection`)
    } catch (error) {
      showToast.error('Purchase Failed', 'Please try again')
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 -mx-4 -mt-6">
      {/* Header with Glassmorphism */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200/50 shadow-lg">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-2xl hover:bg-slate-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight text-slate-950 flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  Shard Vault
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                  Expand your roster & unlock heritage
                </p>
              </div>
            </div>

            {/* User Balance Card */}
            <div className="glass-card p-3 md:p-4 rounded-2xl border-2 border-primary/20 shadow-lg">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-orange-500">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    Balance
                  </p>
                  <p className="text-lg md:text-xl font-black text-slate-950 tabular-nums">
                    {userMana.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-24">
        {user?.isAnonymous && (
          <Link 
            href="/login"
            className="block mb-6 p-6 rounded-3xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-center shadow-xl hover:shadow-2xl transition-all group"
          >
            <Lock className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-black uppercase text-sm">Registration Required</p>
            <p className="text-xs opacity-90 mt-1">Create an account to purchase items</p>
          </Link>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100/80 backdrop-blur-sm p-2 rounded-3xl shadow-md">
            <TabsTrigger 
              value="mana"
              className="rounded-2xl font-black uppercase text-[10px] md:text-[11px] data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Mana</span>
            </TabsTrigger>
            <TabsTrigger 
              value="teams"
              className="rounded-2xl font-black uppercase text-[10px] md:text-[11px] data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
            >
              <Users className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Teams</span>
            </TabsTrigger>
            <TabsTrigger 
              value="special"
              className="rounded-2xl font-black uppercase text-[10px] md:text-[11px] data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
            >
              <Gift className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Offers</span>
            </TabsTrigger>
            <TabsTrigger 
              value="cosmetics"
              className="rounded-2xl font-black uppercase text-[10px] md:text-[11px] data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
            >
              <Palette className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Style</span>
            </TabsTrigger>
          </TabsList>

          {/* MANA SHARDS TAB */}
          <TabsContent value="mana" className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MANA_PACKS.map((pack) => (
                <Card 
                  key={pack.id}
                  className={cn(
                    "glass-card border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl group overflow-hidden",
                    pack.popular ? "border-primary shadow-xl shadow-primary/20 ring-2 ring-primary/30" : "border-slate-200"
                  )}
                >
                  {pack.popular && (
                    <div className="bg-gradient-to-r from-primary to-orange-500 text-white text-center py-2 px-3">
                      <p className="text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Most Popular
                      </p>
                    </div>
                  )}
                  
                  {pack.discount && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-red-500 text-white font-black text-[10px] shadow-lg animate-pulse">
                        {pack.discount}
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-6 space-y-4">
                    <div className={cn(
                      "mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform",
                      pack.gradient
                    )}>
                      <pack.icon className="w-10 h-10 text-white" />
                    </div>

                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-black uppercase italic text-slate-950">
                        {pack.name}
                      </h3>
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-2xl font-black text-primary tabular-nums">
                          {pack.mana.toLocaleString()}
                        </p>
                        {pack.bonus && (
                          <Badge className="bg-green-100 text-green-700 border-green-300 text-[9px] font-black">
                            +{pack.bonus.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Mana Shards
                      </p>
                    </div>

                    <Button
                      disabled={user?.isAnonymous || purchasing === pack.id}
                      className={cn(
                        "w-full h-12 rounded-2xl font-black uppercase text-sm shadow-lg hover:shadow-xl transition-all",
                        "bg-gradient-to-r from-slate-950 to-slate-800 text-white hover:from-slate-900 hover:to-slate-700"
                      )}
                      onClick={() => handleBuyMana(pack)}
                    >
                      {purchasing === pack.id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <>
                          {pack.originalPrice && (
                            <span className="line-through opacity-60 mr-2">${pack.originalPrice}</span>
                          )}
                          ${pack.price}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* HERITAGE TEAMS TAB */}
          <TabsContent value="teams" className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 gap-4">
              {HERITAGE_TEAMS.map((team) => {
                const isUnlocked = unlockedTeams.includes(team.id)
                const canAfford = userMana >= team.shardCost

                return (
                  <Card 
                    key={team.id}
                    className={cn(
                      "glass-card border-2 transition-all duration-300 hover:shadow-2xl overflow-hidden",
                      isUnlocked ? "border-green-500 bg-green-50/50" : "border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "h-3 bg-gradient-to-r",
                      team.gradient
                    )} />

                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-black uppercase italic text-slate-950">
                              {team.name}
                            </h3>
                            <Badge className={cn(
                              "font-black text-[9px]",
                              team.tier === 'S' ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white" :
                              team.tier === 'A' ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white" :
                              "bg-slate-200 text-slate-700"
                            )}>
                              TIER {team.tier}
                            </Badge>
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            {team.region}
                          </p>
                        </div>

                        {isUnlocked && (
                          <div className="p-2 rounded-xl bg-green-500 text-white">
                            <Check className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-slate-600 font-medium">
                        {team.description}
                      </p>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-xl bg-red-50 border border-red-100">
                          <p className="text-[9px] font-black uppercase text-red-600">Power</p>
                          <p className="text-lg font-black text-red-700">{team.stats.power}</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-blue-50 border border-blue-100">
                          <p className="text-[9px] font-black uppercase text-blue-600">Technique</p>
                          <p className="text-lg font-black text-blue-700">{team.stats.technique}</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-purple-50 border border-purple-100">
                          <p className="text-[9px] font-black uppercase text-purple-600">Spirit</p>
                          <p className="text-lg font-black text-purple-700">{team.stats.spirit}</p>
                        </div>
                      </div>

                      {!isUnlocked && (
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <Button
                            disabled={user?.isAnonymous || !canAfford || purchasing === team.id}
                            variant="outline"
                            className="h-12 rounded-2xl font-black uppercase text-[10px] border-2"
                            onClick={() => handleUnlockTeam(team, 'shards')}
                          >
                            <Sparkles className="w-4 h-4 mr-1" />
                            {team.shardCost.toLocaleString()}
                          </Button>
                          <Button
                            disabled={user?.isAnonymous || purchasing === team.id}
                            className="h-12 rounded-2xl font-black uppercase text-[10px] bg-gradient-to-r from-slate-950 to-slate-800 text-white"
                            onClick={() => handleUnlockTeam(team, 'money')}
                          >
                            ${team.moneyCost}
                          </Button>
                        </div>
                      )}

                      {isUnlocked && (
                        <div className="p-4 rounded-2xl bg-green-100 border-2 border-green-300 text-center">
                          <p className="text-[10px] font-black uppercase tracking-widest text-green-700 flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" /> Unlocked & Ready
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* SPECIAL OFFERS TAB */}
          <TabsContent value="special" className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 gap-4">
              {SPECIAL_OFFERS.map((offer) => (
                <Card 
                  key={offer.id}
                  className="glass-card border-2 border-slate-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden"
                >
                  <div className={cn(
                    "p-6 bg-gradient-to-br text-white text-center",
                    offer.gradient
                  )}>
                    <offer.icon className="w-12 h-12 mx-auto mb-3" />
                    <h3 className="text-xl font-black uppercase italic">
                      {offer.name}
                    </h3>
                    <p className="text-xs opacity-90 mt-1">
                      {offer.description}
                    </p>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <ul className="space-y-2">
                      {offer.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 shrink-0" />
                          <span className="font-medium text-slate-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      disabled={user?.isAnonymous}
                      className="w-full h-12 rounded-2xl font-black uppercase text-sm shadow-lg bg-gradient-to-r from-slate-950 to-slate-800 text-white"
                    >
                      {offer.originalPrice && (
                        <span className="line-through opacity-60 mr-2">${offer.originalPrice}</span>
                      )}
                      ${offer.price}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* COSMETICS TAB */}
          <TabsContent value="cosmetics" className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COSMETICS.map((cosmetic) => {
                const isOwned = ownedCosmetics.includes(cosmetic.id)
                const canAfford = userMana >= cosmetic.shardCost

                return (
                  <Card 
                    key={cosmetic.id}
                    className={cn(
                      "glass-card border-2 transition-all duration-300 hover:shadow-xl",
                      isOwned ? "border-green-500 bg-green-50/50" : "border-slate-200"
                    )}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className={cn(
                          "w-16 h-16 rounded-2xl bg-gradient-to-br shadow-lg flex items-center justify-center text-3xl",
                          cosmetic.gradient
                        )}>
                          {cosmetic.preview}
                        </div>
                        
                        {isOwned && (
                          <Badge className="bg-green-500 text-white font-black text-[9px]">
                            Owned
                          </Badge>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-black uppercase italic text-slate-950">
                          {cosmetic.name}
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                          {cosmetic.type}
                        </p>
                        <Badge className={cn(
                          "mt-2 text-[9px] font-black",
                          cosmetic.rarity === 'Legendary' ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white" :
                          cosmetic.rarity === 'Epic' ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" :
                          "bg-blue-100 text-blue-700"
                        )}>
                          {cosmetic.rarity}
                        </Badge>
                      </div>

                      {!isOwned && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            disabled={user?.isAnonymous || !canAfford || purchasing === cosmetic.id}
                            variant="outline"
                            size="sm"
                            className="h-10 rounded-xl font-black uppercase text-[9px] border-2"
                            onClick={() => handleBuyCosmetic(cosmetic, 'shards')}
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            {cosmetic.shardCost.toLocaleString()}
                          </Button>
                          <Button
                            disabled={user?.isAnonymous || purchasing === cosmetic.id}
                            size="sm"
                            className="h-10 rounded-xl font-black uppercase text-[9px] bg-slate-950 text-white"
                            onClick={() => handleBuyCosmetic(cosmetic, 'money')}
                          >
                            ${cosmetic.moneyCost}
                          </Button>
                        </div>
                      )}

                      {isOwned && (
                        <Button
                          disabled
                          className="w-full h-10 rounded-xl font-black uppercase text-[9px] bg-green-100 text-green-700 border-2 border-green-300"
                        >
                          <Check className="w-4 h-4 mr-1" /> Equipped
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Loading Overlay */}
      {purchasing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-8 rounded-3xl text-center space-y-4 animate-in zoom-in-95 fade-in">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-lg font-black uppercase text-slate-950">Processing Purchase...</p>
            <p className="text-xs text-slate-500">Please wait</p>
          </div>
        </div>
      )}
    </div>
  )
}
