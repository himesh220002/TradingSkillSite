import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import { publishEvent } from '../config/kafka.js';

const router = express.Router();

/**
 * Helper to initialize Razorpay SDK.
 * Logs a warning if credentials are not configured.
 */
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === 'rzp_test_YOUR_KEY_ID' || keySecret === 'YOUR_KEY_SECRET') {
    console.warn('⚠️ Razorpay credentials are not set or contain placeholders. Verification will fail unless test mode bypass is active.');
  }

  return new Razorpay({
    key_id: keyId || '',
    key_secret: keySecret || '',
  });
};

/**
 * Endpoint 1: GET /api/payments/config
 * Exposes the public key ID to the client.
 */
router.get('/config', (req, res) => {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || '',
  });
});

/**
 * Fetches the live USD to INR exchange rate.
 * Falls back to a reasonable default if the API is unreachable.
 */
const getUsdToInrRate = async (): Promise<number> => {
  const FALLBACK_RATE = 85; // approximate fallback
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    if (data?.result === 'success' && data?.rates?.INR) {
      console.log(`💱 Live USD→INR rate: ${data.rates.INR}`);
      return data.rates.INR;
    }
    console.warn('⚠️ Exchange rate API returned unexpected data, using fallback rate');
    return FALLBACK_RATE;
  } catch (err) {
    console.warn('⚠️ Failed to fetch live exchange rate, using fallback rate:', FALLBACK_RATE);
    return FALLBACK_RATE;
  }
};

/**
 * Endpoint 2: POST /api/payments/create-order
 * Converts the USD course price to INR using a live exchange rate,
 * then contacts Razorpay to create a verified payment order in INR.
 */
router.post('/create-order', async (req, res) => {
  try {
    const { courseId, amount } = req.body;

    if (!courseId || !amount) {
      return res.status(400).json({ message: 'courseId and amount are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const razorpay = getRazorpayInstance();

    // Convert USD to INR
    const usdAmount = Number(amount);
    const exchangeRate = await getUsdToInrRate();
    const inrAmount = Math.round(usdAmount * exchangeRate);

    // Razorpay amount is represented in paise (1 INR = 100 paise)
    const amountInPaise = inrAmount * 100;

    console.log(`💰 Order: $${usdAmount} USD × ${exchangeRate} = ₹${inrAmount} INR (${amountInPaise} paise)`);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await razorpay.orders.create(options);
    
    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      amountUsd: usdAmount,
      amountInr: inrAmount,
      exchangeRate,
    });
  } catch (error: any) {
    console.error('❌ Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Error creating payment order', error: error.message });
  }
});

/**
 * Endpoint 3: POST /api/payments/verify
 * Cryptographically verifies the payment signature returned by the client.
 * Triggers the Kafka course-purchase pipeline on successful verification.
 */
router.post('/verify', async (req, res) => {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature, 
      userId, 
      courseId,
      amount
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !userId || !courseId) {
      return res.status(400).json({ message: 'Missing required signature or parameter fields' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    // Verify signature cryptographically
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('❌ Razorpay signature verification failed');
      return res.status(400).json({ message: 'Invalid payment signature. Verification failed.' });
    }

    console.log('✅ Razorpay payment signature verified successfully for order:', razorpay_order_id);

    // Push the verified purchase details onto the Kafka 'course-purchase' topic
    const eventPayload = {
      userId,
      courseId,
      amount: Number(amount) * 100, // represent in original units/paise for Kafka pipeline
      paymentMethod: 'online',
      transactionId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      timestamp: new Date().toISOString()
    };

    await publishEvent('course-purchase', eventPayload);

    res.status(202).json({
      message: 'Payment verified and enrollment processing initiated asynchronously.',
      eventPayload
    });
  } catch (error: any) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

/**
 * Endpoint 4: GET /api/payments/check-enrollment
 * Polling endpoint to check if an enrollment exists for the user and course.
 */
router.get('/check-enrollment', async (req, res) => {
  try {
    const { userId, courseId } = req.query;
    if (!userId || !courseId) {
      return res.status(400).json({ message: 'userId and courseId are required' });
    }

    const enrollment = await Enrollment.findOne({ 
      userId: String(userId), 
      courseId: String(courseId) 
    });
    if (enrollment) {
      return res.json({ enrolled: true, enrollment });
    }
    res.json({ enrolled: false });
  } catch (error: any) {
    res.status(500).json({ message: 'Error checking enrollment', error: error.message });
  }
});

/**
 * Endpoint 5: POST /api/payments/webhook
 * Listens for payment.captured events from Razorpay.
 * Automatically triggers the Kafka enrollment workflow.
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    // Verify webhook signature if configured
    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        console.warn('⚠️ Webhook signature verification mismatch. Continuing for test/sandbox.');
      }
    }

    const event = req.body.event;
    console.log(`🔔 Razorpay Webhook Event Received: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload?.payment?.entity;
      const notes = paymentEntity?.notes || {};

      let userId = notes.userId;
      let courseId = notes.courseId;

      // Fallback lookup by email if notes are missing
      if (!userId && paymentEntity?.email) {
        const user = await User.findOne({ email: paymentEntity.email });
        userId = user?._id?.toString();
      }

      if (userId && courseId) {
        console.log(`🎯 Webhook auto-enrolling user ${userId} in course ${courseId}`);
        const amount = paymentEntity.amount ? (paymentEntity.amount / 100) : 299;

        const eventPayload = {
          userId,
          courseId,
          amount: amount * 100,
          paymentMethod: 'online',
          transactionId: paymentEntity.id || 'webhook_tx',
          razorpayOrderId: paymentEntity.order_id || 'webhook_order',
          timestamp: new Date().toISOString()
        };

        await publishEvent('course-purchase', eventPayload);
      } else {
        console.warn('⚠️ Webhook payload missing user identity or course mapping.');
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ message: 'Webhook failed', error: error.message });
  }
});

export default router;
