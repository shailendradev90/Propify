/**
 * app.config.js — Dynamic Expo config.
 *
 * Firebase credentials and other secrets are read from environment variables
 * so they are NEVER hardcoded and NEVER committed to source control.
 *
 * Local development:
 *   1. Copy .env.example → .env
 *   2. Fill in your real values in .env
 *   3. .env is gitignored — it will not be committed.
 *
 * CI / EAS Cloud builds:
 *   Set the same variables as EAS Secrets:
 *   https://docs.expo.dev/build-reference/variables/#using-secrets-in-environment-variables
 *
 *   eas secret:create --scope project --name FIREBASE_API_KEY --value "..."
 *   (repeat for each variable below)
 */

export default {
  expo: {
    name: 'CredoKin',
    slug: 'credokin',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/app-icon-512.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/propify-splash-ios.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.credokin.app',
      buildNumber: '1.0.0',
    },
    android: {
      adaptiveIcon: {
        // Use the 512-px icon as the adaptive foreground until a dedicated
        // adaptive-icon.png is designed.
        foregroundImage: './assets/app-icon-512.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.credokin.app',
      versionCode: 1,
      permissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
      ],
    },
    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-image-picker',
        {
          photosPermission:
            'The app needs access to your photos to upload property images.',
        },
      ],
    ],
    extra: {
      // ── Firebase ────────────────────────────────────────────────────────────
      // Values come from environment variables — never hardcoded here.
      firebaseApiKey: process.env.FIREBASE_API_KEY ?? '',
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN ?? '',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? '',
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? '',
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? '',
      firebaseAppId: process.env.FIREBASE_APP_ID ?? '',
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID ?? '',
      // ── EAS ─────────────────────────────────────────────────────────────────
      // Run `eas init` once to populate the real project ID, or set via env var.
      eas: {
        projectId: process.env.EAS_PROJECT_ID ?? '',
      },
    },
  },
};
