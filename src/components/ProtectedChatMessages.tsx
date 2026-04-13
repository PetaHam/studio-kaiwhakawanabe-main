'use client'

import React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Shield } from 'lucide-react'

interface Message {
  id: string
  text: string
  userId: string
  userName?: string
  userColor?: string
}

interface ProtectedChatMessagesProps {
  messages: Message[]
  currentUserId: string
  isProtected: boolean
  fakeMessages: Message[]
}

export function ProtectedChatMessages({
  messages,
  currentUserId,
  isProtected,
  fakeMessages
}: ProtectedChatMessagesProps) {
  // Show fake messages when protected, real messages otherwise
  const displayMessages = isProtected ? fakeMessages : messages

  return (
    <div className="flex flex-col gap-3 pb-6 relative">
      {/* Protection indicator (only visible when protected) */}
      {isProtected && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
            <Shield className="w-12 h-12 text-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Privacy Mode Active
            </p>
          </div>
        </div>
      )}

      {displayMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3 opacity-50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            No messages yet
          </p>
        </div>
      ) : (
        displayMessages.map((m, idx) => {
          const isOwnMessage = m.userId === currentUserId
          return (
            <div
              key={m.id || idx}
              className={cn(
                "flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
                isOwnMessage ? "flex-row-reverse" : "flex-row"
              )}
            >
              {!isOwnMessage && (
                <Avatar className="h-8 w-8 shrink-0 border-2" style={{ borderColor: m.userColor || '#ccc' }}>
                  <AvatarFallback className="text-[10px] font-black" style={{ backgroundColor: m.userColor + '20', color: m.userColor }}>
                    {(m.userName || 'J').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={cn(
                "flex flex-col gap-1 max-w-[75%]",
                isOwnMessage ? "items-end" : "items-start"
              )}>
                {!isOwnMessage && (
                  <span className="text-[9px] font-bold text-slate-500 px-2">
                    {m.userName || 'Judge'}
                  </span>
                )}
                <div className={cn(
                  "px-4 py-2.5 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm",
                  isOwnMessage 
                    ? "bg-primary text-slate-950 rounded-br-sm" 
                    : "bg-slate-100 text-slate-950 rounded-bl-sm"
                )}>
                  {m.text}
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
