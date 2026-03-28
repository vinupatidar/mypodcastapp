# MyPodcast: Native In-App Purchase (IAP) Testing Plan

This document outlines the steps to verify and launch native billing for iOS and Android.

---

## 1. Supabase Preparation (Already Configured)
Ensure you have run the following SQL alerts in your Supabase Editor to sync SKUs:
- Add `iap_sku` column to `subscription_plans` and `credit_packs`.
- Map the SKUs (e.g., `com.mypodcast.basic_sub`, `com.mypodcast.credits_20`) explicitly in the database.

---

## 2. Store Console Setup (Required)
You MUST create identical products in your developer consoles:

### Apple App Store Connect
1.  **Agreements**: Sign the "Paid Apps" agreement.
2.  **In-App Purchases**: Create **Consumable** for credits and **Auto-Renewable Subscription** for plans.
3.  **SKUs**: Use `com.mypodcast.credits_5`, `com.mypodcast.premium_sub`, etc.

### Google Play Console
1.  **Monetization**: Set up a merchant account.
2.  **Products**: Under "In-app products" and "Subscriptions", add the corresponding SKUs.
3.  **Active Status**: Ensure products are marked as "Active" and prices are set.

---

## 3. How to Test WITHOUT a Paid Developer Account (Simulation Mode)
Since you encountered a "No Team" error (which requires a $99/year Apple Developer membership), I have built a **Simulation Mode** directly into the code so you can still verify your app Logic.

### Testing in Expo Go:
1.  **Run the App**: `npm run start` and scan with your device.
2.  **Open Buy Credits / Paywall**: You will see a log: `⚠️ IAP: Native module not found. Running in Mock/Expo Go mode.`
3.  **Simulate Purchase**: Click "Buy" on any pack. 
4.  **Verification**: 
    -   You will see a **"Simulation: Successful purchase"** alert.
    -   The app will call `handleSuccessfulPurchase` internally.
    -   **Check Supabase**: Refresh your `user_subscriptions` table. You should see the credits or plan update exactly as they would in production!

---

## 4. Testing with a Native Build (Paid Account Only)
If you decide to get a paid account later, use these commands:

### Commands:
```bash
# Force package resolution for EAS
npx -p eas-cli eas build --profile development --platform ios
npx -p eas-cli eas build --profile development --platform android
```

---

## 4. Sandbox Testing Steps
1.  **Login**: Use a "Sandbox Tester" account (iOS) or "License Tester" (Android).
2.  **Trigger Purchase**: Navigate to the "Buy Credits" or "Paywall" screen in your app.
3.  **Verify UI**: Ensure the native payment sheet (Apple/Google) appears.
4.  **Complete Transaction**: Confirm the purchase (it won't charge real money in sandbox).
5.  **Check Supabase**: Refresh your `user_subscriptions` table to confirm `remaining_credits` or `plan_id` updated automatically.

---

## 5. Troubleshooting
- **"Module not found" error**: Ensure you are running your **Development Build**, NOT Expo Go.
- **"Store not available"**: Check if your tester account is logged into the device's App Store/Play Store.
- **Price is $0.00**: This is normal for sandbox accounts in some regions.

---
*Created by Antigravity AI*
