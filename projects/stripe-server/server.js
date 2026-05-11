const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// David Mollison's Stripe secret key
const stripe = Stripe('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');

const PORT = 3099;

// Create a one-time payment intent
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', customerEmail } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({ error: 'Amount must be at least 50 cents.' });
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // amount in cents
      currency,
      receipt_email: customerEmail || undefined,
      automatic_payment_methods: { enabled: true },
      metadata: {
        source: 'onboarding-popup',
        email: customerEmail || '',
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a recurring subscription
app.post('/create-subscription', async (req, res) => {
  try {
    const { priceId, customerEmail, paymentMethodId } = req.body;

    if (!priceId || !customerEmail) {
      return res.status(400).json({ error: 'priceId and customerEmail are required.' });
    }

    // First create or retrieve customer
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        payment_method: paymentMethodId || undefined,
      });
    }

    // Create subscription with recurring price
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice;
    const paymentIntent = invoice.payment_intent;

    res.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent ? paymentIntent.client_secret : null,
      status: subscription.status,
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a customer for recurring billing
app.post('/create-customer', async (req, res) => {
  try {
    const { email, name } = req.body;
    const customer = await stripe.customers.create({ email, name });
    res.json({ customerId: customer.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscription status
app.get('/subscription/:id', async (req, res) => {
  try {
    const sub = await stripe.subscriptions.retrieve(req.params.id);
    res.json(sub);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Create a setup intent (for collecting card details with no upfront charge)
app.post('/create-setup-intent', async (req, res) => {
  try {
    const { customerEmail } = req.body;

    if (!customerEmail) {
      return res.status(400).json({ error: 'customerEmail is required.' });
    }

    // Find or create customer
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({ email: customerEmail });
    }

    // Create setup intent to collect card details
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
      usage: 'off_session',  // so we can charge them later
    });

    res.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error('Setup intent error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Stripe server running on port ${PORT}`);
});
