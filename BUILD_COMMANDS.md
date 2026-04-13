# Quick Build Commands

## Building for Capacitor Native App

### 1. Build Next.js (Static Export)
```bash
# Temporarily set output mode for Capacitor
cd /app
yarn build
# OR if build fails, use:
# npx next build && npx next export
```

### 2. Sync to Native Projects
```bash
npx cap sync android
# For iOS: npx cap sync ios
```

### 3. Open in IDE
```bash
# Android Studio
npx cap open android

# Xcode (macOS only)
npx cap open ios
```

### 4. Build APK in Android Studio
- Build → Build Bundle(s) / APK(s) → Build APK(s)
- Find APK: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Testing PWA Screenshot Protection (No Build Needed)

The screenshot protection is **already live** in your current deployment! Just:

1. Open app on mobile phone
2. Go to chat room
3. Press screenshot buttons (Power + Volume Down)
4. Watch fake messages appear!

---

## Distribution Methods

**Quick Test (Recommended):**
1. Build APK as above
2. Transfer `app-debug.apk` to phone via USB/email/cloud
3. Install on phone (enable "Install from Unknown Sources")
4. Test screenshot → Should show black screen

**Production:**
- Sign APK with keystore
- Upload to Google Play Console
- Submit for review

See `/app/docs/NATIVE_APP_BUILD_GUIDE.md` for complete instructions.
