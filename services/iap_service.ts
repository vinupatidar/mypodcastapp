import { Alert } from 'react-native';
import { supabase } from './supabase';

/**
 * In-App Purchase Service (v12 Legacy/Expo-Compatible)
 * Handles native iOS/Android billing for Subscriptions and Credits.
 */

const itemSkus = [
  'com.mypodcast.basic_sub',
  'com.mypodcast.premium_sub',
  'com.mypodcast.credits_5',
  'com.mypodcast.credits_20',
  'com.mypodcast.credits_50',
];

let purchaseUpdateSubscription: any = null;
let purchaseErrorSubscription: any = null;

// Dynamic IAP Import for Safe Expo-Go
const getIAP = () => {
    try {
        const { NativeModules } = require('react-native');
        const hasNative = !!(NativeModules.RNIapModule || NativeModules.RNIapIosSk2 || NativeModules.RNIapIos);
        if (!hasNative) return null;
        return require('react-native-iap');
    } catch (e) {
        return null;
    }
};

export const IAPService = {
  /**
   * Initialize IAP connection.
   */
  initConnection: async () => {
    try {
      const iap = getIAP();
      if (!iap) {
          console.log('⚠️ IAP: Native module not found. Running in Mock/Expo Go mode.');
          return false;
      }

      await iap.initConnection();
      console.log('✅ IAP: Connection initialized');
      
      // Setup listeners
      IAPService.setupPurchaseListeners();
      
      return true;
    } catch (err: any) {
      console.warn('❌ IAP: Connection Error', err.message);
      return false;
    }
  },

  /**
   * Setup listeners for completed/failed purchases.
   */
  setupPurchaseListeners: () => {
    const iap = getIAP();
    if (!iap) return;

    if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
    if (purchaseErrorSubscription) purchaseErrorSubscription.remove();

    purchaseUpdateSubscription = iap.purchaseUpdatedListener(async (purchase: any) => {
      const token = purchase.purchaseToken || purchase.transactionId;
      if (token) {
        try {
          console.log('📦 IAP: Purchase Updated', purchase.productId);
          
          // 1. Finish Transaction
          await iap.finishTransaction({ purchase, isConsumable: true });
          
          // 2. Update Supabase State
          await IAPService.handleSuccessfulPurchase(purchase);
          
        } catch (err: any) {
          console.warn('❌ IAP: Finish Transaction Error', err.message);
        }
      }
    });

    purchaseErrorSubscription = iap.purchaseErrorListener((error: any) => {
      console.warn('⚠️ IAP: Purchase Error', error.message);
    });
  },

  /**
   * Fetch available products/subscriptions.
   */
  getProducts: async () => {
    try {
      const iap = getIAP();
      if (!iap) return [];

      const products = await iap.getProducts({ skus: itemSkus });
      const subs = await iap.getSubscriptions({ skus: itemSkus });
      return [...products, ...subs];
    } catch (err) {
      console.warn('❌ IAP: Get Products Error', err);
      return [];
    }
  },

  /**
   * Request a purchase.
   */
  requestPurchase: async (sku: string, isSubscription: boolean = false) => {
    try {
      const iap = getIAP();
      if (!iap) {
          Alert.alert('Simulation', 'Successful purchase simulation for development!');
          return;
      }

      if (isSubscription) {
        await iap.requestSubscription({ sku });
      } else {
        await iap.requestPurchase({ sku });
      }
    } catch (err: any) {
      Alert.alert('IAP Error', err.message);
    }
  },

  /**
   * Handle internal state updates after a verified purchase.
   */
  handleSuccessfulPurchase: async (purchase: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let creditsToAdd = 0;
    if (purchase.productId.includes('credits_5')) creditsToAdd = 5;
    else if (purchase.productId.includes('credits_20')) creditsToAdd = 20;
    else if (purchase.productId.includes('credits_50')) creditsToAdd = 50;

    if (creditsToAdd > 0) {
        const { data: sub } = await supabase.from('user_subscriptions').select('remaining_credits').eq('user_id', user.id).maybeSingle();
        if (sub) {
            await supabase.from('user_subscriptions').update({ remaining_credits: (sub.remaining_credits || 0) + creditsToAdd }).eq('user_id', user.id);
        }
    } else {
        // Handle Subscriptions
        let planId = '';
        if (purchase.productId.includes('basic')) planId = 'basic_monthly';
        else if (purchase.productId.includes('premium')) planId = 'premium_monthly';

        if (planId) {
            await supabase.from('user_subscriptions').upsert({ 
                user_id: user.id, 
                plan_id: planId, 
                status: 'active',
                start_date: new Date().toISOString()
            }, { onConflict: 'user_id' });
        }
    }
  },

  /**
   * Cleanup.
   */
  endConnection: () => {
    const iap = getIAP();
    if (!iap) return;

    if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
    if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
    iap.endConnection();
  }
};
