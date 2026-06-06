# Propify Security Setup Guide

This guide will help you configure all security features for production deployment.

## 🔐 Step 1: Environment Variables Setup

### 1.1 Create Environment File

Create a `.env` file in the project root (this file is gitignored):

```bash
cp .env.example .env
```

### 1.2 Configure Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > General
4. Scroll to "Your apps" section
5. Copy the configuration values

Update your `.env` file:

```env
FIREBASE_API_KEY=your_actual_api_key_here
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

APP_ENV=production
```

### 1.3 Verify Configuration

Run the app and check the console for any Firebase configuration warnings.

---

## 🛡️ Step 2: Firebase Security Rules

### 2.1 Deploy Firestore Rules

The `firestore.rules` file has been created with comprehensive security rules.

**Deploy to Firebase:**

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules
```

### 2.2 Verify Rules

1. Go to Firebase Console > Firestore Database > Rules
2. Verify the rules are deployed
3. Test with the Rules Playground

### 2.3 Key Security Features

✅ **Authentication Required**: All operations require authentication
✅ **Data Validation**: Input validation at database level
✅ **Owner-Only Access**: Users can only modify their own data
✅ **Role-Based Access**: Different permissions for users and dealers
✅ **Field Validation**: Email, phone, price, and other fields validated

---

## 🔒 Step 3: Firebase App Check (Recommended)

App Check protects your Firebase resources from abuse.

### 3.1 Enable App Check

```bash
npm install @react-native-firebase/app-check
```

### 3.2 Configure App Check

Add to `src/services/firebase.ts`:

```typescript
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// After initializing Firebase app
if (!isDemoMode) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
    isTokenAutoRefreshEnabled: true,
  });
}
```

### 3.3 Enable in Firebase Console

1. Go to Firebase Console > App Check
2. Register your app
3. Enable enforcement for Firestore, Storage, etc.

---

## ✅ Step 4: Input Validation

Input validation is now implemented using Yup schemas.

### 4.1 Validation Features

- ✅ Email format validation
- ✅ Strong password requirements (8+ chars, uppercase, lowercase, number, special char)
- ✅ Phone number format validation
- ✅ Price and numeric field validation
- ✅ String length limits
- ✅ XSS prevention through sanitization

### 4.2 Usage Example

```typescript
import { validateAndSanitizeProperty } from './utils/validation';

try {
  const validData = await validateAndSanitizeProperty(formData);
  // Use validData for API calls
} catch (error) {
  // Handle validation errors
  Alert.alert('Validation Error', formatValidationErrors(error));
}
```

---

## ⏱️ Step 5: Rate Limiting

Rate limiting prevents abuse and spam.

### 5.1 Current Limits

| Action | Limit | Window | Block Duration |
|--------|-------|--------|----------------|
| Login | 5 attempts | 15 min | 30 min |
| Signup | 3 attempts | 1 hour | 1 hour |
| Create Property | 10 properties | 1 hour | - |
| Create Inquiry | 5 inquiries | 1 hour | 1 hour |
| Password Reset | 3 attempts | 1 hour | 1 hour |

### 5.2 Customize Limits

Edit `src/utils/rateLimiter.ts`:

```typescript
export const RateLimitConfigs = {
  LOGIN: {
    maxAttempts: 5,  // Change this
    windowMs: 15 * 60 * 1000,  // Change this
    blockDurationMs: 30 * 60 * 1000,  // Change this
  },
  // ... other configs
};
```

---

## 🚨 Step 6: Error Boundaries

Error boundaries catch and handle React errors gracefully.

### 6.1 Features

- ✅ Prevents white screen crashes
- ✅ User-friendly error messages
- ✅ Retry functionality
- ✅ Development error details
- ✅ Production error logging ready

### 6.2 Add Error Logging Service

For production, integrate with error tracking:

**Option 1: Sentry**

```bash
npm install @sentry/react-native
```

```typescript
// In ErrorBoundary.tsx componentDidCatch
import * as Sentry from '@sentry/react-native';

Sentry.captureException(error, { extra: errorInfo });
```

**Option 2: Firebase Crashlytics**

```bash
npm install @react-native-firebase/crashlytics
```

```typescript
import crashlytics from '@react-native-firebase/crashlytics';

crashlytics().recordError(error);
```

---

## 📊 Step 7: Monitoring & Analytics

### 7.1 Install Firebase Analytics

```bash
npm install @react-native-firebase/analytics
npm install @react-native-firebase/crashlytics
```

### 7.2 Configure Analytics

```typescript
import analytics from '@react-native-firebase/analytics';

// Track events
await analytics().logEvent('property_viewed', {
  property_id: propertyId,
  property_type: propertyType,
});

// Track screen views
await analytics().logScreenView({
  screen_name: 'PropertyDetail',
  screen_class: 'PropertyDetailScreen',
});
```

---

## 🔐 Step 8: Additional Security Measures

### 8.1 Enable Email Verification

Add to signup flow:

```typescript
import { sendEmailVerification } from 'firebase/auth';

const cred = await createUserWithEmailAndPassword(auth, email, password);
await sendEmailVerification(cred.user);
```

### 8.2 Implement Phone Verification

For dealers, add OTP verification:

```bash
npm install @react-native-firebase/auth
```

```typescript
import auth from '@react-native-firebase/auth';

const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
await confirmation.confirm(code);
```

### 8.3 Add HTTPS-Only Communication

In `app.json`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": false
        }
      }
    },
    "android": {
      "usesCleartextTraffic": false
    }
  }
}
```

---

## 🧪 Step 9: Testing Security

### 9.1 Test Firestore Rules

```bash
firebase emulators:start --only firestore
```

Run tests against the emulator.

### 9.2 Test Rate Limiting

1. Try logging in with wrong password 6 times
2. Verify you're blocked for 30 minutes
3. Test property creation limits

### 9.3 Test Input Validation

1. Try creating property with invalid data
2. Try SQL injection in text fields
3. Try XSS attacks in description fields

### 9.4 Security Checklist

- [ ] Firebase credentials in environment variables
- [ ] Firestore security rules deployed
- [ ] App Check enabled
- [ ] Input validation working
- [ ] Rate limiting active
- [ ] Error boundaries catching errors
- [ ] Email verification enabled
- [ ] Analytics tracking events
- [ ] Crashlytics logging errors
- [ ] HTTPS-only communication
- [ ] No sensitive data in logs
- [ ] No API keys in code

---

## 🚀 Step 10: Production Deployment

### 10.1 Pre-Deployment Checklist

```bash
# 1. Verify environment variables
cat .env  # Should have real values

# 2. Build production bundle
npm run build

# 3. Test on physical devices
npm run android
npm run ios

# 4. Run security audit
npm audit

# 5. Deploy Firebase rules
firebase deploy --only firestore:rules

# 6. Enable App Check enforcement
# (Do this in Firebase Console)
```

### 10.2 Post-Deployment Monitoring

1. **Monitor Firebase Console**
   - Check authentication logs
   - Monitor Firestore usage
   - Review security rule violations

2. **Monitor Crashlytics**
   - Check crash-free rate
   - Review error reports
   - Fix critical issues

3. **Monitor Analytics**
   - Track user behavior
   - Identify bottlenecks
   - Optimize user flow

---

## 🆘 Troubleshooting

### Issue: "Cannot find name 'process'"

**Solution**: Ensure `@types/node` is installed and babel plugin is configured.

```bash
npm install --save-dev @types/node
```

### Issue: Firebase rules denying valid requests

**Solution**: Check Firebase Console > Firestore > Rules tab for detailed error logs.

### Issue: Rate limiting too strict

**Solution**: Adjust limits in `src/utils/rateLimiter.ts`

### Issue: Validation errors on valid input

**Solution**: Check validation schemas in `src/utils/validation.ts`

---

## 📚 Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
- [React Native Security Best Practices](https://reactnative.dev/docs/security)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)

---

## 🔄 Regular Maintenance

### Weekly
- Review Firebase authentication logs
- Check for unusual activity patterns
- Monitor error rates

### Monthly
- Update dependencies (`npm update`)
- Review and update security rules
- Audit rate limiting effectiveness
- Review crashlytics reports

### Quarterly
- Security audit
- Penetration testing
- Update Firebase SDK
- Review and update validation rules

---

**Last Updated**: June 6, 2026
**Version**: 1.0.0