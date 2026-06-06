# 🚀 EAS Deployment Guide for Propify

## ✅ Completed Setup Steps

1. ✅ **EAS CLI Installed** - `eas-cli` is now globally installed
2. ✅ **EAS Configuration Created** - `eas.json` with build profiles
3. ✅ **App Configuration Updated** - `app.json` with bundle identifiers and permissions
4. ✅ **Security Fixes Applied** - All critical security issues resolved

---

## 📱 Next Steps to Deploy

### Step 1: Login to Expo Account

You need to login to your Expo account (or create one if you don't have it).

**Run this command:**
```bash
eas login
```

**If you don't have an Expo account:**
- Go to https://expo.dev/signup
- Create a free account
- Then run `eas login` and enter your credentials

---

### Step 2: Configure Your Project with EAS

This will link your project to your Expo account and generate a project ID.

**Run this command:**
```bash
eas build:configure
```

This will:
- Create/update your EAS project
- Add a project ID to your `app.json`
- Set up your project for builds

---

### Step 3: Build Preview APK (For Testing)

Build an APK that you can install on Android devices for testing.

**Run this command:**
```bash
eas build --platform android --profile preview
```

**What happens:**
- Your code is uploaded to Expo servers
- Build starts in the cloud (takes 10-20 minutes)
- You'll get a download link when complete
- Install the APK on your Android device to test

**Build Status:**
- Check build progress at: https://expo.dev/accounts/[your-account]/projects/propify/builds

---

### Step 4: Test Your App

1. Download the APK from the link provided
2. Install on your Android device
3. Test all features:
   - ✅ User signup/login
   - ✅ Property browsing
   - ✅ Image upload
   - ✅ Wishlist
   - ✅ Contact dealer
   - ✅ Dealer dashboard
   - ✅ Add property
   - ✅ View inquiries

---

### Step 5: Build Production Builds

Once testing is complete, build production versions for app stores.

**For Android (Google Play Store):**
```bash
eas build --platform android --profile production
```

This creates an AAB (Android App Bundle) file for Play Store submission.

**For iOS (Apple App Store):**
```bash
eas build --platform ios --profile production
```

This creates an IPA file for App Store submission.

**Note:** iOS builds require an Apple Developer account ($99/year).

---

### Step 6: Submit to App Stores

**For Google Play Store:**
```bash
eas submit --platform android
```

**Requirements:**
- Google Play Developer account ($25 one-time fee)
- Service account JSON key (from Play Console)

**For Apple App Store:**
```bash
eas submit --platform ios
```

**Requirements:**
- Apple Developer account ($99/year)
- App Store Connect credentials

---

## 🎯 Quick Command Reference

```bash
# 1. Login
eas login

# 2. Configure project
eas build:configure

# 3. Build preview for testing
eas build --platform android --profile preview

# 4. Build production
eas build --platform android --profile production
eas build --platform ios --profile production

# 5. Submit to stores
eas submit --platform android
eas submit --platform ios

# Check build status
eas build:list

# View project details
eas project:info
```

---

## 📋 Pre-Submission Checklist

Before submitting to app stores, ensure you have:

### Required Assets:
- [ ] App icon (1024x1024 PNG)
- [ ] Screenshots (at least 2 per platform)
- [ ] Feature graphic (Android: 1024x500)
- [ ] App description (short & full)
- [ ] Privacy policy URL
- [ ] Terms of service URL

### Store Accounts:
- [ ] Google Play Developer account ($25)
- [ ] Apple Developer account ($99/year)

### App Information:
- [ ] App name: Propify
- [ ] Category: Real Estate / Business
- [ ] Target audience: 18+
- [ ] Content rating: Everyone

### Technical:
- [ ] Firebase Security Rules deployed
- [ ] App tested on physical devices
- [ ] All features working correctly
- [ ] No crashes or critical bugs

---

## 🔧 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
npm start -- --clear
rm -rf node_modules
npm install
eas build --platform android --profile preview --clear-cache
```

### Login Issues
```bash
# Logout and login again
eas logout
eas login
```

### Project Not Found
```bash
# Re-configure project
eas build:configure
```

---

## 📊 Build Profiles Explained

### Development Profile
- For development builds with debugging
- Includes dev tools
- Not for production

### Preview Profile
- Creates APK for testing
- Can be installed directly on devices
- Good for QA and beta testing

### Production Profile
- Creates AAB/IPA for app stores
- Optimized and minified
- Ready for public release

---

## 🎉 After Deployment

### Monitor Your App:
1. **Firebase Console**: https://console.firebase.google.com/
   - Check authentication logs
   - Monitor Firestore usage
   - Review security rule violations

2. **Expo Dashboard**: https://expo.dev/
   - View build history
   - Check crash reports
   - Monitor app performance

3. **App Store Dashboards**:
   - Google Play Console: https://play.google.com/console
   - App Store Connect: https://appstoreconnect.apple.com/

---

## 🔄 Updating Your App

### For JavaScript/React Changes (OTA Updates):
```bash
# Push updates without app store review
eas update --branch production --message "Bug fixes"
```

Users get updates next time they open the app!

### For Native Changes:
- Increment version in `app.json`
- Build new version
- Submit to app stores

---

## 💡 Tips

1. **Start with Preview Build**: Always test with preview build before production
2. **Test on Real Devices**: Emulators don't catch all issues
3. **Monitor Firebase**: Keep an eye on usage and costs
4. **Use OTA Updates**: For quick fixes without store review
5. **Version Control**: Commit your code before each build

---

## 📞 Support Resources

- **EAS Documentation**: https://docs.expo.dev/eas/
- **Expo Forums**: https://forums.expo.dev/
- **Firebase Support**: https://firebase.google.com/support
- **React Native Docs**: https://reactnative.dev/

---

## 🚀 Ready to Start?

Run these commands in order:

```bash
# 1. Login to Expo
eas login

# 2. Configure your project
eas build:configure

# 3. Build preview APK
eas build --platform android --profile preview
```

Your app will be ready for testing in 15-20 minutes! 🎉