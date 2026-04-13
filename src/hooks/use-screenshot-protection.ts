'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

// 50 placeholder messages for fake chat view
const PLACEHOLDER_MESSAGES = [
  "Nice screenshot, narc. Hope your ranking was worth it.",
  "Screen recording detected. Your judge license has been flagged. (Not really. But stop.)",
  "What happens in the party stays in the party. Unless you screenshot. Then it doesn't.",
  "Your camera roll called. It wants its dignity back.",
  "Screenshotting chat is like filming your own L. Don't.",
  "We've notified the tribunal. (Kidding. But seriously. Stop.)",
  "Every screenshot weakens your next battle roll. Probably.",
  "Share a screenshot, lose 50 shards. That's the rule now. (We made it up. But test us.)",
  "Your opponent just screenshotted your trash talk. Embarrassing for you both.",
  "The vault sees everything. Including your screen capture history.",
  "Screenshot warning #4. You're really testing us.",
  "Imagine needing proof because you can't win an argument live. Tragic.",
  "That screenshot you just took? Already forwarded to your mum.",
  "Party chat is like a changing room. What's said here stays here. Unless you're that person.",
  "You wouldn't screenshot a haka. So why screenshot this?",
  "Another screenshot? Your storage must be empty.",
  "We're not mad. We're just disappointed. And also a little mad.",
  "Screenshot detected. Your next 3 battles will be against heritage teams. Good luck.",
  "The only thing worse than losing an argument is screenshotting it.",
  "Your co-judge just reported you. (Just kidding. Or are we?)",
  "Screenshotting chat is how you get assigned poi duty. Permanently.",
  "Every screenshot adds 10 seconds to your next loading screen.",
  "That's screenshot number 7. The system is now watching you. Closely.",
  "Real judges don't snitch. Real judges also don't screenshot.",
  "Your phone tried to screenshot. The app said 'absolutely not.'",
  "Share that screenshot and we'll make sure your profile color is permanently beige.",
  "Screenshotting chat is a choice. A bad one. But a choice.",
  "Your opponent just screenshotted your meltdown. They're laughing. You should be embarrassed.",
  "Screenshot warning: Your chat privileges are now on thin ice. Very thin.",
  "The only thing more embarrassing than your last battle is your screenshot history.",
  "Nice try. The app blocks screenshots. (Does it? Guess you'll find out.)",
  "Screenshot detected. Your shards have been donated to your last opponent.",
  "You really thought we wouldn't notice? Bold. Incorrect. But bold.",
  "That's the 10th warning. The next one is a curse on your draft pack.",
  "Screenshotting chat is how you get matched against the same person 7 times in a row.",
  "Your camera roll is now 47% shame. Stop adding to it.",
  "Every screenshot delays the next event launch by 1 minute. Thanks for that.",
  "Real ones keep the smoke in the chat. Not in their camera roll.",
  "Screenshot warning: Your account has been flagged for 'excessive insecurity.'",
  "You wouldn't download a car. So why screenshot a chat?",
  "That's screenshot #23. At this point, just subscribe to our newsletter.",
  "Your screenshot habit is why your battle RNG is so bad. Just saying.",
  "The chat is ephemeral. Your embarrassment doesn't have to be. Delete the screenshot.",
  "Screenshotting chat is like saving your own trash talk. Weird flex.",
  "Your last screenshot was sent to the group chat of everyone you've ever lost to.",
  "Screenshot warning #41. The system is now laughing at you.",
  "Every screenshot reduces your chance of pulling a legendary by 5%. Your call.",
  "You're not the main character. Stop acting like your chat logs are evidence.",
  "Screenshot detected. Your next opponent will be someone who beat you last time.",
  "Last warning. The next screenshot triggers a 24-hour mute. We're not joking. (Okay maybe a little.)"
]

export interface ScreenshotProtectionOptions {
  enabled?: boolean
  onDetection?: () => void
  detectionDelay?: number // ms to wait before showing real content again
}

export function useScreenshotProtection(options: ScreenshotProtectionOptions = {}) {
  const { 
    enabled = true, 
    onDetection,
    detectionDelay = 500 
  } = options

  const [isProtected, setIsProtected] = useState(false)
  const [detectionCount, setDetectionCount] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastBlurTime = useRef<number>(0)

  const handleProtection = useCallback(() => {
    if (!enabled) return

    const now = Date.now()
    const timeSinceLastBlur = now - lastBlurTime.current

    // Ignore rapid successive events (debounce)
    if (timeSinceLastBlur < 200) return

    lastBlurTime.current = now
    setIsProtected(true)
    setDetectionCount(prev => prev + 1)

    // Log security event
    if (typeof window !== 'undefined') {
      console.warn('[Security] Screenshot/Screen recording attempt detected')
    }

    // Callback for logging/analytics
    onDetection?.()

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Restore content after delay
    timeoutRef.current = setTimeout(() => {
      setIsProtected(false)
    }, detectionDelay)
  }, [enabled, onDetection, detectionDelay])

  useEffect(() => {
    if (!enabled) return

    // Mobile-optimized detection: Page Visibility API
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched apps (likely for screenshot)
        handleProtection()
      }
    }

    // Additional blur event (faster on some mobile browsers)
    const handleBlur = () => {
      handleProtection()
    }

    // Screen recording detection (experimental - limited browser support)
    const detectScreenRecording = async () => {
      try {
        if ('mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices) {
          // Attempt to detect if screen recording is active
          // This is a heuristic and won't work in all cases
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true }).catch(() => null)
          if (stream) {
            handleProtection()
            stream.getTracks().forEach(track => track.stop())
          }
        }
      } catch (e) {
        // Silently fail - this is experimental
      }
    }

    // Attach listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)

    // Check for screen recording periodically (optional, resource-intensive)
    // const recordingCheckInterval = setInterval(detectScreenRecording, 5000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      // clearInterval(recordingCheckInterval)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, handleProtection])

  // Generate random fake messages
  const getFakeMessages = useCallback((count: number = 5) => {
    const shuffled = [...PLACEHOLDER_MESSAGES].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count).map((text, idx) => ({
      id: `fake_${idx}`,
      text,
      userId: `fake_user_${idx % 3}`,
      userName: ['Judge A', 'Judge B', 'Moderator'][idx % 3],
      userColor: ['#FF4500', '#1877F2', '#22C55E'][idx % 3],
      timestamp: new Date(Date.now() - (count - idx) * 60000)
    }))
  }, [])

  return {
    isProtected,
    detectionCount,
    getFakeMessages,
    enabled
  }
}
