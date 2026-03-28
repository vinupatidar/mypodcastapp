require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const stripeService = require('./stripe_service');
const { processStripeEvent } = require('./webhook_handler');

const app = express();
const port = process.env.PAYMENTS_PORT || 5011; // Separate port for payments

/**
 * Stripe Webhook Endpoint
 * -----------------------
 * Note: Body must be raw for Stripe signature verification.
 */
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeService.constructEvent(req.body, sig);
        console.log(`🔔 Webhook: Received event ${event.type} (${event.id})`);
    } catch (err) {
        console.error(`❌ Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Process event asynchronously
    processStripeEvent(event).catch((err) => {
        console.error('❌ Webhook: Error processing event:', err.message);
    });

    // Return 200 to Stripe immediately
    res.json({ received: true });
});

app.listen(port, () => {
    console.log(`🚀 Payments Server: Listening at http://localhost:${port}`);
    console.log(`📍 Webhook URL: http://localhost:${port}/webhook`);
});
