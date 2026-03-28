require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Stripe Payment Service
 * Manages all payment-related logic for MyPodcast.
 */

const stripeService = {
  /**
   * Creates a Payment Intent for single credit pack purchases.
   * @param {number} amount - Amount in dollars (e.g., 5.00)
   * @param {string} currency - Currency code (e.g., 'usd')
   * @param {string} customerId - Optional Stripe Customer ID
   * @returns {Promise<Object>} Payment Intent object
   */
  createPaymentIntent: async (amount, currency = 'usd', customerId = null) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not defined in .env');
      }

      const amountInCents = Math.round(amount * 100);
      
      const sessionOptions = {
        amount: amountInCents,
        currency,
        automatic_payment_methods: { enabled: true },
        metadata: {
            app: 'mypodcast',
            type: 'credit_purchase'
        }
      };

      if (customerId) {
        sessionOptions.customer = customerId;
      }

      const paymentIntent = await stripe.paymentIntents.create(sessionOptions);
      console.log(`✅ Stripe: PaymentIntent created - ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      console.error('❌ Stripe: Error creating PaymentIntent:', error.message);
      throw error;
    }
  },

  /**
   * Creates a Checkout Session for Subscription upgrades.
   * @param {string} priceId - Stripe Price ID for the plan
   * @param {string} successUrl - Redirect URL on success
   * @param {string} cancelUrl - Redirect URL on cancel
   * @returns {Promise<Object>} Checkout Session object
   */
  createCheckoutSession: async (priceId, successUrl, cancelUrl) => {
    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      return session;
    } catch (error) {
      console.error('❌ Stripe: Error creating Checkout Session:', error.message);
      throw error;
    }
  },

  /**
   * Retrieves a Stripe subscription.
   * @param {string} subscriptionId 
   * @returns {Promise<Object>}
   */
  getSubscription: async (subscriptionId) => {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      console.error('❌ Stripe: Error fetching Subscription:', error.message);
      throw error;
    }
  },

  /**
   * Cancels a Stripe subscription.
   * @param {string} subscriptionId 
   * @returns {Promise<Object>}
   */
  cancelSubscription: async (subscriptionId) => {
    try {
      return await stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      console.error('❌ Stripe: Error canceling Subscription:', error.message);
      throw error;
    }
  },

  /**
   * Constructs a Stripe event for webhooks (secures with signature verification).
   * @param {any} payload - Request body
   * @param {string} sig - Stripe signature
   * @returns {Object} Verified Stripe Event
   */
  constructEvent: (payload, sig) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not defined in .env');
    }
    return stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  }
};

module.exports = stripeService;
