require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const stripeService = require('./stripe_service');

const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Payment Webhook Logic
 * Processes asynchronous events from Stripe and updates MyPodcast state.
 */

const processStripeEvent = async (event) => {
  const data = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed':
      console.log('✅ Webhook: Checkout Session Completed', data.id);
      await handleCheckoutCompleted(data);
      break;

    case 'customer.subscription.updated':
      console.log('🔄 Webhook: Subscription Updated', data.id);
      await handleSubscriptionUpdated(data);
      break;

    case 'customer.subscription.deleted':
      console.log('❌ Webhook: Subscription Deleted', data.id);
      await handleSubscriptionDeleted(data);
      break;

    case 'payment_intent.succeeded':
      console.log('💰 Webhook: Payment Intent Succeeded', data.id);
      if (data.metadata.type === 'credit_purchase') {
        await handleCreditPurchase(data);
      }
      break;

    case 'payment_intent.payment_failed':
      console.log('⚠️ Webhook: Payment Intent Failed', data.id);
      await handlePaymentFailed(data);
      break;

    default:
      console.log(`ℹ️ Webhook: Unhandled event type ${event.type}`);
  }
};

/**
 * Handle initial subscription purchase.
 */
async function handleCheckoutCompleted(session) {
    const userId = session.client_reference_id; // Pass this when creating session
    const subscriptionId = session.subscription;
    
    if (session.mode === 'subscription' && userId) {
        const stripeSub = await stripeService.getSubscription(subscriptionId);
        const planId = stripeSub.items.data[0].plan.id;

        const { error } = await supabaseAdmin
            .from('user_subscriptions')
            .update({ 
                stripe_subscription_id: subscriptionId,
                status: 'active',
                end_date: new Date(stripeSub.current_period_end * 1000).toISOString()
            })
            .eq('user_id', userId);

        if (error) console.error('Error updating subscription:', error);
    }
}

/**
 * Handle subscription renewal or plan change.
 */
async function handleSubscriptionUpdated(subscription) {
    const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({ 
            status: subscription.status,
            end_date: new Date(subscription.current_period_end * 1000).toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);

    if (error) console.error('Error updating recurring sub:', error);
}

/**
 * Handle subscription cancellation or expiration.
 */
async function handleSubscriptionDeleted(subscription) {
    const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({ status: 'inactive' })
        .eq('stripe_subscription_id', subscription.id);

    if (error) console.error('Error disabling sub:', error);
}

/**
 * Handle single credit pack purchase success.
 */
async function handleCreditPurchase(paymentIntent) {
    const purchaseMetadata = paymentIntent.metadata;
    const userId = purchaseMetadata.user_id;
    const creditsToAdd = parseInt(purchaseMetadata.credits);

    if (userId && creditsToAdd) {
        // We use a custom SQL function or atomic increment
        const { data: sub } = await supabaseAdmin
            .from('user_subscriptions')
            .select('remaining_credits')
            .eq('user_id', userId)
            .maybeSingle();

        if (sub) {
            const newTotal = (sub.remaining_credits || 0) + creditsToAdd;
            await supabaseAdmin
                .from('user_subscriptions')
                .update({ remaining_credits: newTotal })
                .eq('user_id', userId);
        }
    }
}

/**
 * Handle payment failure (logging/notification placeholder).
 */
async function handlePaymentFailed(paymentIntent) {
    const errorMsg = paymentIntent.last_payment_error?.message || 'Transaction failed';
    console.error(`❌ Payment failed for ${paymentIntent.id}: ${errorMsg}`);
    // Optional: Send email to user or update a 'failed_payments' log table
}

module.exports = { processStripeEvent };
