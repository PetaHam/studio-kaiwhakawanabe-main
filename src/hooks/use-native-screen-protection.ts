'use client'

import { useEffect } from 'react'
import { PrivacyScreen } from '@capacitor/privacy-screen'
import { Capacitor } from '@capacitor/core'

/**
 * Hook to enable native screenshot blocking (FLAG_SECURE on Android/iOS blur)
 * This only works when the app is running as a native Capacitor app
 */
export function useNativeScreenProtection(enabled: boolean = true) {
  const isNative = Capacitor.isNativePlatform()

  useEffect(() => {
    if (!isNative || !enabled) return

    const enableProtection = async () => {
      try {
        await PrivacyScreen.enable({
          android: {
            dimBackground: true, // Dim background when protection active
            privacyModeOnActivityHidden: 'splash' // Show splash when activity hidden
          },
          ios: {
            blurEffect: 'dark' // iOS blur effect
          }
        })
        console.log('[Native Security] FLAG_SECURE enabled - Screenshots blocked')
      } catch (error) {
        console.warn('[Native Security] Failed to enable FLAG_SECURE:', error)
      }
    }

    enableProtection()

    // Cleanup: disable when component unmounts or app closes
    return () => {
      if (isNative) {
        PrivacyScreen.disable().catch(console.warn)
      }
    }
  }, [isNative, enabled])

  return {
    isNativeProtectionActive: isNative && enabled,
    isNativePlatform: isNative
  }
}
